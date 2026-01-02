import { Event } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

export function setupEventHandlers() {
  ipcMain.handle('get-event', async (_: IpcMainInvokeEvent, eventId: number): Promise<Event> => {
    return JournalClient.getEvent(eventId)
  })

  ipcMain.handle(
    'get-events-by-collection-id',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<Event[]> => {
      return JournalClient.getEventsByCollectionId(collectionId)
    }
  )

  ipcMain.handle('add-event', async (_: IpcMainInvokeEvent, eventData: Event): Promise<number> => {
    const result = await JournalClient.createEvent(eventData)
    return result.id
  })

  ipcMain.handle(
    'update-event',
    async (_: IpcMainInvokeEvent, eventData: Partial<Event> & { id: number }): Promise<void> => {
      await JournalClient.updateEvent(eventData.id, eventData)
    }
  )

  ipcMain.handle(
    'complete-event',
    async (_: IpcMainInvokeEvent, eventId: number): Promise<void> => {
      await JournalClient.completeEvent(eventId)
    }
  )

  ipcMain.handle('delete-event', async (_: IpcMainInvokeEvent, eventId: number): Promise<void> => {
    await JournalClient.deleteEvent(eventId)
  })

  ipcMain.handle('cancel-event', async (_: IpcMainInvokeEvent, eventId: number): Promise<void> => {
    await JournalClient.cancelEvent(eventId)
  })
}
