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
