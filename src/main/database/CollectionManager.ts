import { Collection } from '@shared/types'
import db from './sqlite'

export function getCollection(collectionId: number): Collection {
  const stmt = db.prepare('SELECT * FROM collections WHERE id = ?')
  const collection: Collection = stmt.get(collectionId) as Collection
  return convert(collection)
}

export function getCollections(): Collection[] {
  const stmt = db.prepare('SELECT * FROM collections')
  const collections: Collection[] = stmt.all() as Collection[]
  return collections.map((c) => convert(c))
}

export function addCollection(collectionData: Collection): number {
  const stmt = db.prepare(
    `INSERT INTO collections (title, description, longDescription, type, subType, createDate, startDate, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const result = stmt.run(
    collectionData.title,
    collectionData.description,
    collectionData.longDescription,
    collectionData.type,
    collectionData.subType,
    collectionData.createDate?.toISOString(),
    collectionData.startDate?.toISOString(),
    collectionData.metadata ? JSON.stringify(collectionData.metadata) : null
  )
  return result.lastInsertRowid as number
}

export function addAndRetrieveCollection(collectionData: Collection): Collection {
  const stmt = db.prepare(
    `INSERT INTO collections (title, description, longDescription, type, subType, createDate, startDate, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *`
  )
  const newCollection = stmt.get(
    collectionData.title,
    collectionData.description,
    collectionData.longDescription,
    collectionData.type,
    collectionData.subType,
    collectionData.createDate?.toISOString(),
    collectionData.startDate?.toISOString(),
    collectionData.metadata ? JSON.stringify(collectionData.metadata) : null
  ) as Collection
  return convert(newCollection)
}

export function updateCollection(collectionData: Collection): Collection {
  const updateStmt = db.prepare(
    `UPDATE collections
     SET title = ?, description = ?, longDescription = ?, type = ?, subType = ?, createDate = ?, startDate = ?, metadata = ?, archived_at = ?
     WHERE id = ?
     RETURNING *`
  )

  const updatedCollection = updateStmt.get(
    collectionData.title,
    collectionData.description,
    collectionData.longDescription,
    collectionData.type,
    collectionData.subType,
    collectionData.createDate?.toISOString(),
    collectionData.startDate?.toISOString(),
    collectionData.metadata ? JSON.stringify(collectionData.metadata) : null,
    collectionData.archived_at?.toISOString() || null,
    collectionData.id
  ) as Collection

  return convert(updatedCollection)
}

export function archiveCollection(collectionId: number) {
  const stmt = db.prepare('UPDATE collections SET archived_at = ? WHERE id = ?')
  stmt.run(new Date().toISOString(), collectionId)
}

export function deleteCollection(collectionId: number) {
  const stmt = db.prepare('DELETE FROM collections WHERE id = ?')
  stmt.run(collectionId)
}

function convert(collectionData: any): Collection {
  const converted: Collection = {
    id: collectionData.id,
    title: collectionData.title,
    description: collectionData.description && collectionData.description,
    longDescription: collectionData.longDescription && collectionData.longDescription,
    type: collectionData.type,
    subType: collectionData.subType,
    createDate: new Date(collectionData.createDate),
    startDate: collectionData.startDate && new Date(collectionData.startDate),
    endDate: collectionData.endDate && new Date(collectionData.endDate),
    canceledDate: collectionData.canceledDate && new Date(collectionData.canceledDate),
    archived_at: collectionData.archived_at && new Date(collectionData.archived_at),
    metadata: collectionData.metadata ? JSON.parse(collectionData.metadata) : undefined
  }
  return converted
}
