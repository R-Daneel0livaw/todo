import { Router, Request, Response } from 'express'
import * as TaskDependencyManager from '../../database/TaskDependencyManager.js'

const router = Router()

// GET /api/dependencies/task/:taskId - Get dependencies for a task
router.get('/task/:taskId', (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId)
    const dependencies = TaskDependencyManager.getTaskDependencies(taskId)
    res.json(dependencies)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/dependencies/task/:taskId/all - Get all dependencies (transitive)
router.get('/task/:taskId/all', (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId)
    const dependencies = TaskDependencyManager.getAllDependencies(taskId)
    res.json(dependencies)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/dependencies/task/:taskId/dependent - Get tasks that depend on this task
router.get('/task/:taskId/dependent', (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId)
    const dependentTasks = TaskDependencyManager.getDependentTasks(taskId)
    res.json(dependentTasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/dependencies/unblocked - Get all unblocked tasks
router.get('/unblocked', (req: Request, res: Response) => {
  try {
    const tasks = TaskDependencyManager.getUnblockedTasks()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/dependencies/blocked - Get all blocked tasks
router.get('/blocked', (req: Request, res: Response) => {
  try {
    const tasks = TaskDependencyManager.getBlockedTasks()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/dependencies/critical-path - Get critical path
router.get('/critical-path', (req: Request, res: Response) => {
  try {
    const tasks = TaskDependencyManager.getCriticalPath()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/dependencies - Add task dependency
router.post('/', (req: Request, res: Response) => {
  try {
    const { taskId, dependsOnTaskId, dependencyType, createdBy } = req.body

    if (!taskId || !dependsOnTaskId) {
      return res.status(400).json({ error: 'taskId and dependsOnTaskId are required' })
    }

    const id = TaskDependencyManager.addTaskDependency(
      taskId,
      dependsOnTaskId,
      dependencyType,
      createdBy
    )
    res.status(201).json({ id, message: 'Dependency added successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/dependencies/:id - Remove task dependency
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    TaskDependencyManager.removeTaskDependency(id)
    res.json({ message: 'Dependency removed successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
