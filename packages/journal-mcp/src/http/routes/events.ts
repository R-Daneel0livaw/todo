import { Router, Request, Response } from 'express'
import * as EventManager from '../../database/EventManager.js'
import { Event } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/events - Get all events
router.get('/', (req: Request, res: Response) => {
  try {
    const events = EventManager.getAllEvents()
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/events/:id - Get event by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const event = EventManager.getEvent(id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/events/collection/:collectionId - Get events by collection
router.get('/collection/:collectionId', (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.collectionId)
    const events = EventManager.getEventsByCollectionId(collectionId)
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/events - Create new event
router.post('/', (req: Request, res: Response) => {
  try {
    const eventData = req.body as Event
    const eventId = EventManager.addEvent(eventData)
    res.status(201).json({ id: eventId, message: 'Event created successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// PUT /api/events/:id - Update event
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const eventData = { ...req.body, id }
    EventManager.updateEvent(eventData)
    res.json({ message: 'Event updated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/events/:id - Delete event
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    EventManager.deleteEvent(id)
    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/events/:id/complete - Complete event
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    EventManager.completeEvent(id)
    res.json({ message: 'Event completed successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/events/:id/cancel - Cancel event
router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    EventManager.cancelEvent(id)
    res.json({ message: 'Event canceled successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
