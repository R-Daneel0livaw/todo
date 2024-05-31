import { ElectronAPI } from '@electron-toolkit/preload'
import { Task } from '@shared/types'

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
