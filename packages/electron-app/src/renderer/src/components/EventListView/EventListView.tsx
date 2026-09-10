import { Collection, Event } from '@awesome-dev-journal/shared'
import { useEffect, useState } from 'react'
import * as CollectionService from '@renderer/services/CollectionService'
import * as CollectionItemService from '@renderer/services/CollectionItemService'
import * as EventService from '@renderer/services/EventService'
import EventForm from '@renderer/components/EventForm/EventForm'
import MigrateSelect from '@renderer/components/MigrateSelect/MigrateSelect'
import styles from './EventListView.module.css'

interface EventListViewProps {
  collectionId: number
}

// A plain list-of-events collection (e.g. the default Event List, or any
// other EVENT-shaped collection) — no sub-collections, no tasks, just events.
function EventListView({ collectionId }: EventListViewProps) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [allCollections, setAllCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingEvent, setAddingEvent] = useState(false)
  const [showFinished, setShowFinished] = useState(false)

  // Default Event List isn't a real migration target — every event is always in it already.
  const eventCollections = allCollections.filter((c) => c.type !== 'DEFAULT' && c.subType !== 'TASK')
  const visibleEvents = showFinished ? events : events.filter((e) => e.status !== 'FINISHED')

  useEffect(() => {
    loadContent()
  }, [collectionId])

  const loadContent = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const [collectionData, eventData, collectionsList] = await Promise.all([
        CollectionService.getCollection(collectionId),
        EventService.getEventsByCollectionId(collectionId),
        CollectionService.getCollections()
      ])

      setCollection(collectionData)
      setEvents(eventData)
      setAllCollections(collectionsList)
    } catch (err) {
      console.error('Failed to load event list:', err)
      setError('Failed to load event list. Make sure the MCP server is running.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const completeEvent = async (eventId: number) => {
    try {
      await window.eventApi.completeEvent(eventId)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'FINISHED' } : e)))
    } catch (err) {
      console.error('Failed to complete event:', err)
    }
  }

  const migrateEvent = async (eventId: number, toCollectionId: number) => {
    try {
      await EventService.migrateEvent(eventId, toCollectionId)
      await loadContent(false)
    } catch (err) {
      console.error('Failed to migrate event:', err)
    }
  }

  const handleSaveEvent = async (event: Event) => {
    try {
      const newId = await EventService.addEvent(event)
      await CollectionItemService.addToCollection(collectionId, newId, 'Event')
      setAddingEvent(false)
      await loadContent(false)
    } catch (err) {
      console.error('Failed to add event:', err)
    }
  }

  const formatTime = (date: Date | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className={styles.eventListView}>
        <div className={styles.loading}>Loading event list...</div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className={styles.eventListView}>
        <div className={styles.error}>{error || 'Collection not found.'}</div>
        <button className={styles.retryButton} onClick={() => loadContent()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.eventListView}>
      <header className={styles.header}>
        <h1>{collection.title}</h1>
        {collection.description && <p className={styles.description}>{collection.description}</p>}
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Events ({visibleEvents.length})</h2>
          <div className={styles.sectionHeaderActions}>
            <label className={styles.showFinishedToggle}>
              <input
                type="checkbox"
                checked={showFinished}
                onChange={(e) => setShowFinished(e.target.checked)}
              />
              Show finished
            </label>
            <button onClick={() => setAddingEvent((prev) => !prev)}>
              {addingEvent ? 'Cancel' : 'Add Event'}
            </button>
          </div>
        </div>
        {addingEvent && <EventForm onSave={handleSaveEvent} onCancel={() => setAddingEvent(false)} />}
        {visibleEvents.length === 0 ? (
          <p className={styles.emptyMessage}>No events yet</p>
        ) : (
          <ul className={styles.itemList}>
            {visibleEvents.map((event) => (
              <li key={event.id} className={`${styles.item} ${event.status === 'FINISHED' ? styles.finished : ''}`}>
                <input
                  type="checkbox"
                  checked={event.status === 'FINISHED'}
                  onChange={() => completeEvent(event.id)}
                />
                <div className={styles.itemContent}>
                  <div className={styles.itemTitle}>{event.title}</div>
                  {event.description && <div className={styles.itemDescription}>{event.description}</div>}
                  <div className={styles.itemMeta}>
                    {event.scheduledDate && (
                      <span className={styles.itemTime}>🕒 {formatTime(event.scheduledDate)}</span>
                    )}
                    {event.location && <span className={styles.itemLocation}>📍 {event.location}</span>}
                    {event.link && (
                      <a href={event.link} target="_blank" rel="noopener noreferrer" className={styles.itemLink}>
                        🔗 Join
                      </a>
                    )}
                  </div>
                </div>
                <MigrateSelect
                  collections={eventCollections}
                  onMigrate={(toCollectionId) => migrateEvent(event.id, toCollectionId)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default EventListView
