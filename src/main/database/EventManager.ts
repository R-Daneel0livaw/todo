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

export function getEventsByCollection(collectionData: Partial<Collection>) {
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

export function addEvent(eventData: Event) {
  const stmt = db.prepare(
    'INSERT INTO events (title, description, location, status, createDate, startDate) VALUES (?, ?, ?, ?, ?, ?)'
  )
  stmt.run(
    eventData.title,
    eventData.description,
    eventData.location,
    eventData.status,
    eventData.createDate?.toISOString(),
    eventData.startDate?.toISOString()
  )
}

export function deleteEvent(eventId: number) {
  const stmt = db.prepare('DELETE FROM events WHERE id = ?')
  stmt.run(eventId)
}

export function cancelEvent(eventId: number) {
  const stmt = db.prepare('UPDATE events SET status = ?, canceledDate = ? WHERE id = ?')
  stmt.run('CANCELED', new Date().toISOString(), eventId)
}
