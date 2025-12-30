import db from './sqlite'

export interface CollectionItem {
  id: number
  collectionId: number
  itemId: number
  itemType: 'Task' | 'Event' | 'Collection'
}

export function addToCollection(
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): number {
  const stmt = db.prepare(`
    INSERT INTO collectionItems (collectionId, itemId, itemType)
    VALUES (?, ?, ?)
  `)
  const result = stmt.run(collectionId, itemId, itemType)
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
