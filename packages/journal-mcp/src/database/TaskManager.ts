import { Collection, Task } from '@awesome-dev-journal/shared'
import db from './sqlite.js'
import * as ItemMigrationHistoryManager from './ItemMigrationHistoryManager.js'
import * as TaskTemplateManager from './TaskTemplateManager.js'
import * as CollectionItemManager from './CollectionItemManager.js'

export function getAllTasks(): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY createDate DESC')
  return stmt.all() as Task[]
}

export function getTask(taskId: number): Task {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?')
  const task: Task = stmt.get(taskId) as Task
  return task
}

export function getTaskByCollectionId(taskId: number, collectionId: number): Task {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN collectionItems ci ON t.id = ci.itemId
    WHERE t.id = ? AND ci.collectionId = ?
  `)
  const task: Task = stmt.get(taskId, collectionId) as Task
  return task
}

export function getTasksByCollectionId(collectionId: number): Task[] {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN collectionItems ci ON t.id = ci.itemId
    WHERE ci.collectionId = ?
  `)
  const tasks: Task[] = stmt.all(collectionId) as Task[]
  return tasks
}

export function getTasksByCollection(collectionData: Partial<Collection>): Task[] {
  let query = `
    SELECT t.*
    FROM tasks t
    JOIN collectionItems ci ON t.id = ci.itemId
    JOIN collections c ON ci.collectionId = c.id
    WHERE ci.itemType = 'Task'
  `
  const params: (string | undefined)[] = []
  if (collectionData.type) {
    query += ' AND c.type = ?'
    params.push(collectionData.type)
  }
  if (collectionData.subType) {
    query += ' AND c.subType = ?'
    params.push(collectionData.subType)
  }

  const stmt = db.prepare(query)
  const tasks: Task[] = stmt.all(...params) as Task[]
  return tasks
}

export function addTask(taskData: Task): number {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, topic, status, createDate, startDate, metadata, template_id, instance_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    taskData.title,
    taskData.description,
    taskData.topic,
    taskData.status,
    taskData.createDate?.toISOString(),
    taskData.startDate?.toISOString(),
    taskData.metadata ? JSON.stringify(taskData.metadata) : null,
    taskData.template_id || null,
    taskData.instance_number || null
  )
  return result.lastInsertRowid as number
}

export function updateTask(taskData: Partial<Task> & { id: number }) {
  const fields: string[] = []
  const values: any[] = []

  if (taskData.title !== undefined) {
    fields.push('title = ?')
    values.push(taskData.title)
  }
  if (taskData.description !== undefined) {
    fields.push('description = ?')
    values.push(taskData.description)
  }
  if (taskData.topic !== undefined) {
    fields.push('topic = ?')
    values.push(taskData.topic)
  }
  if (taskData.status !== undefined) {
    fields.push('status = ?')
    values.push(taskData.status)
  }
  if (taskData.startDate !== undefined) {
    fields.push('startDate = ?')
    values.push(taskData.startDate?.toISOString())
  }
  if (taskData.endDate !== undefined) {
    fields.push('endDate = ?')
    values.push(taskData.endDate?.toISOString())
  }
  if (taskData.metadata !== undefined) {
    fields.push('metadata = ?')
    values.push(JSON.stringify(taskData.metadata))
  }

  if (fields.length === 0) return

  values.push(taskData.id)
  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`)
  stmt.run(...values)
}

export function completeTask(taskId: number) {
  const stmt = db.prepare('UPDATE tasks SET status = ?, endDate = ? WHERE id = ?')
  stmt.run('FINISHED', new Date().toISOString(), taskId)
}

export function deleteTask(taskId: number) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?')
  stmt.run(taskId)
}

export function cancelTask(taskId: number) {
  const stmt = db.prepare('UPDATE tasks SET status = ?, canceledDate = ? WHERE id = ?')
  stmt.run('CANCELED', new Date().toISOString(), taskId)
}

export function migrateTaskToCollection(
  taskId: number,
  toCollectionId: number,
  migratedBy?: string,
  reason?: string
) {
  const transaction = db.transaction(() => {
    // Get current collections for this task
    const getCurrentCollections = db.prepare(`
      SELECT collectionId FROM collectionItems
      WHERE itemId = ? AND itemType = 'Task'
    `)
    const currentCollections = getCurrentCollections.all(taskId) as { collectionId: number }[]

    // Record migration history for each current collection
    if (currentCollections.length > 0) {
      for (const collection of currentCollections) {
        ItemMigrationHistoryManager.recordMigration(
          taskId,
          'Task',
          collection.collectionId,
          toCollectionId,
          migratedBy,
          reason
        )
      }
    } else {
      // No previous collection (initial assignment)
      ItemMigrationHistoryManager.recordMigration(taskId, 'Task', null, toCollectionId, migratedBy, reason)
    }

    // Remove task from all current collections
    const removeStmt = db.prepare(`
      DELETE FROM collectionItems
      WHERE itemId = ? AND itemType = 'Task'
    `)
    removeStmt.run(taskId)

    // Add task to new collection
    const addStmt = db.prepare(`
      INSERT INTO collectionItems (collectionId, itemId, itemType)
      VALUES (?, ?, 'Task')
    `)
    addStmt.run(toCollectionId, taskId)

    // Update task status to MIGRATED if it was in a different collection
    if (currentCollections.length > 0 && !currentCollections.some((c) => c.collectionId === toCollectionId)) {
      const updateTask = db.prepare('UPDATE tasks SET status = ? WHERE id = ?')
      updateTask.run('MIGRATED', taskId)
    }
  })
  transaction()
}

/**
 * Spawn a new task instance from a template
 */
export function spawnInstanceFromTemplate(templateId: number, collectionId?: number): number {
  const template = TaskTemplateManager.getTemplate(templateId)

  // Get instance count
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE template_id = ?')
  const { count } = countStmt.get(templateId) as { count: number }

  // Create task instance
  const newTask: Task = {
    id: 0,
    title: template.title,
    description: template.description,
    topic: template.topic,
    status: 'CREATED',
    createDate: new Date(),
    startDate: undefined,
    endDate: undefined,
    canceledDate: undefined,
    metadata: template.metadata,
    template_id: templateId,
    instance_number: count + 1
  }

  const taskId = addTask(newTask)

  // Add to collection
  const targetCollection = collectionId || template.default_collection_id
  if (targetCollection) {
    CollectionItemManager.addToCollection(targetCollection, taskId, 'Task')
  }

  return taskId
}

/**
 * Complete a task instance and optionally spawn the next one
 */
export function completeTaskInstance(taskId: number): { completed: number; next?: number } {
  const task = getTask(taskId)

  // Complete the task
  completeTask(taskId)

  // If it has a template, check auto-spawn
  if (task.template_id) {
    const template = TaskTemplateManager.getTemplate(task.template_id)

    if (template.auto_spawn) {
      const nextId = spawnInstanceFromTemplate(task.template_id)
      return { completed: taskId, next: nextId }
    }
  }

  return { completed: taskId }
}
