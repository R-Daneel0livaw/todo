# Database Schema Design

## Overview

SQLite database for the bullet journal system. Designed for simplicity, performance, and extensibility. Follows traditional bullet journal methodology with separate tasks and events, organized through collections.

---

## Tables

### 1. tasks

Core task storage following bullet journal methodology. Tasks are actionable items (• bullets in bullet journal).

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Core task data
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  status TEXT NOT NULL,

  -- Timestamps
  createDate TEXT,
  startDate TEXT,
  endDate TEXT,
  canceledDate TEXT,

  -- Migration tracking (bullet journal feature)
  migrated_from_id INTEGER,
  migrated_to_id INTEGER,

  -- Extensibility
  metadata TEXT,  -- JSON for future extensibility

  -- Constraints
  CHECK (status IN ('CREATED', 'MIGRATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED', 'DELETED')),

  -- Foreign keys
  FOREIGN KEY (migrated_from_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (migrated_to_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_createDate ON tasks(createDate);
CREATE INDEX idx_tasks_migrated_from ON tasks(migrated_from_id);
CREATE INDEX idx_tasks_migrated_to ON tasks(migrated_to_id);
```

**Example Data:**
```sql
INSERT INTO tasks (title, description, topic, status, createDate) VALUES
  ('Implement OAuth integration', 'Add OAuth 2.0 support', 'auth', 'IN_PROGRESS', '2024-12-21'),
  ('Fixed critical auth bug', 'Resolved token validation issue', 'auth', 'FINISHED', '2024-12-20'),
  ('Research graph algorithms', 'Study dependency graph implementations', 'learning', 'CREATED', '2024-12-21');
```

---

### 2. events

Events are scheduled occurrences (○ bullets in bullet journal). Separate from tasks as per bullet journal methodology.

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Core event data
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT NOT NULL,

  -- Timestamps
  createDate TEXT,
  startDate TEXT,
  endDate TEXT,
  canceledDate TEXT,
  scheduledDate TEXT,

  -- Extensibility
  metadata TEXT,  -- JSON for future extensibility

  -- Constraints
  CHECK (status IN ('CREATED', 'MIGRATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED', 'DELETED'))
);
```

**Indexes:**
```sql
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_scheduledDate ON events(scheduledDate);
```

**Example Data:**
```sql
INSERT INTO events (title, description, location, status, scheduledDate) VALUES
  ('Team standup', 'Daily team sync', 'Zoom', 'CREATED', '2024-12-21T10:00:00'),
  ('Client demo', 'Demo new features to client', 'Conference Room A', 'CREATED', '2024-12-22T14:00:00');
```

---

### 3. collections

Collections organize tasks and events. Represents various bullet journal concepts: Daily Logs, Monthly Plans, Projects, etc.

```sql
CREATE TABLE collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Core data
  title TEXT NOT NULL,
  description TEXT,
  longDescription TEXT,
  type TEXT NOT NULL,
  subType TEXT NOT NULL,

  -- Timestamps
  createDate TEXT,
  startDate TEXT,
  endDate TEXT,
  canceledDate TEXT,
  archived_at DATETIME,

  -- Metadata
  metadata TEXT,  -- JSON for extensibility

  -- Constraints
  CHECK (type IN ('DEFAULT', 'QUARTERLY', 'MONTHLY', 'DAILY', 'PROJECT', 'CUSTOM')),
  CHECK (subType IN ('TASK', 'EVENT', 'PLAN', 'LOG', 'CUSTOM'))
);
```

**Indexes:**
```sql
CREATE INDEX idx_collections_type ON collections(type);
CREATE INDEX idx_collections_subType ON collections(subType);
CREATE INDEX idx_collections_type_subType ON collections(type, subType);
CREATE INDEX idx_collections_archived ON collections(archived_at);
```

**Example Data:**
```sql
INSERT INTO collections (title, description, type, subType, createDate) VALUES
  ('Task List', 'Main Task List', 'DEFAULT', 'TASK', '2024-12-21'),
  ('Event List', 'Main Event List', 'DEFAULT', 'EVENT', '2024-12-21'),
  ('December 2024 Plan', 'Monthly plan for December', 'MONTHLY', 'PLAN', '2024-12-01'),
  ('Auth Project', 'Authentication system implementation', 'PROJECT', 'TASK', '2024-12-15'),
  ('Daily Log 2024-12-21', 'Daily log for Dec 21', 'DAILY', 'LOG', '2024-12-21');
```

---

### 4. collectionItems

Junction table linking tasks and events to collections. Enables many-to-many relationships (e.g., a task can be in both a Daily Log and a Project).

```sql
CREATE TABLE collectionItems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collectionId INTEGER NOT NULL,
  itemId INTEGER,
  itemType TEXT NOT NULL CHECK (itemType IN ('Task', 'Event', 'Collection')),

  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES events(id) ON DELETE CASCADE
);
```

**Indexes:**
```sql
CREATE INDEX idx_collectionItems_collectionId ON collectionItems(collectionId);
CREATE INDEX idx_collectionItems_itemId ON collectionItems(itemId);
CREATE INDEX idx_collectionItems_itemType ON collectionItems(itemType);
```

**Example Data:**
```sql
-- Task 1 appears in both Daily Log and Auth Project
INSERT INTO collectionItems (collectionId, itemId, itemType) VALUES
  (5, 1, 'Task'),  -- Daily Log 2024-12-21 contains Task 1
  (4, 1, 'Task');  -- Auth Project contains Task 1
```

---

### 5. task_dependencies

Task dependency graph for managing task relationships and ordering. Critical for AI-powered dependency analysis and critical path detection.

```sql
CREATE TABLE task_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Core dependency relationship
  task_id INTEGER NOT NULL,              -- The dependent task
  depends_on_task_id INTEGER NOT NULL,    -- The task it depends on
  
  -- Dependency metadata
  dependency_type TEXT DEFAULT 'blocks',  -- 'blocks', 'related', 'suggested'
  
  -- Tracking
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,  -- 'user' or 'ai_suggested'
  
  -- Constraints
  CHECK (dependency_type IN ('blocks', 'related', 'suggested')),
  CHECK (task_id != depends_on_task_id),  -- Prevent self-dependencies
  
  -- Foreign keys
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Prevent duplicate dependencies
  UNIQUE(task_id, depends_on_task_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_task_deps_type ON task_dependencies(dependency_type);
```

**Example Data:**
```sql
-- "Deploy to prod" depends on "Run tests"
INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, created_by) VALUES
  (10, 8, 'blocks', 'user'),
  (8, 7, 'blocks', 'ai_suggested'),
  (12, 10, 'related', 'user');
```

**Interpretation:**
- Task 10 (Deploy) is **blocked by** Task 8 (Tests)
- Task 8 (Tests) is **blocked by** Task 7 (Code Review)
- Task 12 (Documentation) is **related to** Task 10 (Deploy) but not blocking

---

### 6. activity

Tracks developer activity from various sources (git, files, IDE, VMs). Used for automatic task completion suggestions and activity summaries.

```sql
CREATE TABLE activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Core activity data
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  data TEXT,  -- JSON with activity-specific data
  
  -- Timestamp
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Optional links to tasks or events
  related_task_id INTEGER,
  related_event_id INTEGER,
  
  -- Constraints
  CHECK (type IN (
    'git_commit', 'file_change', 'file_open', 'file_save',
    'test_run', 'build', 'deployment', 'vm_task_complete',
    'session_start', 'session_end'
  )),
  
  -- Foreign keys
  FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_activity_timestamp ON activity(timestamp DESC);
CREATE INDEX idx_activity_type ON activity(type);
CREATE INDEX idx_activity_source ON activity(source);
CREATE INDEX idx_activity_task ON activity(related_task_id);
CREATE INDEX idx_activity_timestamp_type ON activity(timestamp, type);
```

**Example Data:**
```sql
INSERT INTO activity (type, source, data) VALUES
  ('git_commit', 'dev-vm', '{"hash":"a3f2b1c","message":"Implement OAuth","files":["auth.ts","token.ts"]}'),
  ('file_save', 'vscode', '{"file":"src/auth-service.ts","language":"typescript"}'),
  ('test_run', 'dev-vm', '{"passed":15,"failed":0,"duration_ms":2340}'),
  ('vm_task_complete', 'scanner-1', '{"task_id":42,"result":{"hosts_found":12}}');
```

---

### 7. vm_registry

Tracks VMs created and managed by the system for orchestration and task execution.

**Note:** Daily logs are implemented as collections with `type='DAILY'` and `subType='LOG'` rather than a separate table. This follows the flexible collection model.

```sql
CREATE TABLE vm_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- VM identification
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  
  -- VM metadata
  status TEXT NOT NULL DEFAULT 'stopped',
  memory_mb INTEGER,
  cpus INTEGER,
  disk_size_mb INTEGER,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_started_at DATETIME,
  last_stopped_at DATETIME,
  
  -- Tracking
  last_task_id INTEGER,
  
  -- Constraints
  CHECK (role IN ('security', 'build', 'test', 'data', 'general')),
  CHECK (status IN ('running', 'stopped', 'paused', 'error')),
  
  -- Foreign key
  FOREIGN KEY (last_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_vm_role ON vm_registry(role);
CREATE INDEX idx_vm_status ON vm_registry(status);
```

**Example Data:**
```sql
INSERT INTO vm_registry (name, role, status, memory_mb, cpus) VALUES
  ('scanner-1', 'security', 'running', 4096, 2),
  ('builder-1', 'build', 'stopped', 8192, 4),
  ('test-runner-1', 'test', 'running', 2048, 2);
```

---

## Relationships

```
collections ←→ tasks (M:N via collectionItems)
          ↘
           ←→ events (M:N via collectionItems)

tasks ←→ tasks (dependencies - M:N via task_dependencies)
  ↓ 1:N
activity (optional link)
  ↓ 1:N
events (optional link)

vm_registry
  ↓ 1:N
tasks (last_task_id reference)
```

**Key Relationships:**
- Collections can contain multiple tasks and events (via collectionItems junction table)
- Tasks can belong to multiple collections (e.g., both Daily Log and Project)
- Tasks can depend on other tasks (via task_dependencies for dependency graph)
- Activity can optionally reference tasks or events
- VMs track their last assigned task

---

## Common Queries

### Get Tasks in a Collection

```sql
SELECT
  t.*,
  COUNT(td.depends_on_task_id) as dependency_count
FROM tasks t
JOIN collectionItems ci ON t.id = ci.itemId AND ci.itemType = 'Task'
LEFT JOIN task_dependencies td ON t.id = td.task_id
WHERE ci.collectionId = ?
GROUP BY t.id
ORDER BY t.createDate ASC;
```

### Get Today's Daily Log

```sql
SELECT *
FROM collections
WHERE type = 'DAILY'
  AND subType = 'LOG'
  AND DATE(createDate) = DATE('now');
```

### Get All Items in Today's Daily Log

```sql
SELECT
  ci.itemType,
  CASE
    WHEN ci.itemType = 'Task' THEN t.title
    WHEN ci.itemType = 'Event' THEN e.title
  END as title,
  CASE
    WHEN ci.itemType = 'Task' THEN t.status
    WHEN ci.itemType = 'Event' THEN e.status
  END as status
FROM collectionItems ci
JOIN collections c ON ci.collectionId = c.id
LEFT JOIN tasks t ON ci.itemId = t.id AND ci.itemType = 'Task'
LEFT JOIN events e ON ci.itemId = e.id AND ci.itemType = 'Event'
WHERE c.type = 'DAILY'
  AND c.subType = 'LOG'
  AND DATE(c.createDate) = DATE('now');
```

---

### Get Unblocked Tasks

```sql
-- Tasks with no incomplete dependencies
SELECT t.*
FROM tasks t
WHERE t.status = 'open'
  AND t.id NOT IN (
    SELECT td.task_id
    FROM task_dependencies td
    JOIN tasks dep ON td.depends_on_task_id = dep.id
    WHERE td.dependency_type = 'blocks'
      AND dep.status != 'completed'
  )
ORDER BY t.created_at ASC;
```

---

### Get Blocked Tasks

```sql
-- Tasks waiting on dependencies
SELECT 
  t.*,
  GROUP_CONCAT(dep.content, ', ') as blocked_by
FROM tasks t
JOIN task_dependencies td ON t.id = td.task_id
JOIN tasks dep ON td.depends_on_task_id = dep.id
WHERE t.status = 'open'
  AND dep.status != 'completed'
  AND td.dependency_type = 'blocks'
GROUP BY t.id;
```

---

### Get All Dependencies (Transitive)

```sql
-- Recursive CTE for all dependencies
WITH RECURSIVE all_deps(task_id, depends_on_task_id, depth) AS (
  -- Base case: direct dependencies
  SELECT task_id, depends_on_task_id, 1
  FROM task_dependencies
  WHERE task_id = ?
  
  UNION ALL
  
  -- Recursive case: indirect dependencies
  SELECT ad.task_id, td.depends_on_task_id, ad.depth + 1
  FROM all_deps ad
  JOIN task_dependencies td ON ad.depends_on_task_id = td.task_id
  WHERE ad.depth < 10  -- Prevent infinite loops
)
SELECT DISTINCT 
  t.*,
  ad.depth
FROM all_deps ad
JOIN tasks t ON ad.depends_on_task_id = t.id
ORDER BY ad.depth, t.id;
```

---

### Detect Dependency Cycle

```sql
-- Check if adding edge (task_A → task_B) would create cycle
WITH RECURSIVE reachable(node) AS (
  -- Start from task_B
  SELECT ? as node  -- task_B
  
  UNION
  
  -- Follow edges backwards (what can reach task_B?)
  SELECT td.task_id
  FROM reachable r
  JOIN task_dependencies td ON r.node = td.depends_on_task_id
)
SELECT COUNT(*) > 0 as has_cycle
FROM reachable
WHERE node = ?;  -- task_A (if we can reach A from B, adding A→B creates cycle)
```

---

### Get Recent Activity Summary

```sql
SELECT 
  type,
  source,
  COUNT(*) as count,
  GROUP_CONCAT(DISTINCT json_extract(data, '$.file'), ', ') as files,
  MAX(timestamp) as latest
FROM activity
WHERE timestamp > datetime('now', '-1 hour')
GROUP BY type, source
ORDER BY latest DESC;
```

---

### Suggest Task Completion

```sql
-- Match activity to open tasks by keyword matching
SELECT 
  t.id,
  t.content,
  COUNT(DISTINCT a.id) as matching_activities,
  GROUP_CONCAT(DISTINCT a.type, ', ') as activity_types
FROM tasks t
JOIN activity a ON 
  a.timestamp > datetime('now', '-1 hour')
  AND (
    -- Match commit messages
    (a.type = 'git_commit' AND json_extract(a.data, '$.message') LIKE '%' || t.content || '%')
    -- Match file names
    OR (a.type IN ('file_save', 'file_change') 
        AND json_extract(a.data, '$.file') IN (
          SELECT json_extract(a2.data, '$.file')
          FROM activity a2
          WHERE a2.timestamp > datetime('now', '-1 hour')
        ))
  )
WHERE t.status = 'open'
GROUP BY t.id
HAVING matching_activities > 2  -- At least 3 matching activities
ORDER BY matching_activities DESC;
```

---

## Migrations

### Migration System

Store migration history:

```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Example Migration: Add Priority Field

```sql
-- Migration: 002_add_task_priority.sql

-- Up migration
ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0;
CREATE INDEX idx_tasks_priority ON tasks(priority);

INSERT INTO schema_migrations (version, name) VALUES 
  (2, 'add_task_priority');

-- Rollback (if needed)
-- ALTER TABLE tasks DROP COLUMN priority;
-- DROP INDEX idx_tasks_priority;
-- DELETE FROM schema_migrations WHERE version = 2;
```

---

## Data Validation

### Application-Level Checks

```javascript
function validateTask(task) {
  if (!task.content || task.content.trim().length === 0) {
    throw new Error('Task content cannot be empty');
  }
  
  if (!['task', 'event', 'note'].includes(task.type)) {
    throw new Error('Invalid task type');
  }
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(task.date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
}

function validateDependency(taskId, dependsOnTaskId) {
  if (taskId === dependsOnTaskId) {
    throw new Error('Task cannot depend on itself');
  }
  
  // Check for cycles (see cycle detection query above)
  if (wouldCreateCycle(taskId, dependsOnTaskId)) {
    throw new Error('Dependency would create a circular dependency');
  }
}
```

---

## Performance Considerations

### Index Strategy

**Always index:**
- Foreign keys
- Fields used in WHERE clauses frequently
- Fields used in JOIN conditions
- Fields used in ORDER BY

**Composite indexes for:**
- Common query patterns (date + status)
- Timestamp + type queries

### Query Optimization

```sql
-- Good: Uses index
SELECT * FROM tasks WHERE date = '2024-12-21' AND status = 'open';

-- Bad: Can't use index effectively
SELECT * FROM tasks WHERE date LIKE '2024-12%';

-- Better: Use explicit date range
SELECT * FROM tasks 
WHERE date >= '2024-12-01' AND date < '2025-01-01';
```

### Batch Operations

```javascript
// Insert multiple activities at once
db.prepare('INSERT INTO activity (type, source, data) VALUES (?, ?, ?)')
  .run('git_commit', 'dev-vm', JSON.stringify(data));

// Better: Use transaction
const insertMany = db.transaction((activities) => {
  const stmt = db.prepare('INSERT INTO activity (type, source, data) VALUES (?, ?, ?)');
  for (const activity of activities) {
    stmt.run(activity.type, activity.source, JSON.stringify(activity.data));
  }
});

insertMany(activities);  // Much faster!
```

---

## Backup Strategy

### Daily Backups

```bash
#!/bin/bash
# Backup script

DATE=$(date +%Y%m%d)
BACKUP_DIR="./backups"
DB_FILE="./bullet-journal.db"

mkdir -p $BACKUP_DIR

# SQLite backup command
sqlite3 $DB_FILE ".backup $BACKUP_DIR/journal-$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "journal-*.db" -mtime +30 -delete

echo "Backup created: journal-$DATE.db"
```

### Export to JSON

```javascript
// Export all data to JSON for portability
function exportToJSON(db) {
  return {
    tasks: db.prepare('SELECT * FROM tasks').all(),
    collections: db.prepare('SELECT * FROM collections').all(),
    dependencies: db.prepare('SELECT * FROM task_dependencies').all(),
    activity: db.prepare('SELECT * FROM activity').all(),
    daily_logs: db.prepare('SELECT * FROM daily_logs').all()
  };
}
```

---

## Testing Data

### Seed Script for Development

```sql
-- Seed data for testing

-- Collections
INSERT INTO collections (name, type, description) VALUES
  ('auth-system', 'project', 'Authentication and authorization'),
  ('api-refactor', 'project', 'API v2 refactoring'),
  ('learning', 'context', 'Learning and research');

-- Tasks
INSERT INTO tasks (content, status, type, date, collection_id) VALUES
  ('Implement OAuth 2.0', 'open', 'task', '2024-12-21', 1),
  ('Write auth tests', 'open', 'task', '2024-12-21', 1),
  ('Deploy auth service', 'open', 'task', '2024-12-21', 1),
  ('Refactor API endpoints', 'open', 'task', '2024-12-21', 2),
  ('Update API documentation', 'open', 'task', '2024-12-21', 2),
  ('Research graph algorithms', 'completed', 'task', '2024-12-20', 3);

-- Dependencies (Deploy depends on Tests depends on Implementation)
INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type) VALUES
  (2, 1, 'blocks'),  -- Tests depend on Implementation
  (3, 2, 'blocks'),  -- Deploy depends on Tests
  (5, 4, 'blocks');  -- API docs depend on Refactor

-- Activity
INSERT INTO activity (type, source, data, timestamp) VALUES
  ('git_commit', 'dev-vm', '{"hash":"abc123","message":"Implement OAuth flow"}', datetime('now', '-1 hour')),
  ('file_save', 'vscode', '{"file":"auth-service.ts"}', datetime('now', '-30 minutes')),
  ('test_run', 'dev-vm', '{"passed":10,"failed":0}', datetime('now', '-15 minutes'));
```