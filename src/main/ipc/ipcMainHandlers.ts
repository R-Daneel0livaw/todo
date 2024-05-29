import { ipcMain } from 'electron'

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

ipcMain.handle('get-task', async (event, taskId) => {
  console.log('get-task', event, taskId)
})

ipcMain.handle('get-task-by-collection', async (event, taskId, collectionId) => {
  console.log('get-task-by-collection', event, taskId, collectionId)
})

ipcMain.handle('get-tasks-by-collection', async (event, collectionId) => {
  console.log('get-tasks-by-collection', event, collectionId)
})

ipcMain.handle('add-task', async (event, taskData) => {
  console.log('add-task', event, taskData)
})

ipcMain.handle('delete-task', async (event, taskId) => {
  console.log('delete-task', event, taskId)
})

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
