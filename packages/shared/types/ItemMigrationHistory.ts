export interface ItemMigrationHistory {
  id: number
  item_id: number
  item_type: 'Task' | 'Event'
  from_collection_id: number | null
  to_collection_id: number
  migrated_at: Date
  migrated_by?: string
  reason?: string
}

// Alias for backwards compatibility
export type TaskMigrationHistory = ItemMigrationHistory
