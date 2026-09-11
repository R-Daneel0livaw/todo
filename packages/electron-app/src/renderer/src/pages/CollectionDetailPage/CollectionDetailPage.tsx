import { Collection, Event, Task } from '@awesome-dev-journal/shared'
import { useEffect, useState } from 'react'
import * as CollectionService from '@renderer/services/CollectionService'
import * as CollectionItemService from '@renderer/services/CollectionItemService'
import * as TaskService from '@renderer/services/TaskService'
import * as EventService from '@renderer/services/EventService'
import CollectionView from '@renderer/components/CollectionView/CollectionView'
import CollectionForm from '@renderer/components/CollectionForm/CollectionForm'
import TaskForm from '@renderer/components/TaskForm/TaskForm'
import EventForm from '@renderer/components/EventForm/EventForm'
import MigrateSelect from '@renderer/components/MigrateSelect/MigrateSelect'
import DailyView from '@renderer/components/DailyView/DailyView'
import TaskListView from '@renderer/components/TaskListView/TaskListView'
import EventListView from '@renderer/components/EventListView/EventListView'
import { Route } from '@renderer/navigation/types'
import styles from './CollectionDetailPage.module.css'

interface CollectionDetailPageProps {
  collectionId: number
  onNavigate: (route: Route) => void
}

