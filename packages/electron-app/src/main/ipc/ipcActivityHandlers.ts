import { Task, ActivityType } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

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
      const result = await JournalClient.addActivity(type, source, data, relatedTaskId, relatedEventId)
      return result.id
    }
  )

  ipcMain.handle(
    'get-activity-summary',
    async (
      _: IpcMainInvokeEvent,
      options?: { minutes?: number; hours?: number; days?: number }
    ): Promise<any[]> => {
      return JournalClient.getActivitySummary(options)
    }
  )

  ipcMain.handle(
    'get-activity-by-task',
    async (_: IpcMainInvokeEvent, taskId: number): Promise<any[]> => {
      return JournalClient.getActivityByTask(taskId)
    }
  )

  ipcMain.handle(
    'get-activity-by-event',
    async (_: IpcMainInvokeEvent, eventId: number): Promise<any[]> => {
      return JournalClient.getActivityByEvent(eventId)
    }
  )

  ipcMain.handle(
    'suggest-task-completion',
    async (
      _: IpcMainInvokeEvent,
      minutes?: number
    ): Promise<Array<{ task: Task; confidence: number; reason: string }>> => {
      return JournalClient.suggestTaskCompletion(minutes)
    }
  )

  ipcMain.handle(
    'get-recent-activity-by-type',
    async (_: IpcMainInvokeEvent, type: ActivityType, limit?: number): Promise<any[]> => {
      return JournalClient.getRecentActivityByType(type, limit)
    }
  )

  ipcMain.handle(
    'delete-old-activity',
    async (_: IpcMainInvokeEvent, daysToKeep?: number): Promise<void> => {
      await JournalClient.deleteOldActivity(daysToKeep)
    }
  )
}
