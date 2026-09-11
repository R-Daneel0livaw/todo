import { useEffect, useState } from 'react'
import { Collection, CollectionItem, Event, ItemMigrationHistory, Task } from '@awesome-dev-journal/shared'
import * as CollectionService from '@renderer/services/CollectionService'
import * as CollectionItemService from '@renderer/services/CollectionItemService'
import * as TaskService from '@renderer/services/TaskService'
import * as EventService from '@renderer/services/EventService'
import * as MigrationHistoryService from '@renderer/services/MigrationHistoryService'
import TaskForm from '@renderer/components/TaskForm/TaskForm'
import EventForm from '@renderer/components/EventForm/EventForm'
import MigrateSelect from '@renderer/components/MigrateSelect/MigrateSelect'
import { getDateParts, isSameDay } from '@renderer/utils/utils'
import './DailyView.css'

interface CarryOverCandidate {
  id: number
  title: string
  itemType: 'Task' | 'Event'
  source: 'Plan' | 'Log'
}

interface MigratedAwayItem {
  id: number
  itemType: 'Task' | 'Event'
  title: string
  toCollectionTitle: string
}

interface PlanEntry {
  itemId: number
  itemType: 'Task' | 'Event'
  task?: Task
  event?: Event
}

interface DailyViewProps {
  // Which Daily to land on initially. Omit to land on the most recent one
  // (the "Daily Log" nav destination's default behavior).
  initialDailyId?: number
}

