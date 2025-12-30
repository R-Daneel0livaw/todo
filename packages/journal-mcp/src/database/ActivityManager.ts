import { Task } from '@awesome-dev-journal/shared'
import db from './sqlite.js'

export type ActivityType =
  | 'git_commit'
  | 'file_change'
  | 'file_open'
  | 'file_save'
  | 'test_run'
  | 'build'
  | 'deployment'
  | 'vm_task_complete'
  | 'session_start'
  | 'session_end'

export interface Activity {
  id: number
  type: ActivityType
  source: string
  data: Record<string, any>
  timestamp: Date
  related_task_id?: number
  related_event_id?: number
}

export function addActivity(
  type: ActivityType,
  source: string,
  data: Record<string, any>,
  relatedTaskId?: number,
  relatedEventId?: number
): number {
  const stmt = db.prepare(`
    INSERT INTO activity (type, source, data, related_task_id, related_event_id)
    VALUES (?, ?, ?, ?, ?)
  `)
  const result = stmt.run(type, source, JSON.stringify(data), relatedTaskId || null, relatedEventId || null)
  return result.lastInsertRowid as number
}

export function getActivitySummary(options?: {
  minutes?: number
  hours?: number
  days?: number
}): Activity[] {
  let timeFilter = ''
  const params: any[] = []

  if (options?.minutes) {
    timeFilter = "WHERE timestamp > datetime('now', '-' || ? || ' minutes')"
    params.push(options.minutes)
  } else if (options?.hours) {
    timeFilter = "WHERE timestamp > datetime('now', '-' || ? || ' hours')"
    params.push(options.hours)
  } else if (options?.days) {
    timeFilter = "WHERE timestamp > datetime('now', '-' || ? || ' days')"
    params.push(options.days)
  } else {
    // Default to last 24 hours
    timeFilter = "WHERE timestamp > datetime('now', '-1 day')"
  }

  const stmt = db.prepare(`
    SELECT * FROM activity
    ${timeFilter}
    ORDER BY timestamp DESC
  `)

  const activities = stmt.all(...params) as any[]
  return activities.map((a) => ({
    ...a,
    data: JSON.parse(a.data || '{}'),
    timestamp: new Date(a.timestamp)
  }))
}

export function getActivityByTask(taskId: number): Activity[] {
  const stmt = db.prepare(`
    SELECT * FROM activity
    WHERE related_task_id = ?
    ORDER BY timestamp DESC
  `)

  const activities = stmt.all(taskId) as any[]
  return activities.map((a) => ({
    ...a,
    data: JSON.parse(a.data || '{}'),
    timestamp: new Date(a.timestamp)
  }))
}

export function getActivityByEvent(eventId: number): Activity[] {
  const stmt = db.prepare(`
    SELECT * FROM activity
    WHERE related_event_id = ?
    ORDER BY timestamp DESC
  `)

  const activities = stmt.all(eventId) as any[]
  return activities.map((a) => ({
    ...a,
    data: JSON.parse(a.data || '{}'),
    timestamp: new Date(a.timestamp)
  }))
}

export function suggestTaskCompletion(minutes: number = 60): Array<{ task: Task; confidence: number; reason: string }> {
  // Find tasks that might be completed based on recent activity
  const stmt = db.prepare(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      COUNT(DISTINCT a.id) as matching_activities,
      GROUP_CONCAT(DISTINCT a.type) as activity_types
    FROM tasks t
    LEFT JOIN activity a ON
      a.timestamp > datetime('now', '-' || ? || ' minutes')
      AND (
        a.related_task_id = t.id
        OR (a.type = 'git_commit' AND json_extract(a.data, '$.message') LIKE '%' || t.title || '%')
      )
    WHERE t.status IN ('CREATED', 'IN_PROGRESS')
    GROUP BY t.id
    HAVING matching_activities > 2
    ORDER BY matching_activities DESC
  `)

  const results = stmt.all(minutes) as any[]

  return results.map((row) => {
    const confidence = Math.min(row.matching_activities * 20, 95) // Cap at 95%
    const reason = `${row.matching_activities} recent activities (${row.activity_types})`

    return {
      task: {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status
      } as Task,
      confidence,
      reason
    }
  })
}

export function getRecentActivityByType(type: ActivityType, limit: number = 10): Activity[] {
  const stmt = db.prepare(`
    SELECT * FROM activity
    WHERE type = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `)

  const activities = stmt.all(type, limit) as any[]
  return activities.map((a) => ({
    ...a,
    data: JSON.parse(a.data || '{}'),
    timestamp: new Date(a.timestamp)
  }))
}

export function deleteOldActivity(daysToKeep: number = 90) {
  const stmt = db.prepare(`
    DELETE FROM activity
    WHERE timestamp < datetime('now', '-' || ? || ' days')
  `)
  const result = stmt.run(daysToKeep)
  return result.changes
}
