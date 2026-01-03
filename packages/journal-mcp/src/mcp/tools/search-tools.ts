import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as TaskManager from '../../database/TaskManager.js'
import * as EventManager from '../../database/EventManager.js'

export function getSearchTools(): Tool[] {
  return [
    {
      name: 'search_tasks',
      description: 'Search tasks by title, description, or topic',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (searches in title, description, and topic)'
          },
          status: {
            type: 'string',
            enum: ['CREATED', 'MIGRATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED', 'DELETED'],
            description: 'Optional: Filter by task status'
          }
        },
        required: ['query']
      }
    },
    {
      name: 'search_events',
      description: 'Search events by title, description, or location',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (searches in title, description, and location)'
          },
          status: {
            type: 'string',
            enum: ['CREATED', 'MIGRATED', 'IN_PROGRESS', 'FINISHED', 'CANCELED', 'DELETED'],
            description: 'Optional: Filter by event status'
          }
        },
        required: ['query']
      }
    }
  ]
}

export async function handleSearchTools(toolName: string, args: any) {
  switch (toolName) {
    case 'search_tasks': {
      const allTasks = TaskManager.getAllTasks()
      const query = args.query.toLowerCase()

      let results = allTasks.filter((task) => {
        const titleMatch = task.title.toLowerCase().includes(query)
        const descMatch = task.description?.toLowerCase().includes(query)
        const topicMatch = task.topic?.toLowerCase().includes(query)

        return titleMatch || descMatch || topicMatch
      })

      // Filter by status if provided
      if (args.status) {
        results = results.filter((task) => task.status === args.status)
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              query: args.query,
              count: results.length,
              tasks: results
            }, null, 2)
          }
        ]
      }
    }

    case 'search_events': {
      const allEvents = EventManager.getAllEvents()
      const query = args.query.toLowerCase()

      let results = allEvents.filter((event) => {
        const titleMatch = event.title.toLowerCase().includes(query)
        const descMatch = event.description?.toLowerCase().includes(query)
        const locationMatch = event.location?.toLowerCase().includes(query)

        return titleMatch || descMatch || locationMatch
      })

      // Filter by status if provided
      if (args.status) {
        results = results.filter((event) => event.status === args.status)
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              query: args.query,
              count: results.length,
              events: results
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
              message: `Unknown search tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
