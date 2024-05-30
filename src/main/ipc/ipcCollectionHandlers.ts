import { ipcMain } from 'electron'

export function setupCollectionHandlers() {
  ipcMain.handle('get-collection', async (event, collectionId) => {
    console.log('get-collection', event, collectionId)
  })

  ipcMain.handle('get-collections', async (event) => {
    console.log('get-collections', event)
  })

  ipcMain.handle('add-collection', async (event, collectionData) => {
    console.log('add-collection', event, collectionData)
  })

  ipcMain.handle('delete-collection', async (event, collectionId) => {
    console.log('delete-collection', event, collectionId)
  })
}
