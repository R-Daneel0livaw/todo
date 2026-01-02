import { Task } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

export function setupTaskHandlers() {
  ipcMain.handle('get-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<Task> => {
    return JournalClient.getTask(taskId)
  })

  ipcMain.handle(
    'get-tasks-by-collection-id',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<Task[]> => {
      return JournalClient.getTasksByCollectionId(collectionId)
    }
  )

  ipcMain.handle('add-task', async (_: IpcMainInvokeEvent, taskData: Task): Promise<number> => {
    const result = await JournalClient.createTask(taskData)
    return result.id
  })

  ipcMain.handle(
    'update-task',
    async (_: IpcMainInvokeEvent, taskData: Partial<Task> & { id: number }): Promise<void> => {
      await JournalClient.updateTask(taskData.id, taskData)
    }
  )

  ipcMain.handle('complete-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    await JournalClient.completeTask(taskId)
  })

  ipcMain.handle('delete-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    await JournalClient.deleteTask(taskId)
  })

  ipcMain.handle('cancel-task', async (_: IpcMainInvokeEvent, taskId: number): Promise<void> => {
    await JournalClient.cancelTask(taskId)
  })

  ipcMain.handle(
    'migrate-task',
    async (_: IpcMainInvokeEvent, taskId: number, toTaskId: number): Promise<void> => {
      await JournalClient.migrateTask(taskId, toTaskId)
    }
  )
}
