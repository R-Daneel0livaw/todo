export interface TaskTemplate {
  id: number
  title: string
  description?: string
  topic: string
  createDate: Date
  metadata?: Record<string, any>
  auto_spawn: boolean
  default_collection_id?: number
}
