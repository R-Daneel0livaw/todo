import { Router, Request, Response } from 'express'
import * as TaskTemplateManager from '../../database/TaskTemplateManager.js'
import * as TaskManager from '../../database/TaskManager.js'
import { TaskTemplate } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/task-templates - Get all task templates
router.get('/', (_req: Request, res: Response): void => {
  try {
    const templates = TaskTemplateManager.getAllTemplates()
    res.json(templates)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/task-templates/:id - Get template by ID
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const template = TaskTemplateManager.getTemplate(id)
    if (!template) {
      res.status(404).json({ error: 'Template not found' })
      return
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/task-templates/:id/instances - Get all instances of a template
router.get('/:id/instances', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const instances = TaskTemplateManager.getTemplateInstances(id)
    res.json(instances)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/task-templates/:id/stats - Get template statistics
router.get('/:id/stats', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const stats = TaskTemplateManager.getTemplateStats(id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/task-templates - Create new template
router.post('/', (req: Request, res: Response) => {
  try {
    const templateData = req.body as TaskTemplate
    const templateId = TaskTemplateManager.addTemplate(templateData)
    res.status(201).json({ id: templateId, message: 'Template created successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// PUT /api/task-templates/:id - Update template
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const templateData = { ...req.body, id }
    TaskTemplateManager.updateTemplate(templateData)
    res.json({ message: 'Template updated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/task-templates/:id - Delete template
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    TaskTemplateManager.deleteTemplate(id)
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/task-templates/:id/spawn - Spawn new instance from template
router.post('/:id/spawn', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const { collectionId } = req.body
    const taskId = TaskManager.spawnInstanceFromTemplate(id, collectionId)
    res.status(201).json({ taskId, message: 'Task instance spawned successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