function CollectionDetailPage({ collectionId, onNavigate }: CollectionDetailPageProps) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [subCollections, setSubCollections] = useState<Collection[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [allCollections, setAllCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [addingTask, setAddingTask] = useState(false)
  const [addingEvent, setAddingEvent] = useState(false)
  const [addingSubCollection, setAddingSubCollection] = useState(false)

  // Default Task List/Event List aren't real migration targets — every item
  // is always in them already. Nor is this collection itself — you can't
  // move to where you already are.
  const taskCollections = allCollections.filter(
    (c) => c.type !== 'DEFAULT' && c.subType !== 'EVENT' && c.id !== collectionId
  )
  const eventCollections = allCollections.filter(
    (c) => c.type !== 'DEFAULT' && c.subType !== 'TASK' && c.id !== collectionId
  )

  useEffect(() => {
    loadCollectionDetail()
  }, [collectionId])

  const loadCollectionDetail = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const [collectionData, taskData, eventData, items, collectionsList] = await Promise.all([
        CollectionService.getCollection(collectionId),
        TaskService.getTasksByCollectionId(collectionId),
        EventService.getEventsByCollectionId(collectionId),
        CollectionItemService.getCollectionItems(collectionId),
        CollectionService.getCollections()
      ])

      setCollection(collectionData)
      setTasks(taskData)
      setEvents(eventData)
      setAllCollections(collectionsList)

      const childCollectionIds = items
        .filter((item) => item.itemType === 'Collection')
        .map((item) => item.itemId)
      const children = await Promise.all(
        childCollectionIds.map((id) => CollectionService.getCollection(id))
      )
      setSubCollections(children)
    } catch (err) {
      console.error('Failed to load collection:', err)
      setError('Failed to load collection. Make sure the MCP server is running.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const openSubCollection = (child: Collection) => {
    onNavigate({ page: 'collection-detail', collectionId: child.id, label: child.title })
  }

  const handleSaveTask = async (task: Task) => {
    const newId = await TaskService.addTask(task)
    await CollectionItemService.addToCollection(collectionId, newId, 'Task')
    setAddingTask(false)
    await loadCollectionDetail(false)
  }

  const handleSaveEvent = async (event: Event) => {
    const newId = await EventService.addEvent(event)
    await CollectionItemService.addToCollection(collectionId, newId, 'Event')
    setAddingEvent(false)
    await loadCollectionDetail(false)
  }

  const handleSaveSubCollection = async (newCollection: Collection) => {
    const saved = await CollectionService.addAndRetrieveCollection(newCollection)
    await CollectionItemService.addToCollection(collectionId, saved.id, 'Collection')
    setAddingSubCollection(false)
    await loadCollectionDetail(false)
  }

  const migrateTask = async (taskId: number, toCollectionId: number) => {
    try {
      await TaskService.migrateTask(taskId, toCollectionId)
      await loadCollectionDetail(false)
    } catch (err) {
      console.error('Failed to migrate task:', err)
    }
  }

  const migrateEvent = async (eventId: number, toCollectionId: number) => {
    try {
      await EventService.migrateEvent(eventId, toCollectionId)
      await loadCollectionDetail(false)
    } catch (err) {
      console.error('Failed to migrate event:', err)
    }
  }

  const completeTask = async (taskId: number) => {
    await window.taskApi.completeTask(taskId)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'FINISHED' } : t)))
  }

  const completeEvent = async (eventId: number) => {
    await window.eventApi.completeEvent(eventId)
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'FINISHED' } : e)))
  }

  if (loading) {
    return (
      <div className={styles.collectionDetailPage}>
        <div className={styles.loading}>Loading collection...</div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className={styles.collectionDetailPage}>
        <div className={styles.error}>{error || 'Collection not found.'}</div>
        <button className={styles.retryButton} onClick={() => loadCollectionDetail()}>
          Retry
        </button>
      </div>
    )
  }

  // A "Daily" (type=DAILY, no subType) always has the same Plan/Log shape —
  // show the same view used everywhere a Daily is opened, rather than the
  // generic sub-collections/tasks/events browser.
  if (collection.type === 'DAILY' && !collection.subType) {
    return <DailyView initialDailyId={collectionId} />
  }

  // The default Task List / Event List are plain single-purpose lists —
  // no sub-collections, no mixing tasks into an event list or vice versa.
  if (collection.type === 'DEFAULT' && collection.subType === 'TASK') {
    return <TaskListView collectionId={collectionId} />
  }
  if (collection.type === 'DEFAULT' && collection.subType === 'EVENT') {
    return <EventListView collectionId={collectionId} />
  }

  return (
    <div className={styles.collectionDetailPage}>
      <header className={styles.header}>
        <h1>{collection.title}</h1>
        {collection.description && <p className={styles.description}>{collection.description}</p>}
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Sub-Collections ({subCollections.length})</h2>
          <button onClick={() => setAddingSubCollection((prev) => !prev)}>
            {addingSubCollection ? 'Cancel' : 'Add Sub-Collection'}
          </button>
        </div>
        {addingSubCollection && (
          <CollectionForm onSave={handleSaveSubCollection} onCancel={() => setAddingSubCollection(false)} />
        )}
        {subCollections.length === 0 ? (
          <p className={styles.emptyMessage}>No sub-collections yet</p>
        ) : (
          <ul className={styles.subCollectionList}>
            {subCollections.map((child) => (
              <li key={child.id} onClick={() => openSubCollection(child)} className={styles.subCollectionItem}>
                <CollectionView collection={child} isExpanded={false} onExpand={() => openSubCollection(child)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Tasks ({tasks.length})</h2>
            <button onClick={() => setAddingTask((prev) => !prev)}>
              {addingTask ? 'Cancel' : 'Add Task'}
            </button>
          </div>
          {addingTask && <TaskForm onSave={handleSaveTask} onCancel={() => setAddingTask(false)} />}
          {tasks.length === 0 ? (
            <p className={styles.emptyMessage}>No tasks in this collection</p>
          ) : (
            <ul className={styles.itemList}>
              {tasks.map((task) => (
                <li key={task.id} className={`${styles.item} ${task.status === 'FINISHED' ? styles.finished : ''}`}>
                  <input
                    type="checkbox"
                    checked={task.status === 'FINISHED'}
                    onChange={() => completeTask(task.id)}
                  />
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{task.title}</div>
                    {task.description && <div className={styles.itemDescription}>{task.description}</div>}
                  </div>
                  {task.status !== 'FINISHED' && (
                    <MigrateSelect
                      collections={taskCollections}
                      onMigrate={(toCollectionId) => migrateTask(task.id, toCollectionId)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Events ({events.length})</h2>
            <button onClick={() => setAddingEvent((prev) => !prev)}>
              {addingEvent ? 'Cancel' : 'Add Event'}
            </button>
          </div>
          {addingEvent && <EventForm onSave={handleSaveEvent} onCancel={() => setAddingEvent(false)} />}
          {events.length === 0 ? (
            <p className={styles.emptyMessage}>No events in this collection</p>
          ) : (
            <ul className={styles.itemList}>
              {events.map((event) => (
                <li key={event.id} className={`${styles.item} ${event.status === 'FINISHED' ? styles.finished : ''}`}>
                  <input
                    type="checkbox"
                    checked={event.status === 'FINISHED'}
                    onChange={() => completeEvent(event.id)}
                  />
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{event.title}</div>
                    {event.description && <div className={styles.itemDescription}>{event.description}</div>}
                  </div>
                  {event.status !== 'FINISHED' && (
                    <MigrateSelect
                      collections={eventCollections}
                      onMigrate={(toCollectionId) => migrateEvent(event.id, toCollectionId)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default CollectionDetailPage
