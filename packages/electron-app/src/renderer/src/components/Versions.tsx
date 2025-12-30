import { getCollections } from '@renderer/services/CollectionService'
import { getEventsByCollectionId } from '@renderer/services/EventService'
import { getTasksByCollectionId } from '@renderer/services/TaskService'
import { Collection, Event, Task } from '@awesome-dev-journal/shared'
import { useState, useEffect } from 'react'

function Versions(): JSX.Element {
  const [versions] = useState(window.electron.process.versions)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    async function loadTasks() {
      const tasks = await getTasksByCollectionId(1)
      setTasks(tasks)
    }

    async function loadEvents() {
      const events = await getEventsByCollectionId(2)
      setEvents(events)
    }

    async function loadCollections() {
      const collections = await getCollections()
      setCollections(collections)
    }

    loadTasks()
    loadEvents()
    loadCollections()
  }, [])

  console.log(tasks)
  console.log(events)
  console.log(collections)

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
