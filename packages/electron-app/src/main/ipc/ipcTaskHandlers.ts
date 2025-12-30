import { Collection, Task } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addTask,
  cancelTask,
  completeTask,
  deleteTask,
  getTask,
  getTaskByCollectionId,
  getTasksByCollection,
  getTasksByCollectionId,
  migrateTask,
  updateTask
} from '../database/TaskManager'

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

  ipcMain.handle('add-task', async (_: IpcMainInvokeEvent, taskData: Task): Promise<number> => {
    return addTask(taskData)
  })

  ipcMain.handle(
    'update-task',
    async (_: IpcMainInvokeEvent, taskData: Partial<Task> & { id: number }): Promise<void> => {
      updateTask(taskData)
    }
  )

  ipcMain.handle('complete-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    completeTask(taskId)
  })

  ipcMain.handle('delete-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    deleteTask(taskId)
  })

  ipcMain.handle('cancel-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    cancelTask(taskId)
  })

  ipcMain.handle(
    'migrate-task',
    async (_: IpcMainInvokeEvent, taskId: number, toTaskId: number): Promise<void> => {
      migrateTask(taskId, toTaskId)
    }
  )
}
