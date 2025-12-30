import { Collection, Task } from '@awesome-dev-journal/shared'
import db from './sqlite.js'

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
    INSERT INTO tasks (title, description, topic, status, createDate, startDate, metadata, migrated_from_id, migrated_to_id)
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
    taskData.migrated_from_id || null,
    taskData.migrated_to_id || null
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
  if (taskData.migrated_from_id !== undefined) {
    fields.push('migrated_from_id = ?')
    values.push(taskData.migrated_from_id)
  }
  if (taskData.migrated_to_id !== undefined) {
    fields.push('migrated_to_id = ?')
    values.push(taskData.migrated_to_id)
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

export function migrateTask(taskId: number, toTaskId: number) {
  const transaction = db.transaction(() => {
    // Update the original task's migrated_to_id
    const updateOriginal = db.prepare('UPDATE tasks SET migrated_to_id = ?, status = ? WHERE id = ?')
    updateOriginal.run(toTaskId, 'MIGRATED', taskId)

    // Update the new task's migrated_from_id
    const updateNew = db.prepare('UPDATE tasks SET migrated_from_id = ? WHERE id = ?')
    updateNew.run(taskId, toTaskId)
  })
  transaction()
}
