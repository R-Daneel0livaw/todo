import { Collection } from '@shared/types'
import db from './sqlite'

  interface LastInsertRowId {
    id: number
}

export function getCollection(collectionId: number): Collection {
  const stmt = db.prepare('SELECT * FROM collections WHERE id = ?')
  const collection: Collection = stmt.get(collectionId) as Collection
  return collection
}

export function getCollections(): Collection[] {
  const stmt = db.prepare('SELECT * FROM collections')
  const collections: Collection[] = stmt.all() as Collection[]
  return collections
}

export function addCollection(collectionData: Collection) {
  const stmt = db.prepare(
    'INSERT INTO collections (title, description, longDescription, type, subType, createDate, startDate) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  stmt.run(
    collectionData.title,
    collectionData.description,
    collectionData.longDescription,
    collectionData.type,
    collectionData.subType,
    collectionData.createDate?.toISOString(),
    collectionData.startDate?.toISOString()
  )
}

export function addAndRetrieveCollection(collectionData: Collection) {
  addCollection(collectionData)
  const result = db.prepare('SELECT last_insert_rowid() as id').get() as LastInsertRowId
  const newCollection = getCollection(result.id)
  return newCollection
}

export function deleteCollection(collectionId: number) {
  const stmt = db.prepare('DELETE FROM collections WHERE id = ?')
  stmt.run(collectionId)
}
