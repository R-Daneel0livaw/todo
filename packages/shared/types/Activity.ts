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
