import { Collection, Task } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addTask,
  cancelTask,
  deleteTask,
  getTask,
  getTaskByCollectionId,
  getTasksByCollection,
  getTasksByCollectionId
} from '../database/taskManager'

export function setupTaskHandlers() {
  ipcMain.handle('get-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<Task> => {
    return getTask(taskId)
  })

  ipcMain.handle(
    'get-task-by-collection-id',
    async (_: IpcMainInvokeEvent, taskId: number, collectionId: number): Promise<Task> => {
      return getTaskByCollectionId(taskId, collectionId)
    }
  )

  ipcMain.handle(
    'get-tasks-by-collection-id',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<Task[]> => {
      return getTasksByCollectionId(collectionId)
    }
  )

  ipcMain.handle(
    'get-tasks-by-collection',
    async (_: IpcMainInvokeEvent, collectionData: Partial<Collection>): Promise<Task[]> => {
      return getTasksByCollection(collectionData)
    }
  )

  ipcMain.handle('add-task', async (_: IpcMainInvokeEvent, taskData: Task): Promise<void> => {
    addTask(taskData)
  })

  ipcMain.handle('delete-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    deleteTask(taskId)
  })

  ipcMain.handle('cancel-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    cancelTask(taskId)
  })
}
