import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'

// Import tool handlers
import { handleTaskTools, getTaskTools } from './tools/task-tools.js'
import { handleCollectionTools, getCollectionTools } from './tools/collection-tools.js'
import { handleDependencyTools, getDependencyTools } from './tools/dependency-tools.js'
import { handleDailyLogTools, getDailyLogTools } from './tools/daily-log-tools.js'
import { handleSearchTools, getSearchTools } from './tools/search-tools.js'
import { handleEventTools, getEventTools } from './tools/event-tools.js'
import { handleActivityTools, getActivityTools } from './tools/activity-tools.js'
import { handleVmTools, getVmTools } from './tools/vm-tools.js'

export async function startMCPServer() {
  const server = new Server(
    {
      name: 'bullet-journal',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  )

  // Collect all tools from different modules
  const allTools: Tool[] = [
    ...getTaskTools(),
    ...getCollectionTools(),
    ...getDependencyTools(),
    ...getDailyLogTools(),
    ...getSearchTools(),
    ...getEventTools(),
    ...getActivityTools(),
    ...getVmTools()
  ]

  // Handle list_tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools
    }
  })

  // Handle call_tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      // Route to appropriate tool handler based on tool name
      if (name.startsWith('task_') || name.includes('_task') && !name.includes('dependency')) {
        return await handleTaskTools(name, args || {})
      } else if (name.startsWith('event_') || name.includes('_event')) {
        return await handleEventTools(name, args || {})
      } else if (name.startsWith('collection_') || name.includes('_collection')) {
        return await handleCollectionTools(name, args || {})
      } else if (name.includes('dependency') || name.includes('critical_path') || name.includes('unblocked') || name.includes('blocked') || name.includes('dependent')) {
        return await handleDependencyTools(name, args || {})
      } else if (name.includes('daily_log') || name.includes('todays_log') || name.includes('migrate')) {
        return await handleDailyLogTools(name, args || {})
      } else if (name.startsWith('search_')) {
        return await handleSearchTools(name, args || {})
      } else if (name.includes('activity') || name.includes('suggest_task_completion')) {
        return await handleActivityTools(name, args || {})
      } else if (name.startsWith('vm_') || name.includes('_vm') || name.startsWith('register_vm') || name.startsWith('get_running_vms')) {
        return await handleVmTools(name, args || {})
      }

      // Unknown tool
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'UNKNOWN_TOOL',
              message: `Unknown tool: ${name}`
            })
          }
        ],
        isError: true
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'TOOL_EXECUTION_ERROR',
              message: error.message || 'An error occurred executing the tool',
              details: error.stack
            })
          }
        ],
        isError: true
      }
    }
  })

  // Connect server to stdio transport
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('Journal MCP Server running on stdio')
}
