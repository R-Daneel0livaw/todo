import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as ActivityManager from '../../database/ActivityManager.js'
import { ActivityType } from '../../database/ActivityManager.js'

export function getActivityTools(): Tool[] {
  return [
    {
      name: 'add_activity',
      description: 'Record a new activity (git commit, file change, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['git_commit', 'file_change', 'file_open', 'file_save', 'test_run', 'build', 'deployment', 'vm_task_complete', 'session_start', 'session_end'],
            description: 'Type of activity'
          },
          source: {
            type: 'string',
            description: 'Source of the activity (e.g., "vscode", "cli", "webhook")'
          },
          data: {
            type: 'object',
            description: 'Activity-specific data (e.g., commit message, file path, etc.)'
          },
          related_task_id: {
            type: 'number',
            description: 'Optional: ID of related task'
          },
          related_event_id: {
            type: 'number',
            description: 'Optional: ID of related event'
          }
        },
        required: ['type', 'source', 'data']
      }
    },
    {
      name: 'get_activity_summary',
      description: 'Get activity summary for a time period',
      inputSchema: {
        type: 'object',
        properties: {
          minutes: {
            type: 'number',
            description: 'Get activity from last N minutes'
          },
          hours: {
            type: 'number',
            description: 'Get activity from last N hours'
          },
          days: {
            type: 'number',
            description: 'Get activity from last N days (default: 1)'
          }
        }
      }
    },
    {
      name: 'get_task_activity',
      description: 'Get all activity related to a specific task',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task'
          }
        },
        required: ['task_id']
      }
    },
    {
      name: 'get_event_activity',
      description: 'Get all activity related to a specific event',
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
      name: 'suggest_task_completion',
      description: 'Get AI-powered suggestions for tasks that might be complete based on recent activity',
      inputSchema: {
        type: 'object',
        properties: {
          minutes: {
            type: 'number',
            description: 'Look at activity from last N minutes (default: 60)'
          }
        }
      }
    }
  ]
}

export async function handleActivityTools(toolName: string, args: any) {
  switch (toolName) {
    case 'add_activity': {
      const result = ActivityManager.addActivity(
        args.type as ActivityType,
        args.source,
        args.data,
        args.related_task_id,
        args.related_event_id
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              activity_id: result,
              message: `Activity recorded: ${args.type}`
            }, null, 2)
          }
        ]
      }
    }

    case 'get_activity_summary': {
      const options: any = {}
      if (args.minutes) options.minutes = args.minutes
      if (args.hours) options.hours = args.hours
      if (args.days) options.days = args.days

      const activities = ActivityManager.getActivitySummary(options)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: activities.length,
              activities
            }, null, 2)
          }
        ]
      }
    }

    case 'get_task_activity': {
      const activities = ActivityManager.getActivityByTask(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              count: activities.length,
              activities
            }, null, 2)
          }
        ]
      }
    }

    case 'get_event_activity': {
      const activities = ActivityManager.getActivityByEvent(args.event_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              event_id: args.event_id,
              count: activities.length,
              activities
            }, null, 2)
          }
        ]
      }
    }

    case 'suggest_task_completion': {
      const minutes = args.minutes || 60
      const suggestions = ActivityManager.suggestTaskCompletion(minutes)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: suggestions.length,
              suggestions,
              message: `Tasks that might be complete based on activity in last ${minutes} minutes`
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
              message: `Unknown activity tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
