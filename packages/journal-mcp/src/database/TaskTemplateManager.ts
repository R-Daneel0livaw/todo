import { TaskTemplate } from '@awesome-dev-journal/shared'
import db from './sqlite.js'

export function getAllTemplates(): TaskTemplate[] {
  const stmt = db.prepare('SELECT * FROM task_templates ORDER BY title')
  return stmt.all() as TaskTemplate[]
}

export function getTemplate(templateId: number): TaskTemplate {
  const stmt = db.prepare('SELECT * FROM task_templates WHERE id = ?')
  return stmt.get(templateId) as TaskTemplate
}

export function addTemplate(templateData: TaskTemplate): number {
  const stmt = db.prepare(`
    INSERT INTO task_templates (title, description, topic, createDate, metadata, auto_spawn, default_collection_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    templateData.title,
    templateData.description,
    templateData.topic,
    templateData.createDate?.toISOString(),
    templateData.metadata ? JSON.stringify(templateData.metadata) : null,
    templateData.auto_spawn ? 1 : 0,
    templateData.default_collection_id
  )
  return result.lastInsertRowid as number
}

export function updateTemplate(templateData: Partial<TaskTemplate> & { id: number }) {
  const fields: string[] = []
  const values: any[] = []

  if (templateData.title !== undefined) {
    fields.push('title = ?')
    values.push(templateData.title)
  }
  if (templateData.description !== undefined) {
    fields.push('description = ?')
    values.push(templateData.description)
  }
  if (templateData.topic !== undefined) {
    fields.push('topic = ?')
    values.push(templateData.topic)
  }
  if (templateData.metadata !== undefined) {
    fields.push('metadata = ?')
    values.push(JSON.stringify(templateData.metadata))
  }
  if (templateData.auto_spawn !== undefined) {
    fields.push('auto_spawn = ?')
    values.push(templateData.auto_spawn ? 1 : 0)
  }
  if (templateData.default_collection_id !== undefined) {
    fields.push('default_collection_id = ?')
    values.push(templateData.default_collection_id)
  }

  if (fields.length === 0) return

  values.push(templateData.id)
  const stmt = db.prepare(`UPDATE task_templates SET ${fields.join(', ')} WHERE id = ?`)
  stmt.run(...values)
}

export function deleteTemplate(templateId: number) {
  const stmt = db.prepare('DELETE FROM task_templates WHERE id = ?')
  stmt.run(templateId)
}

/**
 * Get all instances spawned from a template
 */
export function getTemplateInstances(templateId: number) {
  const stmt = db.prepare(`
    SELECT * FROM tasks
    WHERE template_id = ?
    ORDER BY instance_number DESC
  `)
  return stmt.all(templateId)
}

/**
 * Get template statistics
 */
export function getTemplateStats(templateId: number) {
  const stmt = db.prepare(`
    SELECT
      COUNT(t.id) as total_instances,
      COUNT(CASE WHEN t.status = 'FINISHED' THEN 1 END) as completed,
      COUNT(CASE WHEN t.status IN ('CREATED', 'IN_PROGRESS') THEN 1 END) as active,
      COUNT(CASE WHEN t.status = 'CANCELED' THEN 1 END) as canceled
    FROM tasks t
    WHERE t.template_id = ?
  `)
  return stmt.get(templateId)
}
