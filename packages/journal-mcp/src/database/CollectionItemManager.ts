import { CollectionItem } from '@awesome-dev-journal/shared'
import db from './sqlite.js'

export function addToCollection(
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): number {
  const existing = db
    .prepare(
      `SELECT id FROM collectionItems WHERE collectionId = ? AND itemId = ? AND itemType = ?`
    )
    .get(collectionId, itemId, itemType) as { id: number } | undefined
  if (existing) return existing.id

  const { maxOrder } = db
    .prepare(`SELECT MAX(sortOrder) as maxOrder FROM collectionItems WHERE collectionId = ?`)
    .get(collectionId) as { maxOrder: number | null }
  const nextOrder = (maxOrder ?? -1) + 1

  const stmt = db.prepare(`
    INSERT INTO collectionItems (collectionId, itemId, itemType, sortOrder)
    VALUES (?, ?, ?, ?)
  `)
  const result = stmt.run(collectionId, itemId, itemType, nextOrder)
  return result.lastInsertRowid as number
}

export function removeFromCollection(
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
) {
  const stmt = db.prepare(`
    DELETE FROM collectionItems
    WHERE collectionId = ? AND itemId = ? AND itemType = ?
  `)
  stmt.run(collectionId, itemId, itemType)
}

export function getCollectionItems(collectionId: number): CollectionItem[] {
  const stmt = db.prepare(`
    SELECT * FROM collectionItems
    WHERE collectionId = ?
    ORDER BY sortOrder ASC, id ASC
  `)
  return stmt.all(collectionId) as CollectionItem[]
}

export function getItemCollections(
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): CollectionItem[] {
  const stmt = db.prepare(`
    SELECT * FROM collectionItems
    WHERE itemId = ? AND itemType = ?
  `)
  return stmt.all(itemId, itemType) as CollectionItem[]
}

export function isItemInCollection(
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM collectionItems
    WHERE collectionId = ? AND itemId = ? AND itemType = ?
  `)
  const result = stmt.get(collectionId, itemId, itemType) as { count: number }
  return result.count > 0
}

/**
 * Persist a new item order for a collection. `orderedItems` must list every
 * item currently in the collection, in the desired order — each gets
 * sortOrder = its index.
 */
export function reorderCollectionItems(
  collectionId: number,
  orderedItems: { itemId: number; itemType: 'Task' | 'Event' | 'Collection' }[]
): void {
  const stmt = db.prepare(`
    UPDATE collectionItems SET sortOrder = ?
    WHERE collectionId = ? AND itemId = ? AND itemType = ?
  `)
  const transaction = db.transaction(() => {
    orderedItems.forEach((item, index) => {
      stmt.run(index, collectionId, item.itemId, item.itemType)
    })
  })
  transaction()
}
