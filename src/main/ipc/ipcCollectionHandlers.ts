import { Collection } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import { getCollections } from '../database/collectionManager'

export function setupCollectionHandlers() {
  ipcMain.handle(
    'get-collection',
    async (event: IpcMainInvokeEvent, collectionId: number): Promise<Collection> => {
      console.log('get-collection', event, collectionId)
      return getCollection()
    }
  )

  ipcMain.handle('get-collections', async (): Promise<Collection[]> => {
    return getCollections()
  })

  ipcMain.handle(
    'add-collection',
    async (event: IpcMainInvokeEvent, collectionData: Collection): Promise<void> => {
      console.log('add-collection', event, collectionData)
    }
  )

  ipcMain.handle(
    'delete-collection',
    async (event: IpcMainInvokeEvent, collectionId: number): Promise<void> => {
      console.log('delete-collection', event, collectionId)
    }
  )
}

function getCollection(): Collection {
  return {
    type: 'DEFAULT',
    subType: 'CUSTOM',
    id: 1,
    title: 'Task List',
    createDate: new Date()
  }
}
