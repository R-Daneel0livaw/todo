export interface EventTemplate {
  id: number
  title: string
  description?: string
  location?: string
  createDate: Date
  metadata?: Record<string, any>
  auto_spawn: boolean
  default_collection_id?: number
}
