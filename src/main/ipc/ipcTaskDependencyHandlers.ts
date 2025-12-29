import { Task } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addTaskDependency,
  getAllDependencies,
  getBlockedTasks,
  getCriticalPath,
  getDependentTasks,
  getTaskDependencies,
  getUnblockedTasks,
  removeTaskDependency
} from '../database/TaskDependencyManager'

export function setupTaskDependencyHandlers() {
  ipcMain.handle(
    'add-task-dependency',
    async (
      _: IpcMainInvokeEvent,
      taskId: number,
      dependsOnTaskId: number,
      dependencyType?: 'blocks' | 'related' | 'suggested',
      createdBy?: 'user' | 'ai_suggested'
    ): Promise<number> => {
      return addTaskDependency(taskId, dependsOnTaskId, dependencyType, createdBy)
    }
  )

  ipcMain.handle(
    'remove-task-dependency',
    async (_: IpcMainInvokeEvent, dependencyId: number): Promise<void> => {
      removeTaskDependency(dependencyId)
    }
  )

  ipcMain.handle(
    'get-task-dependencies',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Task[]> => {
      return getTaskDependencies(taskId)
    }
  )

  ipcMain.handle(
    'get-dependent-tasks',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Task[]> => {
      return getDependentTasks(taskId)
    }
  )

  ipcMain.handle('get-unblocked-tasks', async (): Promise<Task[]> => {
    return getUnblockedTasks()
  })

  ipcMain.handle('get-blocked-tasks', async (): Promise<Task[]> => {
    return getBlockedTasks()
  })

  ipcMain.handle('get-critical-path', async (): Promise<Task[]> => {
    return getCriticalPath()
  })

  ipcMain.handle(
    'get-all-dependencies',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Task[]> => {
      return getAllDependencies(taskId)
    }
  )
}
