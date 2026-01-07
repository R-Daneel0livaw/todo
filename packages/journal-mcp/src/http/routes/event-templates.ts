import { Router, Request, Response } from 'express'
import * as EventTemplateManager from '../../database/EventTemplateManager.js'
import * as EventManager from '../../database/EventManager.js'
import { EventTemplate } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/event-templates - Get all event templates
router.get('/', (_req: Request, res: Response): void => {
  try {
    const templates = EventTemplateManager.getAllTemplates()
    res.json(templates)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/event-templates/:id - Get template by ID
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const template = EventTemplateManager.getTemplate(id)
    if (!template) {
      res.status(404).json({ error: 'Template not found' })
      return
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/event-templates/:id/instances - Get all instances of a template
router.get('/:id/instances', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const instances = EventTemplateManager.getTemplateInstances(id)
    res.json(instances)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/event-templates/:id/stats - Get template statistics
router.get('/:id/stats', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const stats = EventTemplateManager.getTemplateStats(id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/event-templates - Create new template
router.post('/', (req: Request, res: Response) => {
  try {
    const templateData = req.body as EventTemplate
    const templateId = EventTemplateManager.addTemplate(templateData)
    res.status(201).json({ id: templateId, message: 'Template created successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// PUT /api/event-templates/:id - Update template
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const templateData = { ...req.body, id }
    EventTemplateManager.updateTemplate(templateData)
    res.json({ message: 'Template updated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/event-templates/:id - Delete template
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    EventTemplateManager.deleteTemplate(id)
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/event-templates/:id/spawn - Spawn new instance from template
router.post('/:id/spawn', (req: Request, res: Response): void => {
  try {
    const id = parseInt(req.params.id)
    const { collectionId } = req.body
    const eventId = EventManager.spawnInstanceFromTemplate(id, collectionId)
    res.status(201).json({ eventId, message: 'Event instance spawned successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
