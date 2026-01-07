import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as TaskTemplateManager from '../../database/TaskTemplateManager.js'
import * as TaskManager from '../../database/TaskManager.js'
import { TaskTemplate } from '@awesome-dev-journal/shared'

export function getTaskTemplateTools(): Tool[] {
  return [
    {
      name: 'create_task_template',
      description: 'Create a repeatable task template that can spawn instances',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the task template'
          },
          description: {
            type: 'string',
            description: 'Description of the task template'
          },
          topic: {
            type: 'string',
            description: 'Topic/category for the task template'
          },
          auto_spawn: {
            type: 'boolean',
            description: 'Whether to automatically spawn a new instance when one is completed'
          },
          default_collection_id: {
            type: 'number',
            description: 'Default collection ID where instances should be created'
          }
        },
        required: ['title', 'topic']
      }
    },
    {
      name: 'list_task_templates',
      description: 'List all task templates',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_task_template',
      description: 'Get details of a specific task template',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: {
            type: 'number',
            description: 'ID of the template to retrieve'
          }
        },
        required: ['template_id']
      }
    },
    {
      name: 'update_task_template',
      description: 'Update an existing task template',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: {
            type: 'number',
            description: 'ID of the template to update'
          },
          title: {
            type: 'string',
            description: 'New title for the template'
          },
          description: {
            type: 'string',
            description: 'New description for the template'
          },
          topic: {
            type: 'string',
            description: 'New topic for the template'
          },
          auto_spawn: {
            type: 'boolean',
            description: 'Whether to automatically spawn next instance'
          },
          default_collection_id: {
            type: 'number',
            description: 'Default collection for spawned instances'
          }
        },
        required: ['template_id']
      }
    },
    {
      name: 'delete_task_template',
      description: 'Delete a task template',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: {
            type: 'number',
            description: 'ID of the template to delete'
          }
        },
        required: ['template_id']
      }
    },
    {
      name: 'spawn_task_instance',
      description: 'Create a new task instance from a template',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: {
            type: 'number',
            description: 'ID of the template to spawn from'
          },
          collection_id: {
            type: 'number',
            description: 'Optional: Collection ID to add the instance to (overrides template default)'
          }
        },
        required: ['template_id']
      }
    },
    {
      name: 'get_template_instances',
      description: 'Get all instances spawned from a template',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: {
            type: 'number',
            description: 'ID of the template'
          }
        },
        required: ['template_id']
      }
    },
    {
      name: 'get_template_stats',
      description: 'Get statistics for a template (total, completed, active, canceled instances)',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: {
            type: 'number',
            description: 'ID of the template'
          }
        },
        required: ['template_id']
      }
    },
    {
      name: 'complete_task_instance',
      description: 'Complete a task instance and optionally spawn the next one if auto-spawn is enabled',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task instance to complete'
          }
        },
        required: ['task_id']
      }
    }
  ]
}

export async function handleTaskTemplateTools(toolName: string, args: any) {
  switch (toolName) {
    case 'create_task_template': {
      const templateData: TaskTemplate = {
        id: 0,
        title: args.title,
        description: args.description || '',
        topic: args.topic,
        createDate: new Date(),
        metadata: {},
        auto_spawn: args.auto_spawn || false,
        default_collection_id: args.default_collection_id
      }

      const result = TaskTemplateManager.addTemplate(templateData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: result,
                message: `Task template created: "${args.title}"`
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'list_task_templates': {
      const templates = TaskTemplateManager.getAllTemplates()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                count: templates.length,
                templates
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'get_task_template': {
      const template = TaskTemplateManager.getTemplate(args.template_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'update_task_template': {
      const updateData: Partial<TaskTemplate> & { id: number } = {
        id: args.template_id
      }

      if (args.title !== undefined) updateData.title = args.title
      if (args.description !== undefined) updateData.description = args.description
      if (args.topic !== undefined) updateData.topic = args.topic
      if (args.auto_spawn !== undefined) updateData.auto_spawn = args.auto_spawn
      if (args.default_collection_id !== undefined) updateData.default_collection_id = args.default_collection_id

      TaskTemplateManager.updateTemplate(updateData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: args.template_id,
                message: 'Template updated'
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'delete_task_template': {
      TaskTemplateManager.deleteTemplate(args.template_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: args.template_id,
                message: 'Template deleted'
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'spawn_task_instance': {
      const taskId = TaskManager.spawnInstanceFromTemplate(args.template_id, args.collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: args.template_id,
                task_id: taskId,
                message: 'Task instance spawned'
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'get_template_instances': {
      const instances = TaskTemplateManager.getTemplateInstances(args.template_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: args.template_id,
                count: instances.length,
                instances
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'get_template_stats': {
      const stats = TaskTemplateManager.getTemplateStats(args.template_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: args.template_id,
                stats
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'complete_task_instance': {
      const result = TaskManager.completeTaskInstance(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                completed_task_id: result.completed,
                next_task_id: result.next,
                message: result.next
                  ? 'Task completed and next instance spawned'
                  : 'Task completed'
              },
              null,
              2
            )
          }
        ]
      }
    }

    default:
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'UNKNOWN_TOOL',
              message: `Unknown task template tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
