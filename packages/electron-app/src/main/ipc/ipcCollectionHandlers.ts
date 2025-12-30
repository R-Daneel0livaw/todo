import { Collection } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addAndRetrieveCollection,
  addCollection,
  archiveCollection,
  deleteCollection,
  getCollection,
  getCollections,
  updateCollection
} from '../database/CollectionManager'

export function setupCollectionHandlers() {
  ipcMain.handle(
    'get-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<Collection> => {
      return getCollection(collectionId)
    }
  )

  ipcMain.handle('get-collections', async (): Promise<Collection[]> => {
    return getCollections()
  })

  ipcMain.handle(
    'add-collection',
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<number> => {
      return addCollection(collectionData)
    }
  )

  ipcMain.handle(
    'add-retrieve-collection',
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<Collection> => {
      return addAndRetrieveCollection(collectionData)
    }
  )

  ipcMain.handle(
    'update-collection',
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<Collection> => {
      return updateCollection(collectionData)
    }
  )

  ipcMain.handle(
    'archive-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<void> => {
      archiveCollection(collectionId)
    }
  )

  ipcMain.handle(
    'delete-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<void> => {
      deleteCollection(collectionId)
    }
  )
}
