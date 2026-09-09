import { useEffect, useState } from 'react'
import { Collection, Event, Task } from '@awesome-dev-journal/shared'
import * as CollectionService from '@renderer/services/CollectionService'
import * as CollectionItemService from '@renderer/services/CollectionItemService'
import * as TaskService from '@renderer/services/TaskService'
import * as EventService from '@renderer/services/EventService'
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

      const [pt, pe, lt, le] = await Promise.all([
        plan ? TaskService.getTasksByCollectionId(plan.id) : Promise.resolve([]),
        plan ? EventService.getEventsByCollectionId(plan.id) : Promise.resolve([]),
        log ? TaskService.getTasksByCollectionId(log.id) : Promise.resolve([]),
        log ? EventService.getEventsByCollectionId(log.id) : Promise.resolve([])
      ])
      setPlanTasks(pt)
      setPlanEvents(pe)
      setLogTasks(lt)
      setLogEvents(le)
    } catch (err) {
      console.error('Failed to load daily content:', err)
      setError('Failed to load daily content. Make sure the MCP server is running.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const goToPreviousDay = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, dailies.length - 1))
  }

  const goToNextDay = () => {
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
    if (!daily || !planCollection) return
    try {
      const newId = await TaskService.addTask(task)
      await CollectionItemService.addToCollection(planCollection.id, newId, 'Task')
      setAddingTask(false)
      await loadDailyContent(daily.id, false)
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  const handleSaveEvent = async (event: Event) => {
    if (!daily || !planCollection) return
    try {
      const newId = await EventService.addEvent(event)
      await CollectionItemService.addToCollection(planCollection.id, newId, 'Event')
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
            <h2>Plan ({planTasks.length + planEvents.length})</h2>
            <div className="section-header-actions">
              <button onClick={() => setAddingTask((prev) => !prev)}>
                {addingTask ? 'Cancel' : 'Add Task'}
              </button>
              <button onClick={() => setAddingEvent((prev) => !prev)}>
                {addingEvent ? 'Cancel' : 'Add Event'}
              </button>
            </div>
          </div>
          {addingTask && <TaskForm onSave={handleSaveTask} onCancel={() => setAddingTask(false)} />}
          {addingEvent && <EventForm onSave={handleSaveEvent} onCancel={() => setAddingEvent(false)} />}
          {planTasks.length === 0 && planEvents.length === 0 ? (
            <p className="empty-message">Nothing planned yet</p>
          ) : (
            <ul className="task-list">
              {planTasks.map((task) => (
                <li key={`task-${task.id}`} className="task-item">
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-description">{task.description}</div>}
                    <div className="task-meta">
                      {task.topic && <span className="task-topic">{task.topic}</span>}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="start-button" onClick={() => startTask(task.id)}>
                      Start →
                    </button>
                    <MigrateSelect
                      collections={taskCollections}
                      onMigrate={(collectionId) => migrateTask(task.id, collectionId)}
                    />
                  </div>
                </li>
              ))}
              {planEvents.map((event) => (
                <li key={`event-${event.id}`} className="event-item">
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
                    <button className="start-button" onClick={() => startEvent(event.id)}>
                      Start →
                    </button>
                    <MigrateSelect
                      collections={eventCollections}
                      onMigrate={(collectionId) => migrateEvent(event.id, collectionId)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Log Section */}
        <section className="log-section">
          <div className="section-header">
            <h2>Log ({logTasks.length + logEvents.length})</h2>
          </div>
          {logTasks.length === 0 && logEvents.length === 0 ? (
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
                  <MigrateSelect
                    collections={taskCollections}
                    onMigrate={(collectionId) => migrateTask(task.id, collectionId)}
                  />
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
                  <MigrateSelect
                    collections={eventCollections}
                    onMigrate={(collectionId) => migrateEvent(event.id, collectionId)}
                  />
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
