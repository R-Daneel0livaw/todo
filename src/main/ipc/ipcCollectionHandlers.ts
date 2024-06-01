import { Collection } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'

export function setupCollectionHandlers() {
  ipcMain.handle(
    'get-collection',
    async (event: IpcMainInvokeEvent, collectionId: number): Promise<Collection> => {
      console.log('get-collection', event, collectionId)
      return getCollection()
    }
  )

  ipcMain.handle('get-collections', async (event: IpcMainInvokeEvent): Promise<Collection[]> => {
    console.log('get-collections', event)
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

function getCollections(): Collection[] {
  const collection: Collection = {
    type: 'DEFAULT',
    subType: 'CUSTOM',
    id: 1,
    title: 'Task List',
    createDate: new Date()
  }

  const collection2: Collection = {
    type: 'DEFAULT',
    subType: 'CUSTOM',
    id: 2,
    title: 'Event List',
    createDate: new Date()
  }
  return [collection, collection2]
}
