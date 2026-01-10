import { Collection, Event } from '.'

export interface EventApi {
  getAllEvents(): Promise<Event[]>
  getEvent(eventId: number): Promise<Event>
  getEventByCollectionId(eventId: number, collectionId: number): Promise<Event>
  getEventsByCollectionId(collectionId: number): Promise<Event[]>
  getEventsByCollection(collectionData: Partial<Collection>): Promise<Event[]>
  addEvent(eventData: Event): Promise<number>
  updateEvent(eventData: Partial<Event> & { id: number }): Promise<void>
  completeEvent(eventId: number): Promise<void>
  deleteEvent(eventId: number): Promise<void>
  cancelEvent(eventId: number): Promise<void>
}
