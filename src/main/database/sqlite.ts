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
    canceledDate TEXT,
    topic TEXT
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
    FOREIGN KEY (collectionId) REFERENCES collections (id),
    FOREIGN KEY (itemId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES events(id) ON DELETE CASCADE
  );
`)

export default db
