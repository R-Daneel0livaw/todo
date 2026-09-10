import { Collection, Task } from '@awesome-dev-journal/shared'
import { useEffect, useState } from 'react'
import * as CollectionService from '@renderer/services/CollectionService'
import * as CollectionItemService from '@renderer/services/CollectionItemService'
import * as TaskService from '@renderer/services/TaskService'
import TaskForm from '@renderer/components/TaskForm/TaskForm'
import MigrateSelect from '@renderer/components/MigrateSelect/MigrateSelect'
import styles from './TaskListView.module.css'

interface TaskListViewProps {
  collectionId: number
}

// A plain list-of-tasks collection (e.g. the default Task List, or any other
// TASK-shaped collection) — no sub-collections, no events, just tasks.
function TaskListView({ collectionId }: TaskListViewProps) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [allCollections, setAllCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingTask, setAddingTask] = useState(false)
  const [showFinished, setShowFinished] = useState(false)

  // Default Task List isn't a real migration target — every task is always in it already.
  const taskCollections = allCollections.filter((c) => c.type !== 'DEFAULT' && c.subType !== 'EVENT')
  const visibleTasks = showFinished ? tasks : tasks.filter((t) => t.status !== 'FINISHED')

  useEffect(() => {
    loadContent()
  }, [collectionId])

  const loadContent = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const [collectionData, taskData, collectionsList] = await Promise.all([
        CollectionService.getCollection(collectionId),
        TaskService.getTasksByCollectionId(collectionId),
        CollectionService.getCollections()
      ])

      setCollection(collectionData)
      setTasks(taskData)
      setAllCollections(collectionsList)
    } catch (err) {
      console.error('Failed to load task list:', err)
      setError('Failed to load task list. Make sure the MCP server is running.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const completeTask = async (taskId: number) => {
    try {
      await window.taskApi.completeTask(taskId)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'FINISHED' } : t)))
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  const migrateTask = async (taskId: number, toCollectionId: number) => {
    try {
      await TaskService.migrateTask(taskId, toCollectionId)
      await loadContent(false)
    } catch (err) {
      console.error('Failed to migrate task:', err)
    }
  }

  const handleSaveTask = async (task: Task) => {
    try {
      const newId = await TaskService.addTask(task)
      await CollectionItemService.addToCollection(collectionId, newId, 'Task')
      setAddingTask(false)
      await loadContent(false)
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  if (loading) {
    return (
      <div className={styles.taskListView}>
        <div className={styles.loading}>Loading task list...</div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className={styles.taskListView}>
        <div className={styles.error}>{error || 'Collection not found.'}</div>
        <button className={styles.retryButton} onClick={() => loadContent()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.taskListView}>
      <header className={styles.header}>
        <h1>{collection.title}</h1>
        {collection.description && <p className={styles.description}>{collection.description}</p>}
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Tasks ({visibleTasks.length})</h2>
          <div className={styles.sectionHeaderActions}>
            <label className={styles.showFinishedToggle}>
              <input
                type="checkbox"
                checked={showFinished}
                onChange={(e) => setShowFinished(e.target.checked)}
              />
              Show finished
            </label>
            <button onClick={() => setAddingTask((prev) => !prev)}>
              {addingTask ? 'Cancel' : 'Add Task'}
            </button>
          </div>
        </div>
        {addingTask && <TaskForm onSave={handleSaveTask} onCancel={() => setAddingTask(false)} />}
        {visibleTasks.length === 0 ? (
          <p className={styles.emptyMessage}>No tasks yet</p>
        ) : (
          <ul className={styles.itemList}>
            {visibleTasks.map((task) => (
              <li key={task.id} className={`${styles.item} ${task.status === 'FINISHED' ? styles.finished : ''}`}>
                <input
                  type="checkbox"
                  checked={task.status === 'FINISHED'}
                  onChange={() => completeTask(task.id)}
                />
                <div className={styles.itemContent}>
                  <div className={styles.itemTitle}>{task.title}</div>
                  {task.description && <div className={styles.itemDescription}>{task.description}</div>}
                  <div className={styles.itemMeta}>
                    {task.topic && <span className={styles.itemTopic}>{task.topic}</span>}
                    <span className={styles.itemStatus}>{task.status}</span>
                  </div>
                </div>
                <MigrateSelect
                  collections={taskCollections}
                  onMigrate={(toCollectionId) => migrateTask(task.id, toCollectionId)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default TaskListView
