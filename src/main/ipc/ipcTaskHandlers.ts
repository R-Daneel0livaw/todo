import { Task } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'

export function setupTaskHandlers() {
  ipcMain.handle('get-task', async (event: IpcMainInvokeEvent, taskId: number): Promise<Task> => {
    console.log('get-task', event, taskId)
    return getTask()
  })

  ipcMain.handle(
    'get-task-by-collection',
    async (event: IpcMainInvokeEvent, taskId: number, collectionId: number): Promise<Task> => {
      console.log('get-task-by-collection', event, taskId, collectionId)
      return getTask()
    }
  )

  ipcMain.handle(
    'get-tasks-by-collection',
    async (event: IpcMainInvokeEvent, collectionId: number): Promise<Task[]> => {
      console.log('get-tasks-by-collection', event, collectionId)
      return getTasks()
    }
  )

  ipcMain.handle('add-task', async (event: IpcMainInvokeEvent, taskData: Task): Promise<void> => {
    console.log('add-task', event, taskData)
  })

  ipcMain.handle(
    'delete-task',
    async (event: IpcMainInvokeEvent, taskId: number): Promise<void> => {
      console.log('delete-task', event, taskId)
    }
  )
}

function getTask(): Task {
  return {
    topic: 'Programming',
    status: 'CREATED',
    id: 1,
    title: 'TODO: IPC Handlers',
    createDate: new Date()
  }
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
