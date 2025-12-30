export type VmRole = 'security' | 'build' | 'test' | 'data' | 'general'
export type VmStatus = 'running' | 'stopped' | 'paused' | 'error'

export interface VmRegistry {
  id: number
  name: string
  role: VmRole
  status: VmStatus
  memory_mb?: number
  cpus?: number
  disk_size_mb?: number
  created_at: Date
  last_started_at?: Date
  last_stopped_at?: Date
  last_task_id?: number
}
