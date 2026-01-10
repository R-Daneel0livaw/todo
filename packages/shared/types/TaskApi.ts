import { Collection, Task } from '.'

export interface TaskApi {
  getAllTasks(): Promise<Task[]>
  getTask(taskId: number): Promise<Task>
  getTaskByCollectionId(taskId: number, collectionId: number): Promise<Task>
  getTasksByCollectionId(collectionId: number): Promise<Task[]>
  getTasksByCollection(collectionData: Partial<Collection>): Promise<Task[]>
  addTask(taskData: Task): Promise<number>
  updateTask(taskData: Partial<Task> & { id: number }): Promise<void>
  completeTask(taskId: number): Promise<void>
  deleteTask(taskId: number): Promise<void>
  cancelTask(taskId: number): Promise<void>
  migrateTask(taskId: number, toTaskId: number): Promise<void>
}
