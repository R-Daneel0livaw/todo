import { ItemMigrationHistory } from '@awesome-dev-journal/shared'
import db from './sqlite.js'

/**
 * Record an item migration in history
 */
export function recordMigration(
  itemId: number,
  itemType: 'Task' | 'Event',
  fromCollectionId: number | null,
  toCollectionId: number,
  migratedBy?: string,
  reason?: string
): number {
  const stmt = db.prepare(`
    INSERT INTO item_migration_history (item_id, item_type, from_collection_id, to_collection_id, migrated_by, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(itemId, itemType, fromCollectionId, toCollectionId, migratedBy, reason)
  return result.lastInsertRowid as number
}

/**
 * Get migration history for a specific item
 */
export function getItemMigrationHistory(itemId: number, itemType: 'Task' | 'Event'): ItemMigrationHistory[] {
  const stmt = db.prepare(`
    SELECT
      id,
      item_id,
      item_type,
      from_collection_id,
      to_collection_id,
      migrated_at,
      migrated_by,
      reason
    FROM item_migration_history
    WHERE item_id = ? AND item_type = ?
    ORDER BY migrated_at ASC
  `)
  const rows = stmt.all(itemId, itemType) as any[]
  return rows.map((row) => ({
    id: row.id,
    item_id: row.item_id,
    item_type: row.item_type,
    from_collection_id: row.from_collection_id,
    to_collection_id: row.to_collection_id,
    migrated_at: new Date(row.migrated_at),
    migrated_by: row.migrated_by,
    reason: row.reason
  }))
}

/**
 * Get all migrations from a specific collection
 */
export function getMigrationsFromCollection(collectionId: number, itemType?: 'Task' | 'Event'): ItemMigrationHistory[] {
  let query = `
    SELECT
      id,
      item_id,
      item_type,
      from_collection_id,
      to_collection_id,
      migrated_at,
      migrated_by,
      reason
    FROM item_migration_history
    WHERE from_collection_id = ?
  `
  const params: any[] = [collectionId]

  if (itemType) {
    query += ' AND item_type = ?'
    params.push(itemType)
  }

  query += ' ORDER BY migrated_at DESC'

  const stmt = db.prepare(query)
  const rows = stmt.all(...params) as any[]
  return rows.map((row) => ({
    id: row.id,
    item_id: row.item_id,
    item_type: row.item_type,
    from_collection_id: row.from_collection_id,
    to_collection_id: row.to_collection_id,
    migrated_at: new Date(row.migrated_at),
    migrated_by: row.migrated_by,
    reason: row.reason
  }))
}

/**
 * Get all migrations to a specific collection
 */
export function getMigrationsToCollection(collectionId: number, itemType?: 'Task' | 'Event'): ItemMigrationHistory[] {
  let query = `
    SELECT
      id,
      item_id,
      item_type,
      from_collection_id,
      to_collection_id,
      migrated_at,
      migrated_by,
      reason
    FROM item_migration_history
    WHERE to_collection_id = ?
  `
  const params: any[] = [collectionId]

  if (itemType) {
    query += ' AND item_type = ?'
    params.push(itemType)
  }

  query += ' ORDER BY migrated_at DESC'

  const stmt = db.prepare(query)
  const rows = stmt.all(...params) as any[]
  return rows.map((row) => ({
    id: row.id,
    item_id: row.item_id,
    item_type: row.item_type,
    from_collection_id: row.from_collection_id,
    to_collection_id: row.to_collection_id,
    migrated_at: new Date(row.migrated_at),
    migrated_by: row.migrated_by,
    reason: row.reason
  }))
}

/**
 * Get all migration history entries
 */
export function getAllMigrationHistory(itemType?: 'Task' | 'Event'): ItemMigrationHistory[] {
  let query = `
    SELECT
      id,
      item_id,
      item_type,
      from_collection_id,
      to_collection_id,
      migrated_at,
      migrated_by,
      reason
    FROM item_migration_history
  `

  const params: any[] = []
  if (itemType) {
    query += ' WHERE item_type = ?'
    params.push(itemType)
  }

  query += ' ORDER BY migrated_at DESC'

  const stmt = db.prepare(query)
  const rows = stmt.all(...params) as any[]
  return rows.map((row) => ({
    id: row.id,
    item_id: row.item_id,
    item_type: row.item_type,
    from_collection_id: row.from_collection_id,
    to_collection_id: row.to_collection_id,
    migrated_at: new Date(row.migrated_at),
    migrated_by: row.migrated_by,
    reason: row.reason
  }))
}

/**
 * Get migration count for an item
 */
export function getItemMigrationCount(itemId: number, itemType: 'Task' | 'Event'): number {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM item_migration_history
    WHERE item_id = ? AND item_type = ?
  `)
  const result = stmt.get(itemId, itemType) as any
  return result.count
}

/**
 * Get most migrated items (items with highest migration count)
 */
export function getMostMigratedItems(itemType?: 'Task' | 'Event', limit: number = 10): Array<{ item_id: number; item_type: string; migration_count: number }> {
  let query = `
    SELECT
      item_id,
      item_type,
      COUNT(*) as migration_count
    FROM item_migration_history
  `

  const params: any[] = []
  if (itemType) {
    query += ' WHERE item_type = ?'
    params.push(itemType)
  }

  query += `
    GROUP BY item_id, item_type
    ORDER BY migration_count DESC
    LIMIT ?
  `
  params.push(limit)

  const stmt = db.prepare(query)
  return stmt.all(...params) as any[]
}
