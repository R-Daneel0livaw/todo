import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as CollectionManager from '../../database/CollectionManager.js'
import * as TaskManager from '../../database/TaskManager.js'
import { Collection } from '@awesome-dev-journal/shared'

export function getDailyLogTools(): Tool[] {
  return [
    {
      name: 'get_todays_log',
      description: 'Get or create today\'s daily log collection',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_daily_log',
      description: 'Get or create daily log for a specific date',
      inputSchema: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Date in YYYY-MM-DD format'
          }
        },
        required: ['date']
      }
    },
    {
      name: 'migrate_task',
      description: 'Migrate a task from one collection to another (e.g., move unfinished task to today)',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task to migrate'
          },
          to_collection_id: {
            type: 'number',
            description: 'ID of the destination collection'
          }
        },
        required: ['task_id', 'to_collection_id']
      }
    }
  ]
}

export async function handleDailyLogTools(toolName: string, args: any) {
  switch (toolName) {
    case 'get_todays_log': {
      const today = new Date().toISOString().split('T')[0]
      const collection = getOrCreateDailyLog(today)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collection,
              message: `Today's daily log (${today})`
            }, null, 2)
          }
        ]
      }
    }

    case 'get_daily_log': {
      const collection = getOrCreateDailyLog(args.date)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collection,
              message: `Daily log for ${args.date}`
            }, null, 2)
          }
        ]
      }
    }

    case 'migrate_task': {
      const task = TaskManager.getTask(args.task_id)
      TaskManager.migrateTask(args.task_id, args.to_collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              message: `Task "${task.title}" migrated to collection ${args.to_collection_id}`
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
              message: `Unknown daily log tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}

// Helper function to get or create a daily log collection
function getOrCreateDailyLog(date: string): Collection {
  // Try to find existing daily log for this date
  const allCollections = CollectionManager.getCollections()
  const existingLog = allCollections.find(
    (c: Collection) => c.type === 'DAILY' && c.subType === 'LOG' && c.title.includes(date)
  )

  if (existingLog) {
    return existingLog
  }

  // Create new daily log
  const newLog: Collection = {
    id: 0, // Will be set by database
    title: `Daily Log - ${date}`,
    description: `Task and event log for ${date}`,
    longDescription: undefined,
    type: 'DAILY',
    subType: 'LOG',
    createDate: new Date(),
    startDate: new Date(date),
    endDate: undefined,
    canceledDate: undefined,
    archived_at: undefined,
    metadata: { date }
  }

  const collectionId = CollectionManager.addCollection(newLog)
  return CollectionManager.getCollection(collectionId)
}
