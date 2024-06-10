import { Collection } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addCollection,
  deleteCollection,
  getCollection,
  getCollections
} from '../database/collectionManager'

export function setupCollectionHandlers() {
  ipcMain.handle(
    'get-collection',
    async (event: IpcMainInvokeEvent, collectionId: number): Promise<Collection> => {
      console.log('get-collection', event, collectionId)
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
}
