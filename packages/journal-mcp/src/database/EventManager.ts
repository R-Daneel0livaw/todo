import { Collection, Event } from '@awesome-dev-journal/shared'
import db from './sqlite.js'
import * as ItemMigrationHistoryManager from './ItemMigrationHistoryManager.js'
import * as EventTemplateManager from './EventTemplateManager.js'
import * as CollectionItemManager from './CollectionItemManager.js'

export function getAllEvents(): Event[] {
  const stmt = db.prepare('SELECT * FROM events ORDER BY createDate DESC')
  return stmt.all() as Event[]
}

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
    INSERT INTO events (title, description, location, link, status, createDate, startDate, scheduledDate, metadata, template_id, instance_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    eventData.title,
    eventData.description,
    eventData.location,
    eventData.link,
    eventData.status,
    eventData.createDate?.toISOString(),
    eventData.startDate?.toISOString(),
    eventData.scheduledDate?.toISOString(),
    eventData.metadata ? JSON.stringify(eventData.metadata) : null,
    eventData.template_id || null,
    eventData.instance_number || null
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
  if (eventData.link !== undefined) {
    fields.push('link = ?')
    values.push(eventData.link)
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

export function migrateEventToCollection(
  eventId: number,
  toCollectionId: number,
  migratedBy?: string,
  reason?: string
) {
  const transaction = db.transaction(() => {
    // Get current collections for this event
    const getCurrentCollections = db.prepare(`
      SELECT collectionId FROM collectionItems
      WHERE itemId = ? AND itemType = 'Event'
    `)
    const currentCollections = getCurrentCollections.all(eventId) as { collectionId: number }[]

    // Record migration history for each current collection
    if (currentCollections.length > 0) {
      for (const collection of currentCollections) {
        ItemMigrationHistoryManager.recordMigration(
          eventId,
          'Event',
          collection.collectionId,
          toCollectionId,
          migratedBy,
          reason
        )
      }
    } else {
      // No previous collection (initial assignment)
      ItemMigrationHistoryManager.recordMigration(eventId, 'Event', null, toCollectionId, migratedBy, reason)
    }

    // Remove event from all current collections
    const removeStmt = db.prepare(`
      DELETE FROM collectionItems
      WHERE itemId = ? AND itemType = 'Event'
    `)
    removeStmt.run(eventId)

    // Add event to new collection
    const addStmt = db.prepare(`
      INSERT INTO collectionItems (collectionId, itemId, itemType)
      VALUES (?, ?, 'Event')
    `)
    addStmt.run(toCollectionId, eventId)

    // Update event status to MIGRATED if it was in a different collection
    if (currentCollections.length > 0 && !currentCollections.some((c) => c.collectionId === toCollectionId)) {
      const updateEvent = db.prepare('UPDATE events SET status = ? WHERE id = ?')
      updateEvent.run('MIGRATED', eventId)
    }
  })
  transaction()
}

/**
 * Spawn a new event instance from a template
 */
export function spawnInstanceFromTemplate(templateId: number, collectionId?: number): number {
  const template = EventTemplateManager.getTemplate(templateId)

  // Get instance count
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM events WHERE template_id = ?')
  const { count } = countStmt.get(templateId) as { count: number }

  // Create event instance
  const newEvent: Event = {
    id: 0,
    title: template.title,
    description: template.description,
    location: template.location,
    link: template.link,
    status: 'CREATED',
    createDate: new Date(),
    startDate: undefined,
    endDate: undefined,
    canceledDate: undefined,
    scheduledDate: undefined,
    metadata: template.metadata,
    template_id: templateId,
    instance_number: count + 1
  }

  const eventId = addEvent(newEvent)

  // Add to collection
  const targetCollection = collectionId || template.default_collection_id
  if (targetCollection) {
    CollectionItemManager.addToCollection(targetCollection, eventId, 'Event')
  }

  return eventId
}

/**
 * Complete an event instance and optionally spawn the next one
 */
export function completeEventInstance(eventId: number): { completed: number; next?: number } {
  const event = getEvent(eventId)

  // Complete the event
  completeEvent(eventId)

  // If it has a template, check auto-spawn
  if (event.template_id) {
    const template = EventTemplateManager.getTemplate(event.template_id)

    if (template.auto_spawn) {
      const nextId = spawnInstanceFromTemplate(event.template_id)
      return { completed: eventId, next: nextId }
    }
  }

  return { completed: eventId }
}
