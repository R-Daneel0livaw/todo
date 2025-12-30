export interface TaskDependency {
  id: number
  task_id: number
  depends_on_task_id: number
  dependency_type: 'blocks' | 'related' | 'suggested'
  created_at: Date
  created_by?: 'user' | 'ai_suggested'
}
