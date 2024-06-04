import { Collection, Task } from '@shared/types'

export const getTasksByCollectionId = async (collectionId: number): Promise<Task[]> => {
  return window.taskApi.getTasksByCollectionId(collectionId)
}

export const getTasksByCollection = async (
  collectionData: Partial<Collection>
): Promise<Task[]> => {
  const cd: Partial<Collection> = { type: 'DEFAULT', subType: 'TASK' }
  console.log(collectionData, cd)
  return window.taskApi.getTasksByCollection(cd)
}

export const addTask = async (taskData: Task): Promise<void> => {
  window.taskApi.addTask(taskData)
}

export const deleteTask = async (taskId: number): Promise<void> => {
  window.taskApi.deleteTask(taskId)
}

export const cancelTask = async (taskId: number): Promise<void> => {
  window.taskApi.cancelTask(taskId)
}
