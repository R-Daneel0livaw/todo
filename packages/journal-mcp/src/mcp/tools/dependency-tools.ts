import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as TaskDependencyManager from '../../database/TaskDependencyManager.js'

export function getDependencyTools(): Tool[] {
  return [
    {
      name: 'add_task_dependency',
      description: 'Add a dependency between two tasks (task A must complete before task B can start)',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the task that depends on another'
          },
          depends_on_task_id: {
            type: 'number',
            description: 'ID of the task that must complete first'
          },
          dependency_type: {
            type: 'string',
            enum: ['blocks', 'related', 'suggested'],
            description: 'Type of dependency (default: blocks)'
          }
        },
        required: ['task_id', 'depends_on_task_id']
      }
    },
    {
      name: 'remove_task_dependency',
      description: 'Remove a dependency between two tasks',
      inputSchema: {
        type: 'object',
        properties: {
          task_id: {
            type: 'number',
            description: 'ID of the dependent task'
          },
          depends_on_task_id: {
            type: 'number',
            description: 'ID of the blocking task'
          }
        },
        required: ['task_id', 'depends_on_task_id']
      }
    },
    {
      name: 'get_task_dependencies',
      description: 'Get all dependencies for a specific task',
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
      name: 'get_unblocked_tasks',
      description: 'Get all tasks that can be started now (no incomplete dependencies)',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'Optional: Filter by collection'
          }
        }
      }
    },
    {
      name: 'get_blocked_tasks',
      description: 'Get all tasks that are blocked by incomplete dependencies',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'Optional: Filter by collection'
          }
        }
      }
    },
    {
      name: 'get_critical_path',
      description: 'Get the critical path (longest chain of dependencies)',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'Optional: Filter by collection'
          }
        }
      }
    }
  ]
}

export async function handleDependencyTools(toolName: string, args: any) {
  switch (toolName) {
    case 'add_task_dependency': {
      const result = TaskDependencyManager.addTaskDependency(
        args.task_id,
        args.depends_on_task_id,
        args.dependency_type || 'blocks',
        'user'
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              dependency_id: result,
              message: `Dependency added: Task ${args.task_id} depends on Task ${args.depends_on_task_id}`
            }, null, 2)
          }
        ]
      }
    }

    case 'remove_task_dependency': {
      TaskDependencyManager.removeTaskDependency(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Dependency removed'
            }, null, 2)
          }
        ]
      }
    }

    case 'get_task_dependencies': {
      const dependencies = TaskDependencyManager.getTaskDependencies(args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: args.task_id,
              count: dependencies.length,
              dependencies
            }, null, 2)
          }
        ]
      }
    }

    case 'get_unblocked_tasks': {
      const tasks = TaskDependencyManager.getUnblockedTasks()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: tasks.length,
              tasks,
              message: 'These tasks can be started now (no incomplete dependencies)'
            }, null, 2)
          }
        ]
      }
    }

    case 'get_blocked_tasks': {
      const tasks = TaskDependencyManager.getBlockedTasks()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: tasks.length,
              tasks,
              message: 'These tasks are blocked by incomplete dependencies'
            }, null, 2)
          }
        ]
      }
    }

    case 'get_critical_path': {
      const criticalPath = TaskDependencyManager.getCriticalPath()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              critical_path: criticalPath,
              message: 'Longest chain of task dependencies'
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
              message: `Unknown dependency tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
