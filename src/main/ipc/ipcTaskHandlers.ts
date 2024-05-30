import { ipcMain } from 'electron'

export function setupTaskHandlers() {
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
}
