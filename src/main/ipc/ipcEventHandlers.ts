import { ipcMain } from 'electron'

export function setupEventHandlers() {
  ipcMain.handle('get-event', async (event, eventId) => {
    console.log('get-event', event, eventId)
  })

  ipcMain.handle('get-event-by-collection', async (event, eventId, collectionId) => {
    console.log('get-event-by-collection', event, eventId, collectionId)
  })

  ipcMain.handle('get-events-by-collection', async (event, collectionId) => {
    console.log('get-events-by-collection', event, collectionId)
  })

  ipcMain.handle('add-event', async (event, eventData) => {
    console.log('add-event', event, eventData)
  })

  ipcMain.handle('delete-event', async (event, eventId) => {
    console.log('delete-event', event, eventId)
  })
}