function DailyView({ initialDailyId }: DailyViewProps) {
  const [dailies, setDailies] = useState<Collection[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allCollections, setAllCollections] = useState<Collection[]>([])

  const [planCollection, setPlanCollection] = useState<Collection | null>(null)
  const [logCollection, setLogCollection] = useState<Collection | null>(null)
  const [planTasks, setPlanTasks] = useState<Task[]>([])
  const [planEvents, setPlanEvents] = useState<Event[]>([])
  const [logTasks, setLogTasks] = useState<Task[]>([])
  const [logEvents, setLogEvents] = useState<Event[]>([])
  const [planMigratedAway, setPlanMigratedAway] = useState<MigratedAwayItem[]>([])
  const [logMigratedAway, setLogMigratedAway] = useState<MigratedAwayItem[]>([])
  const [planItemOrder, setPlanItemOrder] = useState<CollectionItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingTask, setAddingTask] = useState(false)
  const [addingEvent, setAddingEvent] = useState(false)

  const [creatingDaily, setCreatingDaily] = useState(false)
  const [carryOverCandidates, setCarryOverCandidates] = useState<CarryOverCandidate[]>([])
  const [selectedCarryOver, setSelectedCarryOver] = useState<Set<string>>(new Set())

  const daily = dailies[currentIndex] ?? null
  const isLatest = currentIndex === 0
  const isToday = daily ? isSameDay(daily.createDate, new Date()) : false
  const showCreatePrompt = isLatest && !isToday

  // Default Task List/Event List aren't real migration targets — every item
  // is always in them already.
  const taskCollections = allCollections.filter((c) => c.type !== 'DEFAULT' && c.subType !== 'EVENT')
  const eventCollections = allCollections.filter((c) => c.type !== 'DEFAULT' && c.subType !== 'TASK')

  // Nor is the collection an item is already sitting in — moving "to" where
  // it already is isn't a real option.
  const planTaskCollections = taskCollections.filter((c) => c.id !== planCollection?.id)
  const planEventCollections = eventCollections.filter((c) => c.id !== planCollection?.id)
  const logTaskCollections = taskCollections.filter((c) => c.id !== logCollection?.id)
  const logEventCollections = eventCollections.filter((c) => c.id !== logCollection?.id)

  // Plan is priority-ordered (bullet-journal ranking), unlike every other
  // list in the app — derive one combined, ordered Task+Event sequence from
  // the collection-item rows (which carry sortOrder) instead of rendering
  // tasks and events as two separate lists.
  const planEntries: PlanEntry[] = planItemOrder
    .filter((item) => item.itemType === 'Task' || item.itemType === 'Event')
    .map((item) => ({
      itemId: item.itemId,
      itemType: item.itemType as 'Task' | 'Event',
      task: item.itemType === 'Task' ? planTasks.find((t) => t.id === item.itemId) : undefined,
      event: item.itemType === 'Event' ? planEvents.find((e) => e.id === item.itemId) : undefined
    }))
    .filter((entry) => entry.task || entry.event)

  useEffect(() => {
    loadDailies(true)
  }, [])

  useEffect(() => {
    if (daily) loadDailyContent(daily.id)
  }, [daily?.id])

  const loadDailies = async (useInitial = false) => {
    try {
      setLoading(true)
      setError(null)

      const collections = await CollectionService.getCollections()
      setAllCollections(collections)

      const dailyCollections = collections
        .filter((c) => c.type === 'DAILY' && !c.subType)
        .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())

      setDailies(dailyCollections)

      const initialIndex =
        useInitial && initialDailyId != null
          ? dailyCollections.findIndex((c) => c.id === initialDailyId)
          : -1
      setCurrentIndex(initialIndex >= 0 ? initialIndex : 0)

      // If there's no Daily at all, there's nothing else to load.
      if (dailyCollections.length === 0) {
        setPlanCollection(null)
        setLogCollection(null)
        setPlanTasks([])
        setPlanEvents([])
        setLogTasks([])
        setLogEvents([])
        setLoading(false)
      }
      // Otherwise the [daily?.id] effect picks up and loads its content.
    } catch (err) {
      console.error('Failed to load daily logs:', err)
      setError('Failed to load daily logs. Make sure the MCP server is running.')
      setLoading(false)
    }
  }

  const resolveMigratedAway = async (
    migrations: ItemMigrationHistory[],
    itemType: 'Task' | 'Event',
    excludeToCollectionId?: number
  ): Promise<MigratedAwayItem[]> => {
    // getMigrationsFromCollection is already ordered newest-first, so keeping
    // only the first occurrence per item gives the most recent departure.
    const seen = new Set<number>()
    const relevant = migrations.filter((m) => {
      if (excludeToCollectionId != null && m.to_collection_id === excludeToCollectionId) return false
      if (seen.has(m.item_id)) return false
      seen.add(m.item_id)
      return true
    })

    const hydrated = await Promise.all(
      relevant.map(async (m): Promise<MigratedAwayItem | null> => {
        try {
          const item =
            itemType === 'Task'
              ? await TaskService.getTask(m.item_id)
              : await EventService.getEvent(m.item_id)
          const toCollection = allCollections.find((c) => c.id === m.to_collection_id)
          return {
            id: m.item_id,
            itemType,
            title: item.title,
            toCollectionTitle: toCollection?.title ?? 'another collection'
          }
        } catch {
          // The item or destination collection may have since been deleted.
          return null
        }
      })
    )

    return hydrated.filter((item): item is MigratedAwayItem => item !== null)
  }

  const loadDailyContent = async (dailyId: number, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const items = await CollectionItemService.getCollectionItems(dailyId)
      const childIds = items.filter((item) => item.itemType === 'Collection').map((item) => item.itemId)
      const children = await Promise.all(childIds.map((id) => CollectionService.getCollection(id)))
      const plan = children.find((c) => c.subType === 'PLAN') ?? null
      const log = children.find((c) => c.subType === 'LOG') ?? null
      setPlanCollection(plan)
      setLogCollection(log)

      const [pt, pe, lt, le, planItems] = await Promise.all([
        plan ? TaskService.getTasksByCollectionId(plan.id) : Promise.resolve([]),
        plan ? EventService.getEventsByCollectionId(plan.id) : Promise.resolve([]),
        log ? TaskService.getTasksByCollectionId(log.id) : Promise.resolve([]),
        log ? EventService.getEventsByCollectionId(log.id) : Promise.resolve([]),
        plan ? CollectionItemService.getCollectionItems(plan.id) : Promise.resolve([])
      ])
      setPlanTasks(pt)
      setPlanEvents(pe)
      setLogTasks(lt)
      setLogEvents(le)
      setPlanItemOrder(planItems)

      // Items that used to live here but got migrated elsewhere — shown as a
      // "migrated away" mark, like the > notation in a physical bullet
      // journal, instead of just silently vanishing.
      const [planTaskMigrations, planEventMigrations, logTaskMigrations, logEventMigrations] = await Promise.all([
        plan ? MigrationHistoryService.getMigrationsFromCollection(plan.id, 'Task') : Promise.resolve([]),
        plan ? MigrationHistoryService.getMigrationsFromCollection(plan.id, 'Event') : Promise.resolve([]),
        log ? MigrationHistoryService.getMigrationsFromCollection(log.id, 'Task') : Promise.resolve([]),
        log ? MigrationHistoryService.getMigrationsFromCollection(log.id, 'Event') : Promise.resolve([])
      ])

      // Moving Plan -> this same Daily's Log ("Start") isn't a real
      // migration in the bullet-journal sense — it's already visible in Log.
      const [planMigratedTasks, planMigratedEvents, logMigratedTasks, logMigratedEvents] = await Promise.all([
        resolveMigratedAway(planTaskMigrations, 'Task', log?.id),
        resolveMigratedAway(planEventMigrations, 'Event', log?.id),
        resolveMigratedAway(logTaskMigrations, 'Task'),
        resolveMigratedAway(logEventMigrations, 'Event')
      ])
      setPlanMigratedAway([...planMigratedTasks, ...planMigratedEvents])
      setLogMigratedAway([...logMigratedTasks, ...logMigratedEvents])
    } catch (err) {
      console.error('Failed to load daily content:', err)
      setError('Failed to load daily content. Make sure the MCP server is running.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const goToPreviousDay = () => {
    setAddingTask(false)
    setAddingEvent(false)
    setCurrentIndex((prev) => Math.min(prev + 1, dailies.length - 1))
  }

  const goToNextDay = () => {
    setAddingTask(false)
    setAddingEvent(false)
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const startTask = async (taskId: number) => {
    if (!daily || !logCollection) return
    try {
      await TaskService.migrateTask(taskId, logCollection.id)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to start task:', err)
    }
  }

  const startEvent = async (eventId: number) => {
    if (!daily || !logCollection) return
    try {
      await EventService.migrateEvent(eventId, logCollection.id)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to start event:', err)
    }
  }

  const movePlanItem = async (index: number, direction: -1 | 1) => {
    if (!planCollection) return
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= planEntries.length) return

    // Reorder by identity (itemId + itemType) against the actual rendered
    // list, rather than assuming planItemOrder and planEntries stay
    // index-aligned — safer if a row ever fails to resolve to a task/event.
    const reorderedEntries = [...planEntries]
    const [moved] = reorderedEntries.splice(index, 1)
    reorderedEntries.splice(newIndex, 0, moved)

    const reorderedItems = reorderedEntries.map(
      (entry) =>
        planItemOrder.find((item) => item.itemId === entry.itemId && item.itemType === entry.itemType) ?? {
          id: 0,
          collectionId: planCollection.id,
          itemId: entry.itemId,
          itemType: entry.itemType
        }
    )
    setPlanItemOrder(reorderedItems) // optimistic — avoids waiting on a round trip for a simple swap

    try {
      await CollectionItemService.reorderCollectionItems(
        planCollection.id,
        reorderedItems.map((item) => ({ itemId: item.itemId, itemType: item.itemType }))
      )
    } catch (err) {
      console.error('Failed to reorder plan:', err)
      if (daily) await loadDailyContent(daily.id, false)
    }
  }

  const migrateTask = async (taskId: number, toCollectionId: number) => {
    if (!daily) return
    try {
      await TaskService.migrateTask(taskId, toCollectionId)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to migrate task:', err)
    }
  }

  const migrateEvent = async (eventId: number, toCollectionId: number) => {
    if (!daily) return
    try {
      await EventService.migrateEvent(eventId, toCollectionId)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to migrate event:', err)
    }
  }

  const completeTask = async (taskId: number) => {
    try {
      await window.taskApi.completeTask(taskId)
      setLogTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'FINISHED' } : t)))
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  const completeEvent = async (eventId: number) => {
    try {
      await window.eventApi.completeEvent(eventId)
      setLogEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'FINISHED' } : e)))
    } catch (err) {
      console.error('Failed to complete event:', err)
    }
  }

  const handleSaveTask = async (task: Task) => {
    // On today's Daily, new items are freshly planned (Plan). On a past day,
    // there's nothing left to plan — adding one means logging something you
    // forgot to record, so it goes straight into Log.
    const targetCollection = isToday ? planCollection : logCollection
    if (!daily || !targetCollection) return
    try {
      const newId = await TaskService.addTask(task)
      await CollectionItemService.addToCollection(targetCollection.id, newId, 'Task')
      setAddingTask(false)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  const handleSaveEvent = async (event: Event) => {
    const targetCollection = isToday ? planCollection : logCollection
    if (!daily || !targetCollection) return
    try {
      const newId = await EventService.addEvent(event)
      await CollectionItemService.addToCollection(targetCollection.id, newId, 'Event')
      setAddingEvent(false)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to add event:', err)
    }
  }

  const openCreateDaily = () => {
    const notFinished = <T extends { id: number; title: string; status: string }>(items: T[]) =>
      items.filter((item) => item.status !== 'FINISHED')

    const candidates: CarryOverCandidate[] = [
      ...notFinished(planTasks).map((t) => ({ id: t.id, title: t.title, itemType: 'Task' as const, source: 'Plan' as const })),
      ...notFinished(planEvents).map((e) => ({ id: e.id, title: e.title, itemType: 'Event' as const, source: 'Plan' as const })),
      ...notFinished(logTasks).map((t) => ({ id: t.id, title: t.title, itemType: 'Task' as const, source: 'Log' as const })),
      ...notFinished(logEvents).map((e) => ({ id: e.id, title: e.title, itemType: 'Event' as const, source: 'Log' as const }))
    ]

    setCarryOverCandidates(candidates)
    setSelectedCarryOver(new Set(candidates.map((c) => `${c.itemType}-${c.id}`)))
    setCreatingDaily(true)
  }

  const toggleCarryOver = (key: string) => {
    setSelectedCarryOver((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const confirmCreateDaily = async () => {
    try {
      const now = new Date()
      const dateLabel = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })

      const newDaily = await CollectionService.addAndRetrieveCollection({
        id: 0,
        title: `Daily ${dateLabel}`,
        description: `Daily View for ${dateLabel}`,
        type: 'DAILY',
        createDate: now
      })

      const newPlan = await CollectionService.addAndRetrieveCollection({
        id: 0,
        title: `Daily Plan ${dateLabel}`,
        description: `Daily Plan View for ${dateLabel}`,
        type: 'DAILY',
        subType: 'PLAN',
        createDate: now
      })

      const newLog = await CollectionService.addAndRetrieveCollection({
        id: 0,
        title: `Daily Log ${dateLabel}`,
        description: `Daily Log View for ${dateLabel}`,
        type: 'DAILY',
        subType: 'LOG',
        createDate: now
      })

      await CollectionItemService.addToCollection(newDaily.id, newPlan.id, 'Collection')
      await CollectionItemService.addToCollection(newDaily.id, newLog.id, 'Collection')

      for (const candidate of carryOverCandidates) {
        const key = `${candidate.itemType}-${candidate.id}`
        if (!selectedCarryOver.has(key)) continue
        if (candidate.itemType === 'Task') {
          await TaskService.migrateTask(candidate.id, newPlan.id)
        } else {
          await EventService.migrateEvent(candidate.id, newPlan.id)
        }
      }

      setCreatingDaily(false)
      await loadDailies()
    } catch (err) {
      console.error('Failed to create daily:', err)
      setError('Failed to create today\'s daily. Check the console for details and try again.')
    }
  }

  const formatTime = (date: Date | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="daily-log-page">
        <div className="loading">Loading daily log...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="daily-log-page">
        <div className="error">{error}</div>
        <button onClick={() => loadDailies()} className="retry-button">
          Retry
        </button>
      </div>
    )
  }

  if (!daily) {
    return (
      <div className="daily-log-page">
        <div className="create-daily-prompt">
          <span>No daily logs yet.</span>
          {!creatingDaily && <button onClick={openCreateDaily}>Create Today's Daily</button>}
        </div>
        {creatingDaily && (
          <div className="create-daily-panel">
            <h3>Create Today's Daily</h3>
            <p className="empty-message">No previous items to carry over.</p>
            <div className="create-daily-actions">
              <button onClick={confirmCreateDaily}>Create Daily</button>
              <button onClick={() => setCreatingDaily(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const dateParts = getDateParts(daily.createDate)

  return (
    <div className="daily-log-page">
      <header className="daily-log-header">
        <div className="daily-nav">
          <button onClick={goToPreviousDay} disabled={currentIndex >= dailies.length - 1}>
            ← Previous Day
          </button>
          <button onClick={goToNextDay} disabled={currentIndex <= 0}>
            Next Day →
          </button>
        </div>
        <h1>{daily.title}</h1>
        <div className="date">{dateParts.date}</div>
      </header>

      {showCreatePrompt && !creatingDaily && (
        <div className="create-daily-prompt">
          <span>No daily log for today yet.</span>
          <button onClick={openCreateDaily}>Create Today's Daily</button>
        </div>
      )}

      {showCreatePrompt && creatingDaily && (
        <div className="create-daily-panel">
          <h3>Create Today's Daily</h3>
          {carryOverCandidates.length === 0 ? (
            <p className="empty-message">No unfinished items to carry over.</p>
          ) : (
            <ul className="carry-over-list">
              {carryOverCandidates.map((candidate) => {
                const key = `${candidate.itemType}-${candidate.id}`
                return (
                  <li key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCarryOver.has(key)}
                        onChange={() => toggleCarryOver(key)}
                      />
                      {candidate.title}
                      <span className="carry-over-source">({candidate.source})</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="create-daily-actions">
            <button onClick={confirmCreateDaily}>Create Daily</button>
            <button onClick={() => setCreatingDaily(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="daily-log-content">
        {/* Plan Section */}
        <section className="plan-section">
          <div className="section-header">
            <h2>Plan ({planEntries.length})</h2>
            {isToday && (
              <div className="section-header-actions">
                <button onClick={() => setAddingTask((prev) => !prev)}>
                  {addingTask ? 'Cancel' : 'Add Task'}
                </button>
                <button onClick={() => setAddingEvent((prev) => !prev)}>
                  {addingEvent ? 'Cancel' : 'Add Event'}
                </button>
              </div>
            )}
          </div>
          {isToday && addingTask && <TaskForm onSave={handleSaveTask} onCancel={() => setAddingTask(false)} />}
          {isToday && addingEvent && <EventForm onSave={handleSaveEvent} onCancel={() => setAddingEvent(false)} />}
          {planEntries.length === 0 && planMigratedAway.length === 0 ? (
            <p className="empty-message">Nothing planned yet</p>
          ) : (
            <ul className="task-list">
              {planEntries.map((entry, index) => {
                const orderControls = isToday && (
                  <div className="order-buttons">
                    <button
                      className="order-button"
                      disabled={index === 0}
                      onClick={() => movePlanItem(index, -1)}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="order-button"
                      disabled={index === planEntries.length - 1}
                      onClick={() => movePlanItem(index, 1)}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                )

                if (entry.itemType === 'Task' && entry.task) {
                  const task = entry.task
                  return (
                    <li key={`task-${task.id}`} className="task-item">
                      {orderControls}
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        {task.description && <div className="task-description">{task.description}</div>}
                        <div className="task-meta">
                          {task.topic && <span className="task-topic">{task.topic}</span>}
                        </div>
                      </div>
                      <div className="item-actions">
                        {isToday && (
                          <button className="start-button" onClick={() => startTask(task.id)}>
                            Start →
                          </button>
                        )}
                        {task.status !== 'FINISHED' && (
                          <MigrateSelect
                            collections={planTaskCollections}
                            onMigrate={(collectionId) => migrateTask(task.id, collectionId)}
                          />
                        )}
                      </div>
                    </li>
                  )
                }

                if (entry.itemType === 'Event' && entry.event) {
                  const event = entry.event
                  return (
                    <li key={`event-${event.id}`} className="event-item">
                      {orderControls}
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        {event.description && <div className="event-description">{event.description}</div>}
                        <div className="event-meta">
                          {event.scheduledDate && (
                            <span className="event-time">🕒 {formatTime(event.scheduledDate)}</span>
                          )}
                          {event.location && <span className="event-location">📍 {event.location}</span>}
                        </div>
                      </div>
                      <div className="item-actions">
                        {isToday && (
                          <button className="start-button" onClick={() => startEvent(event.id)}>
                            Start →
                          </button>
                        )}
                        {event.status !== 'FINISHED' && (
                          <MigrateSelect
                            collections={planEventCollections}
                            onMigrate={(collectionId) => migrateEvent(event.id, collectionId)}
                          />
                        )}
                      </div>
                    </li>
                  )
                }

                return null
              })}
            </ul>
          )}
          {planMigratedAway.length > 0 && (
            <ul className="migrated-away-list">
              {planMigratedAway.map((item) => (
                <li key={`${item.itemType}-${item.id}`} className="migrated-away-item">
                  <span className="migrated-away-arrow">→</span>
                  <span className="migrated-away-title">{item.title}</span>
                  <span className="migrated-away-target">migrated to {item.toCollectionTitle}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Log Section */}
        <section className="log-section">
          <div className="section-header">
            <h2>Log ({logTasks.length + logEvents.length})</h2>
            {!isToday && (
              <div className="section-header-actions">
                <button onClick={() => setAddingTask((prev) => !prev)}>
                  {addingTask ? 'Cancel' : 'Add Task'}
                </button>
                <button onClick={() => setAddingEvent((prev) => !prev)}>
                  {addingEvent ? 'Cancel' : 'Add Event'}
                </button>
              </div>
            )}
          </div>
          {!isToday && addingTask && <TaskForm onSave={handleSaveTask} onCancel={() => setAddingTask(false)} />}
          {!isToday && addingEvent && <EventForm onSave={handleSaveEvent} onCancel={() => setAddingEvent(false)} />}
          {logTasks.length === 0 && logEvents.length === 0 && logMigratedAway.length === 0 ? (
            <p className="empty-message">Nothing in progress yet</p>
          ) : (
            <ul className="task-list">
              {logTasks.map((task) => (
                <li key={`task-${task.id}`} className={`task-item ${task.status.toLowerCase()}`}>
                  <input
                    type="checkbox"
                    checked={task.status === 'FINISHED'}
                    onChange={() => completeTask(task.id)}
                    className="task-checkbox"
                  />
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-description">{task.description}</div>}
                    <div className="task-meta">
                      {task.topic && <span className="task-topic">{task.topic}</span>}
                      <span className="task-status">{task.status}</span>
                    </div>
                  </div>
                  {task.status !== 'FINISHED' && (
                    <MigrateSelect
                      collections={logTaskCollections}
                      onMigrate={(collectionId) => migrateTask(task.id, collectionId)}
                    />
                  )}
                </li>
              ))}
              {logEvents.map((event) => (
                <li key={`event-${event.id}`} className={`event-item ${event.status.toLowerCase()}`}>
                  <input
                    type="checkbox"
                    checked={event.status === 'FINISHED'}
                    onChange={() => completeEvent(event.id)}
                    className="event-checkbox"
                  />
                  <div className="event-content">
                    <div className="event-title">{event.title}</div>
                    {event.description && <div className="event-description">{event.description}</div>}
                    <div className="event-meta">
                      {event.scheduledDate && (
                        <span className="event-time">🕒 {formatTime(event.scheduledDate)}</span>
                      )}
                      {event.location && <span className="event-location">📍 {event.location}</span>}
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                          🔗 Join
                        </a>
                      )}
                    </div>
                  </div>
                  {event.status !== 'FINISHED' && (
                    <MigrateSelect
                      collections={logEventCollections}
                      onMigrate={(collectionId) => migrateEvent(event.id, collectionId)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
          {logMigratedAway.length > 0 && (
            <ul className="migrated-away-list">
              {logMigratedAway.map((item) => (
                <li key={`${item.itemType}-${item.id}`} className="migrated-away-item">
                  <span className="migrated-away-arrow">→</span>
                  <span className="migrated-away-title">{item.title}</span>
                  <span className="migrated-away-target">migrated to {item.toCollectionTitle}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default DailyView
