import { Collection, Event } from '@shared/types'

export const getEventsByCollectionId = async (collectionId: number): Promise<Event[]> => {
  return window.api.getEventsByCollectionId(collectionId)
}

export const getEventsByCollection = async (
  collectionData: Partial<Collection>
): Promise<Event[]> => {
  const cd: Partial<Collection> = { type: 'DEFAULT', subType: 'EVENT' }
  console.log(collectionData, cd)
  return window.api.getEventsByCollection(cd)
}
