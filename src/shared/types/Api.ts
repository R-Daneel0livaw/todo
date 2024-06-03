import { Collection, Task, Event } from '.'

export interface Api {
  getTask(taskId: number): Promise<Task>
  getTaskByCollectionId(taskId: number, collectionId: number): Promise<Task>
  getTasksByCollectionId(collectionId: number): Promise<Task[]>
  getTasksByCollection(collectionData: Partial<Collection>): Promise<Task[]>
  addTask(taskData: Task): Promise<void>
  deleteTask(taskId: number): Promise<void>
  cancelTask(taskId: number): Promise<void>
  getEvent(eventId: number): Promise<Event>
  getEventByCollectionId(eventId: number, collectionId: number): Promise<Event>
  getEventsByCollectionId(collectionId: number): Promise<Event[]>
  getEventsByCollection(collectionData: Partial<Collection>): Promise<Event[]>
  addEvent(eventData: Event): Promise<void>
  deleteEvent(eventId: number): Promise<void>
  cancelEvent(eventId: number): Promise<void>
  getCollection(collectinId: number): Promise<Collection>
  getCollections(): Promise<Collection[]>
  addCollection(collectionData: Collection): Promise<void>
  deleteColection(collectionId: number): Promise<void>
}
