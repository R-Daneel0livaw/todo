import { Collection } from '@shared/types'
import { ipcMain } from 'electron'

export function setupCollectionHandlers() {
  ipcMain.handle('get-collection', async (event, collectionId) => {
    console.log('get-collection', event, collectionId)
  })

  ipcMain.handle('get-collections', async (event) => {
    console.log('get-collections', event)
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
  })

  ipcMain.handle('add-collection', async (event, collectionData) => {
    console.log('add-collection', event, collectionData)
  })

  ipcMain.handle('delete-collection', async (event, collectionId) => {
    console.log('delete-collection', event, collectionId)
  })
}
