import { Collection } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

export function setupCollectionHandlers() {
  ipcMain.handle(
    'get-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<Collection> => {
      return JournalClient.getCollection(collectionId)
    }
  )

  ipcMain.handle('get-collections', async (): Promise<Collection[]> => {
    return JournalClient.getAllCollections()
  })

  ipcMain.handle(
    'add-collection',
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<number> => {
      const result = await JournalClient.createCollection(collectionData)
      return result.id
    }
  )

  ipcMain.handle(
    'add-retrieve-collection',
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<Collection> => {
      const result = await JournalClient.createCollection(collectionData)
      return JournalClient.getCollection(result.id)
    }
  )

  ipcMain.handle(
    'update-collection',
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<Collection> => {
      await JournalClient.updateCollection(collectionData.id, collectionData)
      return JournalClient.getCollection(collectionData.id)
    }
  )

  ipcMain.handle(
    'archive-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<void> => {
      await JournalClient.archiveCollection(collectionId)
    }
  )

  ipcMain.handle(
    'delete-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<void> => {
      await JournalClient.deleteCollection(collectionId)
    }
  )
}
