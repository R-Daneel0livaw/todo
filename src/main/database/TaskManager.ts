import { Collection, Task } from '@shared/types'
import db from './sqlite'

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

export function getTasksByCollection(collectionData: Partial<Collection>) {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN collectionItems ci ON t.id = ci.itemId
    JOIN collections c ON ci.collectionId = c.id
    WHERE c.type = ? AND c.subType = ? AND ci.itemType = 'Task'
  `)
  const tasks: Task[] = stmt.all(collectionData.type, collectionData.subType) as Task[]
  return tasks
}

export function addTask(taskData: Task) {
  const stmt = db.prepare(
    'INSERT INTO tasks (title, description, topic, status, createDate, startDate) VALUES (?, ?, ?, ?, ?, ?)'
  )
  stmt.run(
    taskData.title,
    taskData.description,
    taskData.topic,
    taskData.status,
    taskData.createDate?.toISOString(),
    taskData.startDate?.toISOString()
  )
}

export function deleteTask(taskId: number) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?')
  stmt.run(taskId)
}

export function cancelTask(taskId: number) {
  const stmt = db.prepare('UPDATE tasks SET status = ?, canceledDate = ? WHERE id = ?')
  stmt.run('CANCELED', new Date().toISOString(), taskId)
}
