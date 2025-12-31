import { Router, Request, Response } from 'express'
import * as ActivityManager from '../../database/ActivityManager.js'
import { ActivityType } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/activity - Get activity summary
router.get('/', (req: Request, res: Response) => {
  try {
    const { minutes, hours, days } = req.query
    const options: any = {}

    if (minutes) options.minutes = parseInt(minutes as string)
    if (hours) options.hours = parseInt(hours as string)
    if (days) options.days = parseInt(days as string)

    const activities = ActivityManager.getActivitySummary(options)
    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/activity/task/:taskId - Get activity for a task
router.get('/task/:taskId', (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId)
    const activities = ActivityManager.getActivityByTask(taskId)
    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/activity/event/:eventId - Get activity for an event
router.get('/event/:eventId', (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId)
    const activities = ActivityManager.getActivityByEvent(eventId)
    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/activity/type/:type - Get recent activity by type
router.get('/type/:type', (req: Request, res: Response) => {
  try {
    const type = req.params.type as ActivityType
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
    const activities = ActivityManager.getRecentActivityByType(type, limit)
    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/activity/suggestions - Get task completion suggestions
router.get('/suggestions', (req: Request, res: Response) => {
  try {
    const minutes = req.query.minutes ? parseInt(req.query.minutes as string) : 60
    const suggestions = ActivityManager.suggestTaskCompletion(minutes)
    res.json(suggestions)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/activity - Add activity
router.post('/', (req: Request, res: Response) => {
  try {
    const { type, source, data, relatedTaskId, relatedEventId } = req.body

    if (!type || !source || !data) {
      return res.status(400).json({ error: 'type, source, and data are required' })
    }

    const id = ActivityManager.addActivity(type, source, data, relatedTaskId, relatedEventId)
    res.status(201).json({ id, message: 'Activity recorded successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/activity/cleanup - Delete old activity
router.delete('/cleanup', (req: Request, res: Response) => {
  try {
    const daysToKeep = req.query.days ? parseInt(req.query.days as string) : 90
    ActivityManager.deleteOldActivity(daysToKeep)
    res.json({ message: `Activity older than ${daysToKeep} days deleted successfully` })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
