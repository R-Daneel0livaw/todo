import { useEffect, useState } from 'react'
import { Task, Event } from '@awesome-dev-journal/shared'
import './DailyLogPage.css'

function DailyLogPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDailyLog()
  }, [])

  const loadDailyLog = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all tasks and events for now to verify the UI works
      const [allTasks, allEvents] = await Promise.all([
        window.taskApi.getAllTasks(),
        window.eventApi.getAllEvents()
      ])

      setTasks(allTasks)
      setEvents(allEvents)

      // COMMENTED OUT: Date-specific filtering for today's log
      // // Get today's daily log collection
      // const collections: Collection[] = await window.collectionApi.getCollections()
      // const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      //
      // // Find today's log collection (type='DAILY', subType='LOG')
      // const todayLog = collections.find(
      //   (c) => c.type === 'DAILY' && c.subType === 'LOG' && c.createDate?.toString().startsWith(today)
      // )
      //
      // if (todayLog) {
      //   // Load tasks and events for this collection
      //   const [collectionTasks, collectionEvents] = await Promise.all([
      //     window.taskApi.getTasksByCollectionId(todayLog.id),
      //     window.eventApi.getEventsByCollectionId(todayLog.id)
      //   ])
      //
      //   setTasks(collectionTasks)
      //   setEvents(collectionEvents)
      // } else {
      //   // No daily log for today yet
      //   setTasks([])
      //   setEvents([])
      // }
    } catch (err) {
      console.error('Failed to load daily log:', err)
      setError('Failed to load daily log. Make sure the MCP server is running.')
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: number) => {
    try {
      await window.taskApi.completeTask(taskId)
      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'FINISHED' } : t))
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  const completeEvent = async (eventId: number) => {
    try {
      await window.eventApi.completeEvent(eventId)
      // Update local state
      setEvents(events.map(e => e.id === eventId ? { ...e, status: 'FINISHED' } : e))
    } catch (err) {
      console.error('Failed to complete event:', err)
    }
  }

  if (loading) {
    return (
      <div className="daily-log-page">
        <div className="loading">Loading today's log...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="daily-log-page">
        <div className="error">{error}</div>
        <button onClick={loadDailyLog} className="retry-button">
          Retry
        </button>
      </div>
    )
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="daily-log-page">
      <header className="daily-log-header">
        <h1>Today's Log</h1>
        <div className="date">{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
      </header>

      <div className="daily-log-content">
        {/* Tasks Section */}
        <section className="tasks-section">
          <h2>Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="empty-message">No tasks for today</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
                  <input
                    type="checkbox"
                    checked={task.status === 'FINISHED'}
                    onChange={() => completeTask(task.id)}
                    className="task-checkbox"
                  />
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    <div className="task-meta">
                      {task.topic && <span className="task-topic">{task.topic}</span>}
                      <span className="task-status">{task.status}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Events Section */}
        <section className="events-section">
          <h2>Events ({events.length})</h2>
          {events.length === 0 ? (
            <p className="empty-message">No events for today</p>
          ) : (
            <ul className="event-list">
              {events.map((event) => (
                <li key={event.id} className={`event-item ${event.status.toLowerCase()}`}>
                  <input
                    type="checkbox"
                    checked={event.status === 'FINISHED'}
                    onChange={() => completeEvent(event.id)}
                    className="event-checkbox"
                  />
                  <div className="event-content">
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    <div className="event-meta">
                      {event.scheduledDate && (
                        <span className="event-time">🕒 {formatDate(event.scheduledDate)}</span>
                      )}
                      {event.location && (
                        <span className="event-location">📍 {event.location}</span>
                      )}
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                          🔗 Join
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default DailyLogPage
