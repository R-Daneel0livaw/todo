import { Task } from '@shared/types'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addActivity,
  deleteOldActivity,
  getActivityByEvent,
  getActivityByTask,
  getActivitySummary,
  getRecentActivityByType,
  suggestTaskCompletion,
  type Activity,
  type ActivityType
} from '../database/ActivityManager'

export function setupActivityHandlers() {
  ipcMain.handle(
    'add-activity',
    async (
      _: IpcMainInvokeEvent,
      type: ActivityType,
      source: string,
      data: Record<string, any>,
      relatedTaskId?: number,
      relatedEventId?: number
    ): Promise<number> => {
      return addActivity(type, source, data, relatedTaskId, relatedEventId)
    }
  )

  ipcMain.handle(
    'get-activity-summary',
    async (
      _: IpcMainInvokeEvent,
      options?: { minutes?: number; hours?: number; days?: number }
    ): Promise<Activity[]> => {
      return getActivitySummary(options)
    }
  )

  ipcMain.handle(
    'get-activity-by-task',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<Activity[]> => {
      return getActivityByTask(taskId)
    }
  )

  ipcMain.handle(
    'get-activity-by-event',
    async (_: IpcMainInvokeEvent, eventId: number): Promise<Activity[]> => {
      return getActivityByEvent(eventId)
    }
  )

  ipcMain.handle(
    'suggest-task-completion',
    async (
      _: IpcMainInvokeEvent,
      minutes?: number
    ): Promise<Array<{ task: Task; confidence: number; reason: string }>> => {
      return suggestTaskCompletion(minutes)
    }
  )

  ipcMain.handle(
    'get-recent-activity-by-type',
    async (_: IpcMainInvokeEvent, type: ActivityType, limit?: number): Promise<Activity[]> => {
      return getRecentActivityByType(type, limit)
    }
  )

  ipcMain.handle(
    'delete-old-activity',
    async (_: IpcMainInvokeEvent, daysToKeep?: number): Promise<number> => {
      return deleteOldActivity(daysToKeep)
    }
  )
}
