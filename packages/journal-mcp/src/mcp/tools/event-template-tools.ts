import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as EventTemplateManager from '../../database/EventTemplateManager.js'
import * as EventManager from '../../database/EventManager.js'
import { EventTemplate } from '@awesome-dev-journal/shared'

export function getEventTemplateTools(): Tool[] {
  return [
    {
      name: 'create_event_template',
      description: 'Create a repeatable event template that can spawn instances',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the event template'
          },
          description: {
            type: 'string',
            description: 'Description of the event template'
          },
          location: {
            type: 'string',
            description: 'Location for the event'
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
        required: ['title']
      }
    },
    {
      name: 'list_event_templates',
      description: 'List all event templates',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_event_template',
      description: 'Get details of a specific event template',
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
      name: 'update_event_template',
      description: 'Update an existing event template',
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
          location: {
            type: 'string',
            description: 'New location for the template'
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
      name: 'delete_event_template',
      description: 'Delete an event template',
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
      name: 'spawn_event_instance',
      description: 'Create a new event instance from a template',
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
      name: 'get_event_template_instances',
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
      name: 'get_event_template_stats',
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
      name: 'complete_event_instance',
      description: 'Complete an event instance and optionally spawn the next one if auto-spawn is enabled',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event instance to complete'
          }
        },
        required: ['event_id']
      }
    }
  ]
}

export async function handleEventTemplateTools(toolName: string, args: any) {
  switch (toolName) {
    case 'create_event_template': {
      const templateData: EventTemplate = {
        id: 0,
        title: args.title,
        description: args.description || '',
        location: args.location,
        createDate: new Date(),
        metadata: {},
        auto_spawn: args.auto_spawn || false,
        default_collection_id: args.default_collection_id
      }

      const result = EventTemplateManager.addTemplate(templateData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: result,
                message: `Event template created: "${args.title}"`
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'list_event_templates': {
      const templates = EventTemplateManager.getAllTemplates()

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

    case 'get_event_template': {
      const template = EventTemplateManager.getTemplate(args.template_id)

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

    case 'update_event_template': {
      const updateData: Partial<EventTemplate> & { id: number } = {
        id: args.template_id
      }

      if (args.title !== undefined) updateData.title = args.title
      if (args.description !== undefined) updateData.description = args.description
      if (args.location !== undefined) updateData.location = args.location
      if (args.auto_spawn !== undefined) updateData.auto_spawn = args.auto_spawn
      if (args.default_collection_id !== undefined) updateData.default_collection_id = args.default_collection_id

      EventTemplateManager.updateTemplate(updateData)

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

    case 'delete_event_template': {
      EventTemplateManager.deleteTemplate(args.template_id)

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

    case 'spawn_event_instance': {
      const eventId = EventManager.spawnInstanceFromTemplate(args.template_id, args.collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                template_id: args.template_id,
                event_id: eventId,
                message: 'Event instance spawned'
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'get_event_template_instances': {
      const instances = EventTemplateManager.getTemplateInstances(args.template_id)

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

    case 'get_event_template_stats': {
      const stats = EventTemplateManager.getTemplateStats(args.template_id)

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

    case 'complete_event_instance': {
      const result = EventManager.completeEventInstance(args.event_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                completed_event_id: result.completed,
                next_event_id: result.next,
                message: result.next ? 'Event completed and next instance spawned' : 'Event completed'
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
              message: `Unknown event template tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
