import { EventTemplate } from '@awesome-dev-journal/shared'
import db from './sqlite.js'

export function getAllTemplates(): EventTemplate[] {
  const stmt = db.prepare('SELECT * FROM event_templates ORDER BY title')
  return stmt.all() as EventTemplate[]
}

export function getTemplate(templateId: number): EventTemplate {
  const stmt = db.prepare('SELECT * FROM event_templates WHERE id = ?')
  return stmt.get(templateId) as EventTemplate
}

export function addTemplate(templateData: EventTemplate): number {
  const stmt = db.prepare(`
    INSERT INTO event_templates (title, description, location, createDate, metadata, auto_spawn, default_collection_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    templateData.title,
    templateData.description,
    templateData.location,
    templateData.createDate?.toISOString(),
    templateData.metadata ? JSON.stringify(templateData.metadata) : null,
    templateData.auto_spawn ? 1 : 0,
    templateData.default_collection_id
  )
  return result.lastInsertRowid as number
}

export function updateTemplate(templateData: Partial<EventTemplate> & { id: number }) {
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
  if (templateData.location !== undefined) {
    fields.push('location = ?')
    values.push(templateData.location)
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
  const stmt = db.prepare(`UPDATE event_templates SET ${fields.join(', ')} WHERE id = ?`)
  stmt.run(...values)
}

export function deleteTemplate(templateId: number) {
  const stmt = db.prepare('DELETE FROM event_templates WHERE id = ?')
  stmt.run(templateId)
}

/**
 * Get all instances spawned from a template
 */
export function getTemplateInstances(templateId: number) {
  const stmt = db.prepare(`
    SELECT * FROM events
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
      COUNT(e.id) as total_instances,
      COUNT(CASE WHEN e.status = 'FINISHED' THEN 1 END) as completed,
      COUNT(CASE WHEN e.status IN ('CREATED', 'IN_PROGRESS') THEN 1 END) as active,
      COUNT(CASE WHEN e.status = 'CANCELED' THEN 1 END) as canceled
    FROM events e
    WHERE e.template_id = ?
  `)
  return stmt.get(templateId)
}
