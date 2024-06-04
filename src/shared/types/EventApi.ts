import { Collection, Event } from '.'

export interface EventApi {
  getEvent(eventId: number): Promise<Event>
  getEventByCollectionId(eventId: number, collectionId: number): Promise<Event>
  getEventsByCollectionId(collectionId: number): Promise<Event[]>
  getEventsByCollection(collectionData: Partial<Collection>): Promise<Event[]>
  addEvent(eventData: Event): Promise<void>
  deleteEvent(eventId: number): Promise<void>
  cancelEvent(eventId: number): Promise<void>
}
