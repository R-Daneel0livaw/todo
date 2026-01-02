import { Task } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

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
      const result = await JournalClient.addTaskDependency(
        taskId,
        dependsOnTaskId,
        dependencyType,
        createdBy
      )
      return result.id
    }
  )

  ipcMain.handle(
    'remove-task-dependency',
    async (_: IpcMainInvokeEvent, dependencyId: number): Promise<void> => {
      await JournalClient.removeTaskDependency(dependencyId)
    }
  )

  ipcMain.handle(
    'get-task-dependencies',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Task[]> => {
      return JournalClient.getTaskDependencies(taskId)
    }
  )

  ipcMain.handle(
    'get-dependent-tasks',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Task[]> => {
      return JournalClient.getDependentTasks(taskId)
    }
  )

  ipcMain.handle('get-unblocked-tasks', async (): Promise<Task[]> => {
    return JournalClient.getUnblockedTasks()
  })

  ipcMain.handle('get-blocked-tasks', async (): Promise<Task[]> => {
    return JournalClient.getBlockedTasks()
  })

  ipcMain.handle('get-critical-path', async (): Promise<Task[]> => {
    return JournalClient.getCriticalPath()
  })

  ipcMain.handle(
    'get-all-dependencies',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Task[]> => {
      return JournalClient.getAllTaskDependencies(taskId)
    }
  )
}
