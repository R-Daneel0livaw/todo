# Journal MCP Server - Setup Guide

## Overview

The Journal MCP Server enables Claude Desktop to interact with your bullet journal through 24 MCP tools. You can ask Claude to create tasks, manage collections, analyze dependencies, and more - all through natural conversation.

## Quick Start

### 1. Build the MCP Server

```bash
cd packages/journal-mcp
npm run build
```

### 2. Configure Claude Desktop

Add this to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bullet-journal": {
      "command": "node",
      "args": ["C:\\code\\todo\\packages\\journal-mcp\\dist\\index.js", "mcp"],
      "env": {}
    }
  }
}
```

**Important:** Update the path to match your actual installation directory!

### 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### 4. Test It!

Ask Claude: "What tools do you have available for managing my journal?"

Claude should list all 24 journal management tools.

## Available Tools

### Task Management (7 tools)

- `create_task` - Create a new task
- `complete_task` - Mark a task as complete
- `cancel_task` - Cancel a task
- `get_task` - Get details of a specific task
- `update_task` - Update task properties
- `delete_task` - Delete a task permanently
- `list_tasks` - List all tasks (optionally filter by collection)

### Collection Management (6 tools)

- `create_collection` - Create a project, monthly plan, or custom collection
- `list_collections` - List all collections
- `get_collection` - Get collection details
- `add_to_collection` - Add task/event to a collection
- `remove_from_collection` - Remove item from collection
- `get_collection_items` - Get all items in a collection

### Dependency Management (6 tools)

- `add_task_dependency` - Create a dependency between tasks
- `remove_task_dependency` - Remove a dependency
- `get_task_dependencies` - Get all dependencies for a task
- `get_unblocked_tasks` - Get tasks that can be started now
- `get_blocked_tasks` - Get tasks waiting on dependencies
- `get_critical_path` - Get the longest dependency chain

### Daily Log (3 tools)

- `get_todays_log` - Get or create today's daily log
- `get_daily_log` - Get or create log for a specific date
- `migrate_task` - Move a task between collections

### Search (2 tools)

- `search_tasks` - Search tasks by keyword
- `search_events` - Search events by keyword

## Example Conversations

### Morning Planning
```
You: Good morning! What's on my plate today?

Claude: [Uses get_todays_log to check today's tasks]
```

### Creating Tasks with Dependencies
```
You: Create a task to deploy the auth service, but it should depend on running tests first

Claude: [Uses create_task twice, then add_task_dependency]
```

### Analyzing Workload
```
You: What's blocking me from deploying?

Claude: [Uses get_blocked_tasks and get_critical_path]
```

### Project Management
```
You: Create a project called "OAuth Implementation" and add all auth-related tasks to it

Claude: [Uses create_collection, search_tasks, then add_to_collection for each task]
```

## Running Modes

The Journal MCP Server supports two modes:

### HTTP Mode (Default)
For the Electron app:
```bash
npm run dev  # or npm start
```
Runs on http://localhost:3333

### MCP Mode
For Claude Desktop:
```bash
npm run dev:mcp  # or npm start:mcp
```
Runs on stdio (standard input/output)

## Troubleshooting

### Claude doesn't see the tools
1. Check that the path in `claude_desktop_config.json` is correct
2. Make sure you ran `npm run build` in packages/journal-mcp
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### Tools return errors
1. Make sure the database file exists (run HTTP mode once to initialize)
2. Check that the database path is correct
3. Look at the MCP server output for error messages

### Both modes at once
You can run both HTTP and MCP modes simultaneously:
- Terminal 1: `npm run dev` (HTTP for Electron app)
- Terminal 2: Configure Claude Desktop with MCP mode

Both will share the same SQLite database.

## Database Location

The database is stored at: `C:\code\todo\todo.db`

Both the HTTP server (for Electron) and MCP server (for Claude Desktop) use the same database file, so changes in one interface are immediately visible in the other.

## Next Steps

- Try creating tasks through Claude Desktop
- Use the Electron app UI to visualize the tasks
- Experiment with dependency management
- Set up daily logs for bullet journaling

## Additional Resources

- Design Document: `documentation/design-document.md`
- MCP SDK Documentation: https://github.com/modelcontextprotocol/sdk
- Claude Desktop: https://claude.ai/download
