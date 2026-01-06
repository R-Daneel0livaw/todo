import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as EventManager from '../../database/EventManager.js'
import { Event } from '@awesome-dev-journal/shared'

export function getEventTools(): Tool[] {
  return [
    {
      name: 'create_event',
      description: 'Create a new event',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the event'
          },
          description: {
            type: 'string',
            description: 'Description of the event'
          },
          location: {
            type: 'string',
            description: 'Location of the event'
          },
          scheduledDate: {
            type: 'string',
            description: 'Scheduled date/time (ISO 8601 format)'
          }
        },
        required: ['title']
      }
    },
    {
      name: 'get_event',
      description: 'Get details of a specific event',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event'
          }
        },
        required: ['event_id']
      }
    },
    {
      name: 'list_events',
      description: 'List all events',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'update_event',
      description: 'Update an existing event',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event to update'
          },
          title: {
            type: 'string',
            description: 'New title'
          },
          description: {
            type: 'string',
            description: 'New description'
          },
          location: {
            type: 'string',
            description: 'New location'
          },
          scheduledDate: {
            type: 'string',
            description: 'New scheduled date (ISO 8601 format)'
          }
        },
        required: ['event_id']
      }
    },
    {
      name: 'delete_event',
      description: 'Delete an event permanently',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event to delete'
          }
        },
        required: ['event_id']
      }
    },
    {
      name: 'complete_event',
      description: 'Mark an event as complete',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event to complete'
          }
        },
        required: ['event_id']
      }
    },
    {
      name: 'cancel_event',
      description: 'Cancel an event',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event to cancel'
          }
        },
        required: ['event_id']
      }
    },
    {
      name: 'migrate_event_to_collection',
      description: 'Migrate an event from one collection to another, tracking the migration history',
      inputSchema: {
        type: 'object',
        properties: {
          event_id: {
            type: 'number',
            description: 'ID of the event to migrate'
          },
          to_collection_id: {
            type: 'number',
            description: 'ID of the destination collection'
          },
          migrated_by: {
            type: 'string',
            description: 'Who is performing the migration (e.g., "user", "system")'
          },
          reason: {
            type: 'string',
            description: 'Reason for the migration'
          }
        },
        required: ['event_id', 'to_collection_id']
      }
    }
  ]
}

export async function handleEventTools(toolName: string, args: any) {
  switch (toolName) {
    case 'create_event': {
      const eventData: Event = {
        id: 0, // Will be set by database
        title: args.title,
        description: args.description || '',
        location: args.location || '',
        status: 'CREATED',
        createDate: new Date(),
        startDate: undefined,
        endDate: undefined,
        scheduledDate: args.scheduledDate ? new Date(args.scheduledDate) : undefined,
        canceledDate: undefined,
        metadata: {}
      }

      const result = EventManager.addEvent(eventData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: result,
              message: `Event created: "${args.title}"`
            }, null, 2)
          }
        ]
      }
    }

    case 'get_event': {
      const event = EventManager.getEvent(args.event_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event
            }, null, 2)
          }
        ]
      }
    }

    case 'list_events': {
      const events = EventManager.getAllEvents()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: events.length,
              events
            }, null, 2)
          }
        ]
      }
    }

    case 'update_event': {
      const updateData: any = { id: args.event_id }
      if (args.title !== undefined) updateData.title = args.title
      if (args.description !== undefined) updateData.description = args.description
      if (args.location !== undefined) updateData.location = args.location
      if (args.scheduledDate !== undefined) updateData.scheduledDate = new Date(args.scheduledDate)

      EventManager.updateEvent(updateData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: args.event_id,
              message: 'Event updated'
            }, null, 2)
          }
        ]
      }
    }

    case 'delete_event': {
      EventManager.deleteEvent(args.event_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: args.event_id,
              message: 'Event deleted'
            }, null, 2)
          }
        ]
      }
    }

    case 'complete_event': {
      EventManager.completeEvent(args.event_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: args.event_id,
              message: 'Event marked as complete'
            }, null, 2)
          }
        ]
      }
    }

    case 'cancel_event': {
      EventManager.cancelEvent(args.event_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: args.event_id,
              message: 'Event cancelled'
            }, null, 2)
          }
        ]
      }
    }

    case 'migrate_event_to_collection': {
      EventManager.migrateEventToCollection(
        args.event_id,
        args.to_collection_id,
        args.migrated_by,
        args.reason
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: args.event_id,
              to_collection_id: args.to_collection_id,
              message: 'Event migrated successfully'
            }, null, 2)
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
              message: `Unknown event tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
