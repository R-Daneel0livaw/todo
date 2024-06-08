import Database, { Database as DbType } from 'better-sqlite3'

const db: DbType = new Database('todo.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    isCompleted BOOLEAN,
    createdAt TEXT,
    topic TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    date TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS collectionItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collectionId INTEGER,
    itemId INTEGER,
    itemType TEXT,
    FOREIGN KEY (collectionId) REFERENCES collections (id)
  );
`)

export default db
