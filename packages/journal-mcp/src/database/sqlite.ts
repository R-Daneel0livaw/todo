import { Collection } from '@awesome-dev-journal/shared'
import Database from 'better-sqlite3'
import type { Database as BetterSqlite3Database } from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', '..', 'todo.db')

const db: BetterSqlite3Database = new Database(dbPath)

// Enable foreign key constraints
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT,
    status TEXT NOT NULL,
    createDate TEXT,
    startDate TEXT,
    endDate TEXT,
    canceledDate TEXT,
    migrated_from_id INTEGER,
    migrated_to_id INTEGER,
    metadata TEXT,
    CHECK (status IN ('CREATED', 'MIGRATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED', 'DELETED')),
    FOREIGN KEY (migrated_from_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (migrated_to_id) REFERENCES tasks(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    status TEXT NOT NULL,
    createDate TEXT,
    startDate TEXT,
    endDate TEXT,
    canceledDate TEXT,
    scheduledDate TEXT,
    metadata TEXT,
    CHECK (status IN ('CREATED', 'MIGRATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED', 'DELETED'))
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    longDescription TEXT,
    type TEXT NOT NULL,
    subType TEXT,
    createDate TEXT,
    startDate TEXT,
    endDate TEXT,
    canceledDate TEXT,
    archived_at TEXT,
    metadata TEXT,
    CHECK (type IN ('DEFAULT', 'QUARTERLY', 'MONTHLY', 'DAILY', 'PROJECT', 'CUSTOM')),
    CHECK (subType IS NULL OR subType IN ('TASK', 'EVENT', 'PLAN', 'LOG', 'CUSTOM'))
  );

  CREATE TABLE IF NOT EXISTS collectionItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collectionId INTEGER NOT NULL,
    itemId INTEGER,
    itemType TEXT NOT NULL CHECK (itemType IN ('Task', 'Event', 'Collection')),
    FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS task_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    depends_on_task_id INTEGER NOT NULL,
    dependency_type TEXT DEFAULT 'blocks',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    CHECK (dependency_type IN ('blocks', 'related', 'suggested')),
    CHECK (task_id != depends_on_task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(task_id, depends_on_task_id)
  );

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    data TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    related_task_id INTEGER,
    related_event_id INTEGER,
    CHECK (type IN (
      'git_commit', 'file_change', 'file_open', 'file_save',
      'test_run', 'build', 'deployment', 'vm_task_complete',
      'session_start', 'session_end'
    )),
    FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS vm_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'stopped',
    memory_mb INTEGER,
    cpus INTEGER,
    disk_size_mb INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_started_at TEXT,
    last_stopped_at TEXT,
    last_task_id INTEGER,
    CHECK (role IN ('security', 'build', 'test', 'data', 'general')),
    CHECK (status IN ('running', 'stopped', 'paused', 'error')),
    FOREIGN KEY (last_task_id) REFERENCES tasks(id) ON DELETE SET NULL
  );

  -- Indexes for tasks
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_createDate ON tasks(createDate);
  CREATE INDEX IF NOT EXISTS idx_tasks_migrated_from ON tasks(migrated_from_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_migrated_to ON tasks(migrated_to_id);

  -- Indexes for events
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_events_scheduledDate ON events(scheduledDate);

  -- Indexes for collections
  CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type);
  CREATE INDEX IF NOT EXISTS idx_collections_subType ON collections(subType);
  CREATE INDEX IF NOT EXISTS idx_collections_type_subType ON collections(type, subType);
  CREATE INDEX IF NOT EXISTS idx_collections_archived ON collections(archived_at);

  -- Indexes for collectionItems
  CREATE INDEX IF NOT EXISTS idx_collectionItems_collectionId ON collectionItems(collectionId);
  CREATE INDEX IF NOT EXISTS idx_collectionItems_itemId ON collectionItems(itemId);
  CREATE INDEX IF NOT EXISTS idx_collectionItems_itemType ON collectionItems(itemType);

  -- Indexes for task_dependencies
  CREATE INDEX IF NOT EXISTS idx_task_deps_task ON task_dependencies(task_id);
  CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on ON task_dependencies(depends_on_task_id);
  CREATE INDEX IF NOT EXISTS idx_task_deps_type ON task_dependencies(dependency_type);

  -- Indexes for activity
  CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_activity_type ON activity(type);
  CREATE INDEX IF NOT EXISTS idx_activity_source ON activity(source);
  CREATE INDEX IF NOT EXISTS idx_activity_related_task ON activity(related_task_id);

  -- Indexes for vm_registry
  CREATE INDEX IF NOT EXISTS idx_vm_role ON vm_registry(role);
  CREATE INDEX IF NOT EXISTS idx_vm_status ON vm_registry(status);
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
