import { Collection } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addCollection,
  deleteCollection,
  getCollection,
  getCollections,
  addAndRetrieveCollection,
  updateCollection
} from '../database/collectionManager'

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
    async (_: IpcMainInvokeEvent, collectionData: Collection): Promise<void> => {
      addCollection(collectionData)
    }
  )

  ipcMain.handle(
    'delete-collection',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<void> => {
      deleteCollection(collectionId)
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
}
