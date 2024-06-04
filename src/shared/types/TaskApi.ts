import { Collection, Task } from '.'

export interface TaskApi {
  getTask(taskId: number): Promise<Task>
  getTaskByCollectionId(taskId: number, collectionId: number): Promise<Task>
  getTasksByCollectionId(collectionId: number): Promise<Task[]>
  getTasksByCollection(collectionData: Partial<Collection>): Promise<Task[]>
  addTask(taskData: Task): Promise<void>
  deleteTask(taskId: number): Promise<void>
  cancelTask(taskId: number): Promise<void>
}
