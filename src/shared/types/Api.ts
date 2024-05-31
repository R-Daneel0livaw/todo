import { Collection, Task, Event } from '.'

export interface Api {
  getTask(taskId: number): Promise<Task>
  getTaskByCollection(taskId: number, collectionId: number): Promise<Task>
  getTasksByCollection(collectionId: number): Promise<Task[]>
  addTask(taskData: Task): Promise<void>
  deleteTask(taskId: number): Promise<void>
  getEvent(eventId: number): Promise<Event>
  getEventByCollection(eventId: number, collectionId: number): Promise<Event>
  getEventsByCollection(collectionId: number): Promise<Event[]>
  addEvent(eventData: Event): Promise<void>
  deleteEvent(eventId: number): Promise<void>
  getCollection(collectinId: number): Promise<Collection>
  getCollections(): Promise<Collection[]>
  addCollection(collectionData: Collection): Promise<void>
  deleteColection(collectionId: number): Promise<void>
}
