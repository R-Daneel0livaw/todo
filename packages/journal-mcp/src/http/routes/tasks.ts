import { Router, Request, Response } from 'express'
import * as TaskManager from '../../database/TaskManager.js'
import { Task } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/tasks - Get all tasks
router.get('/', (req: Request, res: Response) => {
  try {
    const tasks = TaskManager.getAllTasks()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const task = TaskManager.getTask(id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/tasks/collection/:collectionId - Get tasks by collection
router.get('/collection/:collectionId', (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.collectionId)
    const tasks = TaskManager.getTasksByCollectionId(collectionId)
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/tasks - Create new task
router.post('/', (req: Request, res: Response) => {
  try {
    const taskData = req.body as Task
    const taskId = TaskManager.addTask(taskData)
    res.status(201).json({ id: taskId, message: 'Task created successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// PUT /api/tasks/:id - Update task
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const taskData = { ...req.body, id }
    TaskManager.updateTask(taskData)
    res.json({ message: 'Task updated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    TaskManager.deleteTask(id)
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/tasks/:id/complete - Complete task
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    TaskManager.completeTask(id)
    res.json({ message: 'Task completed successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/tasks/:id/cancel - Cancel task
router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    TaskManager.cancelTask(id)
    res.json({ message: 'Task canceled successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/tasks/:id/migrate - Migrate task
router.post('/:id/migrate', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { toTaskId } = req.body
    if (!toTaskId) {
      return res.status(400).json({ error: 'toTaskId is required' })
    }
    TaskManager.migrateTask(id, toTaskId)
    res.json({ message: 'Task migrated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
