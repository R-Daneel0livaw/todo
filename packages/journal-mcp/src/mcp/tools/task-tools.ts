import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as TaskManager from '../../database/TaskManager.js'
import { Task } from '@awesome-dev-journal/shared'

export function getTaskTools(): Tool[] {
  return [
    {
      name: 'create_task',
      description: 'Create a new task in the journal',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the task'
          },
          description: {
            type: 'string',
            description: 'Detailed description of the task'
          },
          topic: {
            type: 'string',
            description: 'Topic/category for the task (e.g., "work", "personal", "security")'
          }
        },
        required: ['title']
      }
    },
    {
      name: 'complete_task',
      description: 'Mark a task as complete',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task to complete'
          }
        },
        required: ['task_id']
      }
    },
    {
      name: 'cancel_task',
      description: 'Cancel a task',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task to cancel'
          }
        },
        required: ['task_id']
      }
    },
    {
      name: 'get_task',
      description: 'Get details of a specific task',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task to retrieve'
          }
        },
        required: ['task_id']
      }
    },
    {
      name: 'update_task',
      description: 'Update an existing task',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task to update'
          },
          title: {
            type: 'string',
            description: 'New title for the task'
          },
          description: {
            type: 'string',
            description: 'New description for the task'
          },
          topic: {
            type: 'string',
            description: 'New topic/category for the task'
          }
        },
        required: ['task_id']
      }
    },
    {
      name: 'delete_task',
      description: 'Delete a task permanently',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task to delete'
          }
        },
        required: ['task_id']
      }
    },
    {
      name: 'list_tasks',
      description: 'List all tasks, optionally filtered by collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'Optional: Filter tasks by collection ID'
          }
        }
      }
    }
  ]
}

export async function handleTaskTools(toolName: string, args: any) {
  switch (toolName) {
    case 'create_task': {
      const taskData: Task = {
        id: 0, // Will be set by database
        title: args.title,
        description: args.description || '',
        topic: args.topic || '',
        status: 'CREATED',
        createDate: new Date(),
        startDate: undefined,
        endDate: undefined,
        canceledDate: undefined,
        migrated_from_id: undefined,
        migrated_to_id: undefined,
        metadata: {}
      }

      const result = TaskManager.addTask(taskData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: result,
              message: `Task created: "${args.title}"`
            }, null, 2)
          }
        ]
      }
    }

    case 'complete_task': {
      TaskManager.completeTask(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              message: 'Task marked as complete'
            }, null, 2)
          }
        ]
      }
    }

    case 'cancel_task': {
      TaskManager.cancelTask(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              message: 'Task cancelled'
            }, null, 2)
          }
        ]
      }
    }

    case 'get_task': {
      const task = TaskManager.getTask(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task
            }, null, 2)
          }
        ]
      }
    }

    case 'update_task': {
      const existingTask = TaskManager.getTask(args.task_id)
      const updatedTask = {
        id: args.task_id,
        title: args.title !== undefined ? args.title : existingTask.title,
        description: args.description !== undefined ? args.description : existingTask.description,
        topic: args.topic !== undefined ? args.topic : existingTask.topic
      }

      TaskManager.updateTask(updatedTask)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              message: 'Task updated'
            }, null, 2)
          }
        ]
      }
    }

    case 'delete_task': {
      TaskManager.deleteTask(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              message: 'Task deleted'
            }, null, 2)
          }
        ]
      }
    }

    case 'list_tasks': {
      let tasks
      if (args.collection_id) {
        tasks = TaskManager.getTasksByCollectionId(args.collection_id)
      } else {
        tasks = TaskManager.getAllTasks()
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: tasks.length,
              tasks
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
              message: `Unknown task tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
