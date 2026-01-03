import { startServer } from './http/server.js'
import { startMCPServer } from './mcp/server.js'

// Determine mode from environment variable or command-line argument
// Default to HTTP mode for backwards compatibility
const mode = process.env.MODE || process.argv[2] || 'http'

console.log('Starting Journal MCP Server...')
console.log(`Mode: ${mode === 'mcp' ? 'MCP (stdio)' : 'HTTP API Server'}`)
console.log('Database: todo.db')
console.log('')

if (mode === 'mcp') {
  // Start MCP server (stdio) for Claude Desktop
  startMCPServer().catch((error) => {
    console.error('Failed to start MCP server:', error)
    process.exit(1)
  })
} else {
  // Start HTTP server for Electron app and external clients
  startServer()
}
