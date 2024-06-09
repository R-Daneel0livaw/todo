import { Collection } from '@shared/types'
import db from './sqlite'

export function getCollections(): Collection[] {
  const stmt = db.prepare('SELECT * FROM collections')
  const collections: Collection[] = stmt.all() as Collection[]
  return collections
}
