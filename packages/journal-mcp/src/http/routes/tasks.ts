import { Router, Request, Response } from 'express'
import * as TaskManager from '../../database/TaskManager.js'
import { Task } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/tasks - Get all tasks
router.get('/', (_req: Request, res: Response): void => {
  try {
    const tasks = TaskManager.getAllTasks()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const task = TaskManager.getTask(id)
    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
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

// GET /api/tasks/:taskId/collection/:collectionId - Get task by both task ID and collection ID
router.get('/:taskId/collection/:collectionId', (req: Request, res: Response): void => {
  try {
    const taskId = parseInt(req.params.taskId)
    const collectionId = parseInt(req.params.collectionId)
    const task = TaskManager.getTaskByCollectionId(taskId, collectionId)
    if (!task) {
      res.status(404).json({ error: 'Task not found in collection' })
      return
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/tasks/by-collection-type - Get tasks filtered by collection type/subtype
router.get('/by-collection-type', (req: Request, res: Response) => {
  try {
    const { type, subType } = req.query
    const collectionData: any = {}
    if (type) collectionData.type = type
    if (subType) collectionData.subType = subType

    const tasks = TaskManager.getTasksByCollection(collectionData)
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

// POST /api/tasks/:id/migrate - Migrate task to another collection
router.post('/:id/migrate', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const { toCollectionId, migratedBy, reason } = req.body
    if (!toCollectionId) {
      res.status(400).json({ error: 'toCollectionId is required' })
      return
    }
    TaskManager.migrateTaskToCollection(id, toCollectionId, migratedBy, reason)
    res.json({ message: 'Task migrated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
