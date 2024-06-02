import { Collection, Event } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'

export function setupEventHandlers() {
  ipcMain.handle(
    'get-event',
    async (event: IpcMainInvokeEvent, eventId: number): Promise<Event> => {
      console.log('get-event', event, eventId)
      return getEvent()
    }
  )

  ipcMain.handle(
    'get-event-by-collection-id',
    async (event: IpcMainInvokeEvent, eventId: number, collectionId: number): Promise<Event> => {
      console.log('get-event-by-collection-id', event, eventId, collectionId)
      return getEvent()
    }
  )

  ipcMain.handle(
    'get-events-by-collection-id',
    async (event: IpcMainInvokeEvent, collectionId: number): Promise<Event[]> => {
      console.log('get-events-by-collection-id', event, collectionId)
      return getEvents()
    }
  )

  ipcMain.handle(
    'get-events-by-collection',
    async (event: IpcMainInvokeEvent, collectionData: Partial<Collection>): Promise<Event[]> => {
      console.log('get-events-by-collection', event, collectionData)
      return getEvents()
    }
  )

  ipcMain.handle(
    'add-event',
    async (event: IpcMainInvokeEvent, eventData: Event): Promise<void> => {
      console.log('add-event', event, eventData)
    }
  )

  ipcMain.handle(
    'delete-event',
    async (event: IpcMainInvokeEvent, eventId: number): Promise<void> => {
      console.log('delete-event', event, eventId)
    }
  )
}

function getEvent(): Event {
  return {
    status: 'CREATED',
    id: 4,
    title: 'Gym',
    createDate: new Date()
  }
}

function getEvents(): Event[] {
  const eventData: Event = {
    status: 'CREATED',
    id: 4,
    title: 'Gym',
    createDate: new Date()
  }
  const eventData2: Event = {
    status: 'CREATED',
    id: 5,
    title: 'Work',
    createDate: new Date()
  }
  return [eventData, eventData2]
}
