import { Task } from '@awesome-dev-journal/shared'
import db from './sqlite'

export interface TaskDependency {
  id: number
  task_id: number
  depends_on_task_id: number
  dependency_type: 'blocks' | 'related' | 'suggested'
  created_at: Date
  created_by?: 'user' | 'ai_suggested'
}

export function addTaskDependency(
  taskId: number,
  dependsOnTaskId: number,
  dependencyType: 'blocks' | 'related' | 'suggested' = 'blocks',
  createdBy: 'user' | 'ai_suggested' = 'user'
): number {
  // First check for cycles
  if (wouldCreateCycle(taskId, dependsOnTaskId)) {
    throw new Error('Adding this dependency would create a circular dependency')
  }

  const stmt = db.prepare(`
    INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, created_by)
    VALUES (?, ?, ?, ?)
  `)
  const result = stmt.run(taskId, dependsOnTaskId, dependencyType, createdBy)
  return result.lastInsertRowid as number
}

export function removeTaskDependency(dependencyId: number) {
  const stmt = db.prepare('DELETE FROM task_dependencies WHERE id = ?')
  stmt.run(dependencyId)
}

export function getTaskDependencies(taskId: number): Task[] {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN task_dependencies td ON t.id = td.depends_on_task_id
    WHERE td.task_id = ?
  `)
  return stmt.all(taskId) as Task[]
}

export function getDependentTasks(taskId: number): Task[] {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tasks t
    JOIN task_dependencies td ON t.id = td.task_id
    WHERE td.depends_on_task_id = ?
  `)
  return stmt.all(taskId) as Task[]
}

export function getUnblockedTasks(): Task[] {
  const stmt = db.prepare(`
    SELECT t.*
    FROM tasks t
    WHERE t.status IN ('CREATED', 'IN_PROGRESS')
      AND t.id NOT IN (
        SELECT td.task_id
        FROM task_dependencies td
        JOIN tasks dep ON td.depends_on_task_id = dep.id
        WHERE td.dependency_type = 'blocks'
          AND dep.status NOT IN ('FINISHED', 'CANCELED')
      )
  `)
  return stmt.all() as Task[]
}

export function getBlockedTasks(): Task[] {
  const stmt = db.prepare(`
    SELECT DISTINCT t.*
    FROM tasks t
    JOIN task_dependencies td ON t.id = td.task_id
    JOIN tasks dep ON td.depends_on_task_id = dep.id
    WHERE t.status IN ('CREATED', 'IN_PROGRESS')
      AND dep.status NOT IN ('FINISHED', 'CANCELED')
      AND td.dependency_type = 'blocks'
  `)
  return stmt.all() as Task[]
}

export function wouldCreateCycle(taskId: number, dependsOnTaskId: number): boolean {
  // Check if adding edge (dependsOnTaskId → taskId) would create a cycle
  // This is true if there's already a path from taskId to dependsOnTaskId
  const stmt = db.prepare(`
    WITH RECURSIVE reachable(node) AS (
      -- Start from taskId
      SELECT ? as node

      UNION

      -- Follow dependency edges forward
      SELECT td.depends_on_task_id
      FROM reachable r
      JOIN task_dependencies td ON r.node = td.task_id
    )
    SELECT COUNT(*) > 0 as has_cycle
    FROM reachable
    WHERE node = ?
  `)

  const result = stmt.get(taskId, dependsOnTaskId) as { has_cycle: number }
  return result.has_cycle === 1
}

export function getCriticalPath(): Task[] {
  // Find the longest path through the dependency graph
  // This is a simplified version - could be enhanced with proper longest path algorithm
  const stmt = db.prepare(`
    WITH RECURSIVE task_depth(task_id, depth) AS (
      -- Start with tasks that have no dependencies
      SELECT t.id, 0
      FROM tasks t
      WHERE t.id NOT IN (
        SELECT task_id FROM task_dependencies WHERE dependency_type = 'blocks'
      )

      UNION

      -- Recursively find dependent tasks
      SELECT td.task_id, td_prev.depth + 1
      FROM task_depth td_prev
      JOIN task_dependencies td ON td_prev.task_id = td.depends_on_task_id
      WHERE td.dependency_type = 'blocks'
    )
    SELECT t.*, MAX(task_depth.depth) as depth
    FROM tasks t
    JOIN task_depth ON t.id = task_depth.task_id
    GROUP BY t.id
    ORDER BY depth DESC
    LIMIT 10
  `)
  return stmt.all() as Task[]
}

export function getAllDependencies(taskId: number): Task[] {
  // Get all dependencies (direct and transitive)
  const stmt = db.prepare(`
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
    SELECT DISTINCT t.*, ad.depth
    FROM all_deps ad
    JOIN tasks t ON ad.depends_on_task_id = t.id
    ORDER BY ad.depth, t.id
  `)
  return stmt.all(taskId) as Task[]
}
