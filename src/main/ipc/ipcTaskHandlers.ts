import { Collection, Task } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addTask,
  cancelTask,
  deleteTask,
  getTask,
  getTaskByCollectionId,
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
    async (event: IpcMainInvokeEvent, collectionData: Partial<Collection>): Promise<Task[]> => {
      console.log('get-tasks-by-collection', event, collectionData)
      return getTasks()
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

function getTasks(): Task[] {
  const task: Task = {
    topic: 'Programming',
    status: 'CREATED',
    id: 1,
    title: 'TODO: IPC Handlers',
    createDate: new Date()
  }
  const task2: Task = {
    topic: 'Reading',
    status: 'CREATED',
    id: 2,
    title: 'Audio Book - Atomic Habits',
    createDate: new Date()
  }
  return [task, task2]
}
