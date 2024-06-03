import { Collection, Task } from '@shared/types'

export const getTasksByCollectionId = async (collectionId: number): Promise<Task[]> => {
  return window.api.getTasksByCollectionId(collectionId)
}

export const getTasksByCollection = async (
  collectionData: Partial<Collection>
): Promise<Task[]> => {
  const cd: Partial<Collection> = { type: 'DEFAULT', subType: 'TASK' }
  console.log(collectionData, cd)
  return window.api.getTasksByCollection(cd)
}

export const addTask = async (taskData: Task): Promise<void> => {
  window.api.addTask(taskData)
}

export const deleteTask = async (taskId: number): Promise<void> => {
  window.api.deleteTask(taskId)
}

export const cancelTask = async (taskId: number): Promise<void> => {
  window.api.cancelTask(taskId)
}
