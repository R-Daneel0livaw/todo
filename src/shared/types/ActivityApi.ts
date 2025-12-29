import { Activity, ActivityType, Task } from '.'

export interface ActivityApi {
  addActivity(
    type: ActivityType,
    source: string,
    data: Record<string, any>,
    relatedTaskId?: number,
    relatedEventId?: number
  ): Promise<number>
  getActivitySummary(options?: {
    minutes?: number
    hours?: number
    days?: number
  }): Promise<Activity[]>
  getActivityByTask(taskId: number): Promise<Activity[]>
  getActivityByEvent(eventId: number): Promise<Activity[]>
  suggestTaskCompletion(minutes?: number): Promise<
    Array<{
      task: Task
      confidence: number
      reason: string
    }>
  >
  getRecentActivityByType(type: ActivityType, limit?: number): Promise<Activity[]>
  deleteOldActivity(daysToKeep?: number): Promise<void>
}
