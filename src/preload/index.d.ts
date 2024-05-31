import { ElectronAPI } from '@electron-toolkit/preload'

interface Task {
  id: number
  title: string
  description: string
}

interface Event {
  id: number
  title: string
  description: string
}

interface Collection {
  id: number
  title: string
  description: string
}

interface Api {
  getTask(taskId: number): Promise<Task>
  getTaskByCollection(taskId: number, collectionId: number): Promise<Task>
  getTasksByCollection(collectionId: number): Promise<Task[]>
  addTask(taskData): Promise<void>
  deleteTask(taskId: number): Promise<void>
  getEvent(eventId: number): Promise<Event>
  getEventByCollection(eventId: number, collectionId: number): Promise<Event>
  getEventsByCollection(collectionId: number): Promise<Event[]>
  addEvent(eventData): Promise<void>
  deleteEvent(eventId: number): Promise<void>
  getCollection(collectinId: number): Promise<Collection>
  getCollections(): Promise<Collection[]>
  addCollection(collectionData): Promise<void>
  deleteColection(collectionId: number): Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
