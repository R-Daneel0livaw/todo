import { Collection, Event } from '@awesome-dev-journal/shared'

export const getEventsByCollectionId = async (collectionId: number): Promise<Event[]> => {
  return window.eventApi.getEventsByCollectionId(collectionId)
}

export const getEventsByCollection = async (
  collectionData: Partial<Collection>
): Promise<Event[]> => {
  const cd: Partial<Collection> = { type: 'DEFAULT', subType: 'EVENT' }
  console.log(collectionData, cd)
  return window.eventApi.getEventsByCollection(cd)
}

export const addEvent = async (eventData: Event): Promise<void> => {
  window.eventApi.addEvent(eventData)
}

export const deleteEvent = async (eventId: number): Promise<void> => {
  window.eventApi.deleteEvent(eventId)
}

export const cancelEvent = async (eventId: number): Promise<void> => {
  window.eventApi.cancelEvent(eventId)
}
