import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'

// Import tool handlers (we'll create these next)
import { handleTaskTools, getTaskTools } from './tools/task-tools.js'
import { handleCollectionTools, getCollectionTools } from './tools/collection-tools.js'
import { handleDependencyTools, getDependencyTools } from './tools/dependency-tools.js'
import { handleDailyLogTools, getDailyLogTools } from './tools/daily-log-tools.js'
import { handleSearchTools, getSearchTools } from './tools/search-tools.js'

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
    ...getSearchTools()
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
      if (name.startsWith('task_') || name.includes('_task')) {
        return await handleTaskTools(name, args || {})
      } else if (name.startsWith('collection_') || name.includes('_collection')) {
        return await handleCollectionTools(name, args || {})
      } else if (name.includes('dependency') || name.includes('critical_path') || name.includes('unblocked') || name.includes('blocked')) {
        return await handleDependencyTools(name, args || {})
      } else if (name.includes('daily_log') || name.includes('todays_log') || name.includes('migrate')) {
        return await handleDailyLogTools(name, args || {})
      } else if (name.startsWith('search_')) {
        return await handleSearchTools(name, args || {})
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
