import { Collection } from '@shared/types'
import Database from 'better-sqlite3'
import type { Database as BetterSqlite3Database } from 'better-sqlite3'

const db: BetterSqlite3Database = new Database('todo.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    topic TEXT,
    status TEXT,
    createDate TEXT,
    startDate TEXT,
    endDate TEXT,
    canceledDate TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    status TEXT,
    createDate TEXT,
    startDate TEXT,
    endDate TEXT,
    canceledDate TEXT
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    longDescription TEXT,
    type TEXT,
    subType TEXT,
    createDate TEXT,
    startDate TEXT,
    endDate TEXT,
    canceledDate TEXT
  );
  
  CREATE TABLE IF NOT EXISTS collectionItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collectionId INTEGER NOT NULL,
    itemId INTEGER,
    itemType TEXT NOT NULL CHECK (itemType IN ('Task', 'Event', 'Collection')),
    FOREIGN KEY (collectionId) REFERENCES collections (id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES events(id) ON DELETE CASCADE
  );
`)

const defaultCollections: Partial<Collection>[] = [
  {
    title: 'Task List',
    description: 'Main Task List',
    longDescription: 'All created Tasks will be available in the Main Task List.',
    type: 'DEFAULT',
    subType: 'TASK',
    createDate: new Date(),
    startDate: new Date()
  },
  {
    title: 'Event List',
    description: 'Main Event List',
    longDescription: 'All created Events will be available in the Main Event List.',
    type: 'DEFAULT',
    subType: 'EVENT',
    createDate: new Date(),
    startDate: new Date()
  }
]

const insertStmt = db.prepare(
  'INSERT INTO collections (title, description, longDescription, type, subType, createDate, startDate) VALUES (?, ?, ?, ?, ?, ?, ?)'
)
const checkStmt = db.prepare('SELECT 1 FROM collections WHERE type = ? AND subType = ?')

db.transaction(() => {
  defaultCollections.forEach((collection) => {
    const row = checkStmt.get(collection.type, collection.subType)
    if (!row) {
      insertStmt.run(
        collection.title,
        collection.description,
        collection.longDescription,
        collection.type,
        collection.subType,
        collection.createDate?.toISOString(),
        collection.startDate?.toISOString()
      )
    }
  })
})()

export default db
