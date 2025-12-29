import { Collection, Event } from '@shared/types'
import db from './sqlite'

export function getEvent(eventId: number): Event {
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?')
  const event: Event = stmt.get(eventId) as Event
  return event
}

export function getEventByCollectionId(eventId: number, collectionId: number): Event {
  const stmt = db.prepare(`
    SELECT e.*
    FROM events e
    JOIN collectionItems ci ON e.id = ci.itemId
    WHERE e.id = ? AND ci.collectionId = ?
  `)
  const event: Event = stmt.get(eventId, collectionId) as Event
  return event
}

export function getEventsByCollectionId(collectionId: number): Event[] {
  const stmt = db.prepare(`
    SELECT e.*
    FROM events e
    JOIN collectionItems ci ON e.id = ci.itemId
    WHERE ci.collectionId = ?
  `)
  const events: Event[] = stmt.all(collectionId) as Event[]
  return events
}

export function getEventsByCollection(collectionData: Partial<Collection>): Event[] {
  let query = `
    SELECT e.*
    FROM events e
    JOIN collectionItems ci ON e.id = ci.itemId
    JOIN collections c ON ci.collectionId = c.id
    WHERE ci.itemType = 'Event'
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
  const events: Event[] = stmt.all(...params) as Event[]
  return events
}

export function addEvent(eventData: Event): number {
  const stmt = db.prepare(`
    INSERT INTO events (title, description, location, status, createDate, startDate, scheduledDate, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    eventData.title,
    eventData.description,
    eventData.location,
    eventData.status,
    eventData.createDate?.toISOString(),
    eventData.startDate?.toISOString(),
    eventData.scheduledDate?.toISOString(),
    eventData.metadata ? JSON.stringify(eventData.metadata) : null
  )
  return result.lastInsertRowid as number
}

export function updateEvent(eventData: Partial<Event> & { id: number }) {
  const fields: string[] = []
  const values: any[] = []

  if (eventData.title !== undefined) {
    fields.push('title = ?')
    values.push(eventData.title)
  }
  if (eventData.description !== undefined) {
    fields.push('description = ?')
    values.push(eventData.description)
  }
  if (eventData.location !== undefined) {
    fields.push('location = ?')
    values.push(eventData.location)
  }
  if (eventData.status !== undefined) {
    fields.push('status = ?')
    values.push(eventData.status)
  }
  if (eventData.startDate !== undefined) {
    fields.push('startDate = ?')
    values.push(eventData.startDate?.toISOString())
  }
  if (eventData.endDate !== undefined) {
    fields.push('endDate = ?')
    values.push(eventData.endDate?.toISOString())
  }
  if (eventData.scheduledDate !== undefined) {
    fields.push('scheduledDate = ?')
    values.push(eventData.scheduledDate?.toISOString())
  }
  if (eventData.metadata !== undefined) {
    fields.push('metadata = ?')
    values.push(JSON.stringify(eventData.metadata))
  }

  if (fields.length === 0) return

  values.push(eventData.id)
  const stmt = db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`)
  stmt.run(...values)
}

export function completeEvent(eventId: number) {
  const stmt = db.prepare('UPDATE events SET status = ?, endDate = ? WHERE id = ?')
  stmt.run('FINISHED', new Date().toISOString(), eventId)
}

export function deleteEvent(eventId: number) {
  const stmt = db.prepare('DELETE FROM events WHERE id = ?')
  stmt.run(eventId)
}

export function cancelEvent(eventId: number) {
  const stmt = db.prepare('UPDATE events SET status = ?, canceledDate = ? WHERE id = ?')
  stmt.run('CANCELED', new Date().toISOString(), eventId)
}
