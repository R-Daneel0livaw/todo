import { Collection, Event } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addEvent,
  cancelEvent,
  deleteEvent,
  getEvent,
  getEventByCollectionId,
  getEventsByCollection,
  getEventsByCollectionId
} from '../database/eventManager'

export function setupEventHandlers() {
  ipcMain.handle('get-event', async (_: IpcMainInvokeEvent, eventId: number): Promise<Event> => {
    return getEvent(eventId)
  })

  ipcMain.handle(
    'get-event-by-collection-id',
    async (_: IpcMainInvokeEvent, eventId: number, collectionId: number): Promise<Event> => {
      return getEventByCollectionId(eventId, collectionId)
    }
  )

  ipcMain.handle(
    'get-events-by-collection-id',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<Event[]> => {
      return getEventsByCollectionId(collectionId)
    }
  )

  ipcMain.handle(
    'get-events-by-collection',
    async (_: IpcMainInvokeEvent, collectionData: Partial<Collection>): Promise<Event[]> => {
      return getEventsByCollection(collectionData)
    }
  )

  ipcMain.handle('add-event', async (_: IpcMainInvokeEvent, eventData: Event): Promise<void> => {
    addEvent(eventData)
  })

  ipcMain.handle('delete-event', async (_: IpcMainInvokeEvent, eventId: number): Promise<void> => {
    deleteEvent(eventId)
  })

  ipcMain.handle('cancel-event', async (_: IpcMainInvokeEvent, eventId: number): Promise<void> => {
    cancelEvent(eventId)
  })
}
