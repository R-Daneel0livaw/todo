# AI-Powered Developer Journal with VM Control

## Project Overview

An intelligent bullet journaling system designed specifically for developers, integrating task management, virtual machine orchestration, and automated activity tracking through natural language interaction with Claude AI via the Model Context Protocol (MCP).

### Vision

A developer's personal assistant that:
- Tracks your work through automated activity monitoring
- Manages tasks using bullet journal methodology
- Orchestrates virtual machines for development and security work
- Understands task dependencies and suggests optimal work order
- Provides **three interaction modes**:
  - **Claude Desktop** - Standalone AI assistant via MCP
  - **Electron Visual UI** - Traditional task management interface
  - **In-App AI Chat** - Embedded conversational AI within Electron app
- Works seamlessly across development VMs and host machine

### Core Problem Being Solved

Developers juggle multiple contexts:
- Multiple projects and tasks
- Various VMs for different purposes (dev, security testing, builds)
- Git commits, file changes, and test runs across environments
- Task dependencies that aren't always obvious
- Context switching between projects
- Need for both conversational AI and visual UI interfaces
- Desire to ask AI questions without leaving task management app

Existing tools either:
- Require too much manual input (Jira, Linear)
- Don't integrate with development workflow (Notion, Todoist)
- Don't respect bullet journal philosophy (most project management tools)
- Can't orchestrate infrastructure (all task managers)
- Lack AI-powered natural language control

This project bridges the gap with:
- **AI-powered automation** through Claude Desktop integration (MCP)
- **Visual task management** through Electron desktop app (HTTP API)
- **Embedded AI chat** within Electron app (LLM API → MCP)
- **Automated activity tracking** from development environments
- **VM orchestration** for infrastructure management
- **Bullet journal methodology** adapted for software development

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                Host Machine                                      │
│                                                                                   │
│  ┌──────────────┐           ┌────────────────────────────────────────┐          │
│  │   Claude     │◄───MCP───►│    Journal MCP Server (Core)           │          │
│  │   Desktop    │           │    - Task Management                   │          │
│  │              │           │    - Activity Tracking                 │          │
│  └──────────────┘           │    - Dependency Graph                  │          │
│                             │    - SQLite Database                   │          │
│  ┌──────────────────┐       │    - MCP Tools (stdio)                 │          │
│  │   Electron App   │       │    - HTTP API Server (:3333)           │          │
│  │                  │       └──────────┬─────────────────────────────┘          │
│  │  ┌────────────┐  │                  │                                        │
│  │  │  Visual UI │──┼──HTTP───────────►│                                        │
│  │  │  - Tasks   │  │                  │ HTTP API                               │
│  │  │  - Events  │  │                  │                                        │
│  │  │  - Graph   │  │                  │                                        │
│  │  └────────────┘  │                  │                                        │
│  │                  │                  │                                        │
│  │  ┌────────────┐  │                  │                                        │
│  │  │  AI Chat   │──┼──┐               │                                        │
│  │  │  - Embed   │  │  │               │                                        │
│  │  │    Claude  │  │  │               │                                        │
│  │  │  - Context │  │  │    ┌──────────▼─────────────────────────────┐         │
│  │  │    Aware   │  │  │    │    VirtualBox MCP Server               │         │
│  │  └────────────┘  │  │    │    - VM Lifecycle (create/start/stop)  │         │
│  └──────────────────┘  │    │    - VM Role Registry                  │         │
│           │             │    │    - Task → VM Assignment              │         │
│           │ LLM API     │    │    - SSH to VBoxManage                 │         │
│           │ (Anthropic) │    │    - MCP Tools (stdio)                 │         │
│           ▼             │    └──────────┬─────────────────────────────┘         │
│  ┌──────────────────┐   │               │                                       │
│  │  Claude API      │   │               │ SSH/VBoxManage                        │
│  │  - Messages API  │   │               ▼                                       │
│  │  - Tool calling  │───┼──────►┌────────────────────────────────────────┐     │
│  │                  │   │       │        VirtualBox VMs                  │     │
│  │  Calls MCP tools │◄──┘       │  ┌──────────────────────────────────┐  │     │
│  │  on both:        │           │  │  Dev VM                          │  │     │
│  │  - Journal MCP   │◄──────┐   │  │  ┌───────────────────────────┐  │  │     │
│  │  - VirtualBox    │       │   │  │  │    Activity Reporter      │  │  │     │
│  │    MCP           │       │   │  │  │    - Git monitoring       │  │  │     │
│  └──────────────────┘       └───┼──┼──│    - File watching        │  │  │     │
│                                  │  │  │    - IDE integration      │  │  │     │
│                                  │  │  └─────────┬─────────────────┘  │  │     │
│  ┌──────────────┐                │  │            │ HTTP                 │  │     │
│  │   Claude     │◄──MCP──────────┘  │            │                      │  │     │
│  │   Desktop    │                   │  ┌─────────▼─────────────────┐   │  │     │
│  │              │                   │  │   Security VM              │   │  │     │
│  │  Calls MCP   │                   │  │   - VM Agent               │   │  │     │
│  │  tools on    │                   │  │   - nmap/nikto             │   │  │     │
│  │  both MCP    │                   │  └────────────────────────────┘   │  │     │
│  │  servers     │                   │                                   │  │     │
│  └──────────────┘                   │  ┌────────────────────────────┐   │  │     │
│                                      │  │   Build VM                 │   │  │     │
│                                      │  │   - VM Agent               │   │  │     │
│                                      │  │   - npm/docker             │   │  │     │
│                                      │  └────────────────────────────┘   │  │     │
│                                      │                                   │  │     │
│                                      │  All VMs report to Journal MCP    │  │     │
│                                      └───────────────────────────────────┘  │     │
│                                                  │                            │     │
│                                                  │ Activity reports via HTTP  │     │
│                                                  └────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────────┘

Interaction Patterns:
1. User → Claude Desktop → Journal MCP (task management via MCP protocol)
2. User → Claude Desktop → VirtualBox MCP (VM orchestration via MCP protocol)
3. User → Electron Visual UI → Journal MCP HTTP API (direct UI operations)
4. User → Electron AI Chat → Claude API → Journal MCP (task management via tool calling)
5. User → Electron AI Chat → Claude API → VirtualBox MCP (VM orchestration via tool calling)
6. Dev VM Activity Reporter → Journal MCP (automated tracking via HTTP)
7. Worker VM Agents → Journal MCP (task execution & results via HTTP)
```

---

## System Components

### 1. Journal MCP Server (Core)

**Purpose:** Central brain for task management and activity tracking

**Location:** Host machine (or Control VM)

**Technology:** Node.js, SQLite, Express

**Responsibilities:**
- Task CRUD operations
- Collection (project) management
- Task dependency graph management
- Activity aggregation from multiple sources
- HTTP endpoints for VM/IDE activity reporting
- MCP tool implementation for Claude integration

**MCP Tools Exposed:**
- `create_task` - Create a new task
- `create_event` - Create a new event
- `complete_task` - Mark task complete
- `complete_event` - Mark event complete
- `cancel_task` - Mark task cancelled
- `cancel_event` - Mark event cancelled
- `get_todays_log` - Get today's daily log collection
- `get_daily_log` - Get specific date log collection
- `migrate_task` - Move task to different collection/date
- `create_collection` - Create project/collection
- `list_collections` - List all collections
- `add_to_collection` - Add task/event to collection
- `remove_from_collection` - Remove task/event from collection
- `add_task_dependency` - Create task dependency
- `get_task_dependencies` - Get task dependency graph
- `get_unblocked_tasks` - Tasks that can start now
- `get_blocked_tasks` - Tasks waiting on dependencies
- `get_critical_path` - Longest dependency chain
- `get_activity_summary` - Recent developer activity
- `suggest_task_completion` - AI suggestions based on activity
- `search_tasks` - Search tasks by title/description/topic
- `search_events` - Search events by title/description/location

**HTTP Endpoints:**
```javascript
// Electron App & external clients
GET    /api/tasks/:id
GET    /api/tasks?collectionId=123
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
POST   /api/tasks/:id/migrate

GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id

GET    /api/collections
POST   /api/collections
PUT    /api/collections/:id

POST   /api/dependencies
GET    /api/tasks/:id/dependencies
GET    /api/tasks/critical-path

// VM & Activity Reporter endpoints
POST   /activity              // VMs/IDEs report activity
POST   /result                // VMs report task results
GET    /tasks/:vmName         // VMs poll for assigned tasks
GET    /health                // Health check
```

**Database Schema:** See `docs/database-schema.md`

---

### 2. Electron Desktop App (Visual UI + Embedded AI)

**Purpose:** Unified interface combining visual task management with embedded AI chat

**Location:** Host machine

**Technology:** Electron, React, TypeScript, Anthropic SDK

**Responsibilities:**
- Provide visual UI for task/event management
- Display daily logs, monthly plans, project collections
- Show task dependency graphs
- Visualize activity summaries
- Offer quick task creation and updates
- Display AI-powered task completion suggestions
- **Embed conversational AI chat interface**
- Serve as self-contained alternative to Claude Desktop

**Key Features:**

**Visual UI Components:**
- **Daily Log View** - Today's tasks and events
- **Collection Views** - Projects, monthly plans, custom collections
- **Dependency Graph** - Visual task dependencies with drag-and-drop
- **Activity Timeline** - Recent development activity
- **Quick Entry** - Rapid task/event creation
- **Search** - Full-text search across tasks and events

**AI Chat Panel (NEW):**
- **Embedded Claude** - Chat interface within the app
- **Context Awareness** - Knows current view, selected tasks, active collection
- **Tool Calling** - Uses Claude API with MCP tool definitions
- **Streaming Responses** - Real-time AI responses
- **Rich Previews** - Shows created tasks/events inline
- **Quick Actions** - "Create this as a task" buttons in responses

**Architecture:**
- **Main Process**
  - HTTP client to Journal MCP (for UI operations)
  - Claude API client (for AI chat)
  - MCP tool definitions exposed to Claude API
- **Preload** - Exposes APIs via IPC to renderer
- **Renderer**
  - React UI components (visual management)
  - Chat UI component (AI conversation)
  - Context provider (shares state between UI and chat)

**Communication Flows:**

*Visual UI Operations:*
```
React UI → IPC → Main Process → HTTP → Journal MCP Server
```

*AI Chat Operations:*
```
Chat Component → IPC → Main Process → Claude API (with tools)
                                           ↓
                                     Calls MCP tools
                                           ↓
                                    Journal MCP Server
```

*Context-Aware Prompts:*
```
User selects task in UI → Context updates
User asks in chat: "What's blocking this?"
→ Chat sends task_id with query
→ Claude calls get_task_dependencies(task_id)
→ Returns dependency info
```

**Why Three Interfaces:**
1. **Claude Desktop** - Power users, complex workflows, VM orchestration
2. **Electron Visual UI** - Quick visual management, drag-and-drop, overview
3. **Electron AI Chat** - AI help without leaving the app, context-aware assistance

**Why Separate from Journal MCP:**
- Journal MCP can run 24/7 on server/always-on machine
- Electron app can be closed without losing data
- Multiple clients (Electron, CLI, future web app) can share Journal MCP
- Clean separation: UI vs business logic
- Claude API billing isolated to Electron app usage

---

### 3. VirtualBox MCP Server

**Purpose:** VM lifecycle management and orchestration

**Location:** Control VM (or Host)

**Technology:** Node.js, SSH2

**Responsibilities:**
- Create VMs with specific roles (security, build, test, data)
- Start/stop/delete VMs
- Assign tasks to VMs
- Store VM role metadata
- Execute VBoxManage commands via SSH

**MCP Tools Exposed:**
- `create_vm_with_role` - Create VM with specific role
- `start_vm` - Start a VM
- `stop_vm` - Stop/shutdown VM
- `delete_vm` - Remove VM permanently
- `get_vm_info` - Get VM details
- `list_vms` - List all VMs
- `assign_task_to_vm` - Give task to specific VM
- `get_vm_tasks` - Tasks assigned to a VM
- `clone_vm` - Clone existing VM
- `take_snapshot` - VM snapshot
- `restore_snapshot` - Restore to snapshot

**Configuration:**
```javascript
{
  host: "192.168.1.100",      // VirtualBox host IP
  sshUser: "vboxcontroller",  // SSH user
  sshKeyPath: "~/.ssh/id_rsa" // SSH key path
}
```

---

### 4. Activity Reporter (Dev VM)

**Purpose:** Monitor development activity and report to Journal MCP

**Location:** Runs in your development VM

**Technology:** Node.js, simple-git

**Responsibilities:**
- Watch for git commits
- Monitor file changes
- Track time spent in files
- Report activity via HTTP to Journal MCP
- Integrate with IDE extensions

**Activity Types Reported:**
- `git_commit` - New commits with message and files
- `file_change` - File modifications
- `file_open` - File opened in editor
- `file_save` - File saved
- `test_run` - Test execution results
- `session_start` - Dev session started

**Installation:**
```bash
npm install
node activity-reporter.js --journal-host 10.0.2.2:3333
```

---

### 5. VM Agent (Security/Build/Test VMs)

**Purpose:** Execute tasks assigned by Claude/Journal MCP

**Location:** Runs in worker VMs (scanner, builder, test VMs)

**Technology:** Python

**Responsibilities:**
- Poll Journal MCP for assigned tasks
- Execute security scans, builds, tests
- Report results back to Journal MCP
- Support multiple task types based on VM role

**Task Types by Role:**

**Security VM:**
- `nmap` - Network scanning
- `nikto` - Web vulnerability scanning
- `gobuster` - Directory enumeration
- `sqlmap` - SQL injection testing
- `vulnerability_scan` - Comprehensive scan

**Build VM:**
- `git_clone` - Clone repository
- `npm_build` - Node.js build
- `docker_build` - Docker image build
- `maven_build` - Java build
- `run_tests` - Execute test suite

**Test VM:**
- `pytest` - Python tests
- `jest` - JavaScript tests
- `selenium` - Browser tests
- `cypress` - E2E tests
- `load_test` - Performance testing

---

### 5. IDE Extensions (Optional MVP+)

**Purpose:** Deep IDE integration for activity tracking

**Location:** VS Code, IntelliJ (installed in Dev VM)

**Responsibilities:**
- Track active files and time spent
- Report test runs
- Detect terminal commands
- Quick task creation from IDE
- Show today's journal in sidebar

---

## Data Models

### Task

```javascript
{
  id: 1,
  title: "Implement OAuth integration",
  description: "Add OAuth 2.0 support to authentication system",
  topic: "auth",
  status: "CREATED" | "MIGRATED" | "IN_PROGRESS" | "FINISHED" | "CANCELED" | "DELETED",
  createDate: "2024-12-21",
  startDate: "2024-12-21",
  endDate: null,
  canceledDate: null,
  migrated_from_id: null,
  migrated_to_id: null,
  metadata: {} // JSON for extensibility
}
```

### Event

```javascript
{
  id: 5,
  title: "Team standup",
  description: "Daily sync meeting",
  location: "Zoom",
  status: "CREATED" | "MIGRATED" | "IN_PROGRESS" | "FINISHED" | "CANCELED" | "DELETED",
  scheduledDate: "2024-12-21T10:00:00Z",
  createDate: "2024-12-21",
  startDate: null,
  endDate: null,
  canceledDate: null,
  metadata: {}
}
```

### Collection

```javascript
{
  id: 3,
  title: "Auth Project",
  description: "User authentication system",
  longDescription: "Complete OAuth 2.0 implementation with JWT tokens",
  type: "PROJECT" | "DAILY" | "MONTHLY" | "QUARTERLY" | "DEFAULT" | "CUSTOM",
  subType: "TASK" | "EVENT" | "PLAN" | "LOG" | "CUSTOM",
  createDate: "2024-12-15T10:00:00Z",
  startDate: "2024-12-15T10:00:00Z",
  endDate: null,
  canceledDate: null,
  archived_at: null,
  metadata: {}
}
```

### CollectionItem

```javascript
{
  id: 10,
  collectionId: 3,
  itemId: 1,
  itemType: "Task" | "Event" | "Collection"
}
```

### Task Dependency

```javascript
{
  id: 5,
  task_id: 10,              // Deploy to production
  depends_on_task_id: 8,     // Run integration tests
  dependency_type: "blocks", // or "related", "suggested"
  created_at: "2024-12-21T10:15:00Z",
  created_by: "user" | "ai_suggested"
}
```

### Activity

```javascript
{
  id: 42,
  type: "git_commit",
  source: "dev-vm",
  data: {
    hash: "a3f2b1c",
    message: "Implement OAuth token validation",
    files: ["auth-service.ts", "token-validator.ts"]
  },
  timestamp: "2024-12-21T11:45:00Z",
  related_task_id: 1,
  related_event_id: null
}
```

### VM Metadata

```javascript
{
  name: "scanner-1",
  role: "security",
  status: "running",
  created_at: "2024-12-21T09:00:00Z",
  last_task: "nmap_scan_192.168.1.0/24"
}
```

---

## Core Workflows

### Workflow 1: Morning Standup

```
User → Claude: "Good morning, what's on my plate today?"

Claude → Journal MCP: get_todays_log()
// Returns today's daily log collection (type='DAILY', subType='LOG')

Claude → Journal MCP: get_activity_summary(days=1)

Claude → User: "Good morning! You have 5 open tasks and 2 events:

               Tasks:
               - Implement OAuth integration (IN_PROGRESS)
               - Fix password reset bug (CREATED)
               - Write tests for auth service (CREATED)
               - Update API documentation (CREATED)
               - Code review for PR #123 (CREATED)

               Events:
               - Team standup at 10am (Zoom)
               - Client demo at 2pm (Conference Room A)

               Yesterday you completed 3 tasks and made 8 commits.
               You also have 2 incomplete tasks from yesterday.
               Should I migrate them to today's log?"

User → Claude: "Yes, migrate them"

Claude → Journal MCP: migrate_task(task_id=10, to_collection_id=todaysLogId)
Claude → Journal MCP: migrate_task(task_id=11, to_collection_id=todaysLogId)

Claude → User: "Done! You now have 7 tasks in today's log."
```

---

### Workflow 2: Creating Task with Dependencies

```
User → Claude: "Create a task to deploy auth service that depends on tests passing"

Claude → Journal MCP: create_task(
  title="Deploy auth service",
  description="Deploy to production",
  topic="deployment"
)
// Returns task_id: 15

Claude → Journal MCP: create_task(
  title="Run integration tests",
  description="Verify all tests pass",
  topic="testing"
)
// Returns task_id: 16

Claude → Journal MCP: add_to_collection(
  collection_id=authProjectId,
  item_id=15,
  item_type="Task"
)

Claude → Journal MCP: add_to_collection(
  collection_id=authProjectId,
  item_id=16,
  item_type="Task"
)

Claude → Journal MCP: add_task_dependency(
  task_id=15,
  depends_on_task_id=16,
  dependency_type="blocks"
)

Claude → User: "Created two tasks with dependency:
               [Run integration tests] → [Deploy auth service]

               Both added to Auth Project collection.
               You can start with running the tests now."
```

---

### Workflow 2b: Same Task Creation via Electron App

```
User opens Electron Desktop App

[Daily Log View shows today's tasks]

User clicks "New Task" button

[Task Creation Form appears]

User fills in:
- Title: "Deploy auth service"
- Description: "Deploy to production"
- Topic: "deployment"
- Dependencies: [Dropdown shows] "Run integration tests"
- Collection: "Auth Project"

User clicks "Save"

[Electron App]
→ IPC: addTask()
→ Main Process HTTP Client
→ POST /api/tasks {title, description, topic, ...}
→ Journal MCP Server processes request
→ Returns task_id: 15

[Electron App]
→ IPC: addTaskDependency(15, 16, 'blocks')
→ Main Process HTTP Client
→ POST /api/dependencies {task_id: 15, depends_on_task_id: 16}
→ Journal MCP Server validates (no cycles), creates dependency

[UI refreshes, shows new task in Daily Log with dependency indicator]

User can now:
- See visual dependency graph
- Drag tasks to reorder
- Check off completed tasks
- View AI suggestions panel (powered by activity data)

[Later: User completes "Run integration tests" via UI]

Electron App → POST /api/tasks/16/complete → Journal MCP

[UI automatically highlights "Deploy auth service" as unblocked]

Alternative: User can also ask Claude via Desktop:
User → Claude: "Show me the deployment task I just created"
Claude → Journal MCP: search_tasks(query="deploy")
Claude → User: "Deploy auth service - currently blocked by integration tests"
```

**Key Benefit:** Users can choose:
- **Claude Desktop** for natural language, AI insights, complex queries
- **Electron App** for quick visual management, batch operations, dependency visualization

---

### Workflow 2c: Using Embedded AI Chat in Electron App

```
User opens Electron App, viewing Daily Log

[Left panel shows task list]
[Right panel shows AI Chat]

User working on tasks, selects "Implement OAuth integration" task

User → AI Chat: "What's the best approach for this?"

[Electron App sends to Claude API with context]
{
  message: "What's the best approach for this?",
  context: {
    selected_task: { id: 15, title: "Implement OAuth integration", ... },
    current_view: "daily_log",
    recent_activity: [...]
  }
}

Claude API (with MCP tools) →
  - Calls get_task(task_id=15) via Journal MCP
  - Calls get_activity_summary(hours=24)
  - Analyzes context

Claude → User (in chat panel):
  "For the OAuth integration task, I recommend:

   1. Start with token validation (I see you modified crypto-utils.ts yesterday)
   2. Implement refresh token flow
   3. Add session management

   Would you like me to break this into subtasks with dependencies?"

User → Chat: "Yes, create them"

Claude API → Calls MCP tools:
  - create_task(title="Implement token validation", ...)
  - create_task(title="Implement refresh tokens", ...)
  - create_task(title="Add session management", ...)
  - add_task_dependency(task2 depends on task1)
  - add_task_dependency(task3 depends on task2)

[Left panel UI automatically updates showing new tasks]
[Chat shows confirmation with clickable task links]

Claude → Chat: "Created 3 subtasks:
  - [Implement token validation](#task-16)
  - [Implement refresh tokens](#task-17) (depends on #16)
  - [Add session management](#task-18) (depends on #17)"

User clicks task link in chat → UI selects that task

---

[Later: User stuck on implementation]

User → Chat: "I'm getting an error with token validation"

Claude → User: "Let me check your recent activity to understand what you've tried"

Claude API → Calls get_activity_by_task(task_id=16)
  Returns: [3 commits, 2 file saves, test run failed]

Claude → User: "I see your test run failed 5 minutes ago. Based on your commits
               to token-validator.ts, it looks like you might have a timing issue
               with the JWT expiration check. Try..."

[Context-aware help without user needing to explain what they've been doing]
```

**Key Features Shown:**
- **Context Awareness** - Chat knows what task you're viewing
- **Seamless Integration** - Chat and UI update each other in real-time
- **Activity-Based Insights** - AI sees your recent work automatically
- **One-Click Actions** - Click task links to navigate UI
- **No Context Switching** - Stay in one app for everything

---

### Workflow 3: VM Orchestration

```
User → Claude: "Create a security VM and scan 192.168.1.0/24"

Claude → VirtualBox MCP: create_vm_with_role(
  name="scanner-1",
  role="security",
  memory="4096",
  cpus="2"
)

Claude → VirtualBox MCP: start_vm(name="scanner-1")

Claude → Journal MCP: create_task(
  content="Scan 192.168.1.0/24",
  collection="security-audit"
)
// Returns task_id: 20

Claude → VirtualBox MCP: assign_task_to_vm(
  vm_name="scanner-1",
  task=JSON.stringify({
    type: "nmap",
    target: "192.168.1.0/24",
    scan_type: "full"
  })
)

Claude → User: "I've created scanner-1 and it's now scanning 192.168.1.0/24.
               The scan typically takes 10-15 minutes.
               I'll let you know when it completes."

[10 minutes later - scanner-1 completes and reports back]

Claude → Journal MCP: receives result via HTTP endpoint

Claude → User: "scanner-1 found 12 active hosts. 3 have critical findings:
               - 192.168.1.5: Port 3306 open (MySQL)
               - 192.168.1.10: Port 22 open (SSH, weak cipher)
               - 192.168.1.15: Port 80 open (outdated Apache)
               
               Should I create tasks to investigate each?"
```

---

### Workflow 4: Hybrid Usage (Electron + Claude Together)

```
[Morning: User opens Electron App, sees AI Suggestions panel]

Electron App
→ GET /api/activity/suggestions
→ Journal MCP analyzes recent activity
→ Returns: "Based on last night's commits, you may have completed:
           'Implement OAuth integration' (85% confidence)"

[Suggestions panel shows in UI with "Complete Task" button]

User clicks "Complete Task" in Electron App

→ POST /api/tasks/10/complete
→ Journal MCP marks complete, updates dependency graph

[UI refreshes, shows "Deploy auth service" is now unblocked]

User wants AI help planning deployment:
User switches to Claude Desktop

User → Claude: "Help me plan the deployment for the auth service"

Claude → Journal MCP: get_task(task_id=15)  // Deploy auth service
Claude → Journal MCP: get_task_dependencies(task_id=15)
Claude → Journal MCP: get_activity_summary(days=7)

Claude → User: "I see the deployment task is unblocked now. Based on your
               recent activity, here's a deployment plan:

               1. Run integration tests (you modified tests yesterday)
               2. Update API docs (I see swagger.yaml was changed)
               3. Create release notes (based on 12 commits this week)
               4. Deploy to staging first
               5. Run smoke tests
               6. Deploy to production

               Should I create these as subtasks with dependencies?"

User → Claude: "Yes, create them"

[Claude creates 6 tasks with proper dependencies via Journal MCP]

User switches back to Electron App
→ Refreshes
→ Sees new task tree with dependencies visualized as graph
→ Can now drag-and-drop to adjust order
→ Can check off tasks as completed

[Later: User completes staging deployment]

User checks task in Electron App → POST /api/tasks/18/complete

[Electron App shows AI suggestion notification]
"Would you like me to create smoke test checklist based on previous deployments?"

User → Electron App: Click "Ask Claude" button
→ Opens Claude Desktop with pre-filled prompt
→ Claude creates checklist automatically
```

**Key Insight:**
- Use **Electron** for visual management, quick edits, overview
- Use **Claude** for planning, AI insights, complex operations
- Both work on same data (Journal MCP Server)
- Context flows between both interfaces seamlessly

---

### Workflow 5: Intelligent Task Suggestions

```
[User working in Dev VM, makes 3 commits to auth-service.ts]

[Activity Reporter sends commits to Journal MCP]

User → Claude: "What have I been working on?"

Claude → Journal MCP: get_activity_summary(minutes=60)

Claude → Journal MCP: suggest_task_completion()

Claude → User: "In the last hour, you've:
               - Made 3 commits to auth-service.ts
               - Modified token-validator.ts and crypto-utils.ts
               - Spent 45 minutes in the auth module
               
               Based on this activity, I think you may have completed:
               - 'Implement OAuth integration' (85% confidence)
                 Reason: 3 commits mention 'OAuth' and 'token validation'
               
               Should I mark this task as complete?"

User → Claude: "Yes"

Claude → Journal MCP: complete_task(task_id=10)

Claude → User: "Task completed! This unblocks:
               - 'Deploy auth service' (ready to start now)
               - 'Update API documentation' (ready to start now)
               
               Which should we prioritize?"
```

---

### Workflow 6: Dependency Analysis

```
User → Claude: "What's blocking the production deployment?"

Claude → Journal MCP: get_blocked_tasks()
Claude → Journal MCP: get_critical_path()

Claude → User: "Production deployment is blocked by:
               
               Critical path (longest chain):
               [Fix auth bug] → [Run tests] → [Security approval] → [Deploy]
               
               'Fix auth bug' is the bottleneck. Completing it will unblock
               3 other tasks and move the deployment forward.
               
               Estimated time to deployment: 3 days (if all goes smoothly)
               
               Should I show you the full dependency graph?"
```

---

## Interface Comparison: Three Ways to Interact

The system provides three complementary interfaces, each optimized for different use cases:

### 1. Claude Desktop (MCP Protocol)
**Best for:** Power users, complex workflows, VM orchestration

**Strengths:**
- Full conversational AI capabilities
- Direct MCP protocol access (fastest, most powerful)
- Can orchestrate VMs via VirtualBox MCP
- No API costs (uses local Claude Desktop)
- Rich context understanding across conversations

**Use Cases:**
- "Create a deployment workflow with 10 steps and dependencies"
- "Analyze my activity and suggest what I should work on"
- "Create a security VM, scan this network, and create tasks for findings"
- Complex multi-step operations

### 2. Electron Visual UI (HTTP API)
**Best for:** Quick management, visual overview, batch operations

**Strengths:**
- Fast, responsive UI
- Visual dependency graphs with drag-and-drop
- Keyboard shortcuts
- Offline-capable (once data loaded)
- No thinking required - just click

**Use Cases:**
- Check off completed tasks
- Quick task creation
- Reorder priorities
- View daily/monthly logs
- Drag tasks between collections

### 3. Electron AI Chat (Claude API + MCP Tools)
**Best for:** Context-aware help, in-app assistance, guided workflows

**Strengths:**
- AI help without leaving the app
- Context-aware (knows what you're viewing/editing)
- Activity-based insights automatically included
- Seamless UI integration (chat creates tasks → UI updates)
- Best of both worlds

**Use Cases:**
- "What's the best approach for this task?" (while viewing it)
- "Break this into subtasks" (context: selected task)
- "I'm stuck on this error" (AI sees your recent commits)
- Guided task planning while managing visually

### When to Use Which Interface

**Scenario: Morning Planning**
- **Claude Desktop**: "What should I work on today based on my activity?"
- **Electron Visual**: Open daily log, drag unfinished tasks from yesterday
- **Electron Chat**: "Help me prioritize these 7 tasks"

**Scenario: Working on a Task**
- **Electron Visual**: Check task details, mark as in-progress
- **Electron Chat**: "What's blocking this?" or "How do I approach this?"
- **Claude Desktop**: "Create a deployment plan for this feature" (complex)

**Scenario: End of Day**
- **Electron Visual**: Check off completed tasks, see visual progress
- **Electron Chat**: "What did I accomplish today?"
- **Claude Desktop**: "Generate a status report for the week"

**Scenario: VM Operations**
- **Claude Desktop ONLY**: VM orchestration requires VirtualBox MCP (not HTTP API)

### Integration Between Interfaces

All three interfaces work on the **same data** (Journal MCP Server):

```
Claude Desktop creates tasks
  ↓
Electron Visual UI shows them instantly
  ↓
Electron Chat knows about them
  ↓
User edits in Visual UI
  ↓
Changes visible in Claude Desktop
```

**Example Flow:**
1. Ask Claude Desktop: "Create tasks for OAuth implementation"
2. Switch to Electron app → See tasks in Daily Log
3. Select a task → Ask Electron Chat: "What's the approach?"
4. Chat creates subtasks → Visual UI updates
5. Work on task → Activity Reporter tracks progress
6. Later, Claude Desktop: "What did I complete?" → Sees all updates

---

## Graph Algorithms

### Task Dependency Graph

**Graph Type:** Directed Acyclic Graph (DAG)

**Nodes:** Tasks

**Edges:** Dependencies (A → B means "B depends on A" or "A must complete before B")

**Key Algorithms:**

1. **Topological Sort**
   - Purpose: Find valid task ordering
   - Use: "What order should I do these tasks?"
   - Implementation: Kahn's algorithm or DFS-based

2. **Cycle Detection**
   - Purpose: Prevent impossible dependency chains
   - Use: Validate before adding edge (A→B→C→A is impossible)
   - Implementation: DFS with visited/processing sets

3. **Transitive Closure**
   - Purpose: Find all dependencies (direct + indirect)
   - Use: "What ALL does this task depend on?"
   - Implementation: Floyd-Warshall or DFS from each node

4. **Critical Path**
   - Purpose: Find longest dependency chain
   - Use: "What's the bottleneck?" / "Earliest completion date?"
   - Implementation: Longest path in DAG

5. **Reachability**
   - Purpose: Can we get from task A to task B?
   - Use: "Will completing this unblock that?"
   - Implementation: BFS/DFS

**Graph Operations:**

```javascript
// Add dependency (with cycle detection)
function addDependency(taskId, dependsOnTaskId) {
  // 1. Check if adding this edge creates a cycle
  if (wouldCreateCycle(taskId, dependsOnTaskId)) {
    throw new Error("Circular dependency detected");
  }
  
  // 2. Add edge
  graph.addEdge(dependsOnTaskId, taskId);
}

// Get tasks ready to work on
function getUnblockedTasks() {
  // Tasks with no incomplete dependencies
  return tasks.filter(task => {
    const deps = getDependencies(task.id);
    return deps.every(dep => dep.status === "completed");
  });
}

// Get critical path
function getCriticalPath() {
  // Longest path from any start node to any end node
  return longestPathDAG(graph);
}

// Get what completes when task finishes
function getUnblockedByCompletion(taskId) {
  // Find all tasks that directly depend on this one
  return graph.successors(taskId).filter(successor => {
    // Check if this was the last blocker
    const deps = getDependencies(successor);
    const incompleteDeps = deps.filter(d => d.status !== "completed");
    return incompleteDeps.length === 1 && incompleteDeps[0].id === taskId;
  });
}
```

---

## Natural Language Understanding

Claude interprets user intent and maps to tool calls:

### Dependency Keywords

**"depends on" / "requires" / "needs"**
→ `add_task_dependency(task_id, depends_on_task_id)`

**"before" / "then" / "after"**
→ Determines dependency direction

**"blocks" / "blocked by"**
→ Reverse dependency

### Examples:

```
"Create task X that depends on Y"
→ create_task(X), add_dependency(X depends on Y)

"Do X before Y"
→ add_dependency(Y depends on X)

"Y is blocked by X"
→ add_dependency(Y depends on X)

"X, then Y, then Z"
→ add_dependency(Y depends on X), add_dependency(Z depends on Y)
```

### Task Creation Patterns:

```
"Create a deployment workflow"
→ Creates standard deployment task chain with dependencies

"Remind me to..."
→ create_task()

"I need to..."
→ create_task()

"Add task..."
→ create_task()
```

### Query Patterns:

```
"What should I work on?"
→ get_unblocked_tasks() + smart prioritization

"What's blocking X?"
→ get_task_dependencies(X)

"What can I do now?"
→ get_unblocked_tasks()

"Show me the critical path"
→ get_critical_path()

"What have I been working on?"
→ get_activity_summary()
```

---

## Technology Stack

### Languages
- **JavaScript/Node.js** - MCP servers, activity reporter
- **Python** - VM agents (optional: voice interface)
- **SQL** - Database queries and schema

### Core Dependencies

**Journal MCP:**
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "better-sqlite3": "^9.2.2",
  "express": "^4.18.2",
  "simple-git": "^3.22.0"
}
```

**VirtualBox MCP:**
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "ssh2": "^1.15.0"
}
```

**Activity Reporter:**
```json
{
  "simple-git": "^3.22.0",
  "node-fetch": "^3.3.2",
  "chokidar": "^3.5.3"
}
```

**VM Agent:**
```python
requests==2.31.0
```

### Infrastructure
- **SQLite** - Primary database
- **VirtualBox** - VM management
- **SSH** - Remote command execution
- **HTTP** - Activity reporting and VM communication

### Development Tools
- **Claude Desktop** - LLM interface
- **Claude Code / Cline** - AI coding assistant
- **VS Code** - Primary IDE
- **Git** - Version control

---

## File Structure

```
awesome-dev-journal/                   # Monorepo root
├── documentation/
│   ├── design-document.md             (This file)
│   ├── database-design.md             Database schema and design
│   ├── mcp-tools-spec.md              MCP tool specifications
│   ├── graph-algorithms.md            Graph implementation details
│   ├── api-endpoints.md               HTTP API documentation
│   └── migration-guide.md             Electron → MCP migration steps
│
├── packages/
│   ├── shared/                        Shared TypeScript types
│   │   └── types/
│   │       ├── BaseItem.ts
│   │       ├── Task.ts
│   │       ├── Event.ts
│   │       ├── Collection.ts
│   │       ├── TaskDependency.ts
│   │       ├── Activity.ts
│   │       ├── VmRegistry.ts
│   │       └── index.ts
│   │
│   ├── journal-mcp/                   Journal MCP Server (Core)
│   │   ├── src/
│   │   │   ├── index.ts               Main entry point (MCP + HTTP server)
│   │   │   │
│   │   │   ├── database/              Database layer (moved from electron-app)
│   │   │   │   ├── sqlite.ts          Database initialization
│   │   │   │   ├── TaskManager.ts     Task CRUD operations
│   │   │   │   ├── EventManager.ts    Event CRUD operations
│   │   │   │   ├── CollectionManager.ts
│   │   │   │   ├── CollectionItemManager.ts
│   │   │   │   ├── TaskDependencyManager.ts
│   │   │   │   ├── ActivityManager.ts
│   │   │   │   └── VmRegistryManager.ts
│   │   │   │
│   │   │   ├── http/                  HTTP API Server
│   │   │   │   ├── server.ts          Express server setup
│   │   │   │   ├── routes/
│   │   │   │   │   ├── tasks.ts       GET/POST /api/tasks
│   │   │   │   │   ├── events.ts      GET/POST /api/events
│   │   │   │   │   ├── collections.ts GET/POST /api/collections
│   │   │   │   │   ├── dependencies.ts Task dependency endpoints
│   │   │   │   │   ├── activity.ts    Activity tracking endpoints
│   │   │   │   │   └── vms.ts         VM registry endpoints
│   │   │   │   └── middleware/
│   │   │   │       ├── error-handler.ts
│   │   │   │       ├── validation.ts
│   │   │   │       └── cors.ts
│   │   │   │
│   │   │   ├── mcp/                   MCP Tools for Claude Desktop
│   │   │   │   ├── server.ts          MCP server setup
│   │   │   │   └── tools/
│   │   │   │       ├── task-tools.ts       create_task, complete_task, etc.
│   │   │   │       ├── collection-tools.ts create_collection, add_to_collection
│   │   │   │       ├── dependency-tools.ts add_task_dependency, get_critical_path
│   │   │   │       ├── activity-tools.ts   get_activity_summary, suggest_task_completion
│   │   │   │       └── daily-log-tools.ts  get_todays_log, get_daily_log, migrate_task
│   │   │   │
│   │   │   ├── graph/                 Graph algorithms
│   │   │   │   ├── cycle-detection.ts Prevent circular dependencies
│   │   │   │   ├── critical-path.ts   Find longest dependency chain
│   │   │   │   ├── topological-sort.ts Task ordering
│   │   │   │   └── graph-utils.ts     Common graph operations
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── date-utils.ts      Date serialization/deserialization
│   │   │       └── logger.ts          Logging utilities
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── config.example.json
│   │   └── .env.example
│   │
│   ├── electron-app/                  Electron UI Client (Visual + AI Chat)
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── index.ts           Main process entry
│   │   │   │   ├── api/               API clients
│   │   │   │   │   ├── journal-client.ts  HTTP client to Journal MCP
│   │   │   │   │   ├── claude-client.ts   Claude API client (for chat)
│   │   │   │   │   ├── mcp-tools.ts       MCP tool definitions for Claude API
│   │   │   │   │   └── types.ts       HTTP request/response types
│   │   │   │   └── ipc/               IPC handlers
│   │   │   │       ├── ipcTaskHandlers.ts      (proxy to HTTP API)
│   │   │   │       ├── ipcEventHandlers.ts
│   │   │   │       ├── ipcCollectionHandlers.ts
│   │   │   │       ├── ipcCollectionItemHandlers.ts
│   │   │   │       ├── ipcTaskDependencyHandlers.ts
│   │   │   │       ├── ipcActivityHandlers.ts
│   │   │   │       ├── ipcVmRegistryHandlers.ts
│   │   │   │       └── ipcChatHandlers.ts      (chat with Claude API)
│   │   │   │
│   │   │   ├── preload/
│   │   │   │   ├── index.ts           Preload script
│   │   │   │   └── index.d.ts         Type definitions
│   │   │   │
│   │   │   └── renderer/              React UI
│   │   │       ├── src/
│   │   │       │   ├── App.tsx
│   │   │       │   ├── components/
│   │   │       │   │   ├── TaskList.tsx
│   │   │       │   │   ├── DependencyGraph.tsx
│   │   │       │   │   ├── AIChatPanel.tsx      NEW: Embedded AI chat
│   │   │       │   │   ├── ChatMessage.tsx      NEW: Chat message component
│   │   │       │   │   └── ContextProvider.tsx  NEW: Share state with chat
│   │   │       │   ├── pages/
│   │   │       │   │   ├── DailyLog.tsx
│   │   │       │   │   ├── Collections.tsx
│   │   │       │   │   └── Settings.tsx
│   │   │       │   ├── hooks/
│   │   │       │   │   └── useChat.ts           NEW: Chat hook
│   │   │       │   └── styles/
│   │   │       └── index.html
│   │   │
│   │   ├── resources/
│   │   ├── package.json
│   │   ├── electron.vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── virtualbox-mcp/                VirtualBox MCP Server
│   │   ├── src/
│   │   │   ├── index.ts               Main MCP server
│   │   │   ├── controllers/
│   │   │   │   ├── vm-controller.ts   VM lifecycle (create, start, stop, delete)
│   │   │   │   └── task-assignment.ts Task → VM routing
│   │   │   ├── utils/
│   │   │   │   ├── ssh-client.ts      SSH connection wrapper
│   │   │   │   └── vbox-commands.ts   VBoxManage command helpers
│   │   │   └── mcp/
│   │   │       └── tools.ts           MCP tools (create_vm, start_vm, etc.)
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── config.example.json
│   │
│   ├── activity-reporter/             Activity Reporter (Dev VM)
│   │   ├── src/
│   │   │   ├── index.ts               Main entry point
│   │   │   ├── watchers/
│   │   │   │   ├── git-watcher.ts     Monitor git commits
│   │   │   │   ├── file-watcher.ts    Monitor file changes (chokidar)
│   │   │   │   └── ide-integration.ts VS Code extension hooks
│   │   │   └── reporters/
│   │   │       └── http-reporter.ts   Send activity to Journal MCP
│   │   │
│   │   ├── package.json
│   │   └── config.example.json
│   │
│   └── vm-agent/                      VM Agent (Worker VMs)
│       ├── src/
│       │   ├── agent.py               Main agent (polling loop)
│       │   ├── handlers/
│       │   │   ├── security.py        Security task handlers (nmap, nikto, etc.)
│       │   │   ├── build.py           Build task handlers (npm, docker, maven)
│       │   │   └── test.py            Test task handlers (pytest, jest, etc.)
│       │   └── utils/
│       │       ├── task_poller.py     Poll Journal MCP for tasks
│       │       └── result_reporter.py Report results via HTTP
│       │
│       ├── requirements.txt
│       └── config.example.json
│
├── tests/
│   ├── journal-mcp/
│   │   ├── database.test.ts
│   │   ├── graph-algorithms.test.ts
│   │   ├── mcp-tools.test.ts
│   │   ├── http-api.test.ts
│   │   └── activity-tracking.test.ts
│   │
│   ├── electron-app/
│   │   ├── ipc-handlers.test.ts
│   │   └── http-client.test.ts
│   │
│   ├── virtualbox-mcp/
│   │   └── vm-controller.test.ts
│   │
│   └── integration/
│       ├── electron-to-mcp.test.ts
│       └── end-to-end.test.ts
│
├── scripts/
│   ├── setup-monorepo.sh              Initialize monorepo workspace
│   ├── setup-journal-mcp.sh           Setup Journal MCP server
│   ├── install-dev-vm.sh              Install activity reporter on dev VM
│   ├── backup-database.sh             Backup SQLite database
│   ├── migrate-electron-data.sh       Migrate data from electron to MCP
│   └── test-e2e.sh                    End-to-end system tests
│
├── .gitignore
├── package.json                       Root workspace config (pnpm/npm workspaces)
├── pnpm-workspace.yaml                Workspace configuration
├── tsconfig.base.json                 Shared TypeScript config
├── README.md
└── LICENSE
```

---

## Configuration

### Journal MCP Config (`src/journal-mcp/config.json`)

```json
{
  "database": {
    "path": "./bullet-journal.db"
  },
  "http": {
    "port": 3333,
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:*"]
    }
  },
  "activity": {
    "retention_days": 90
  },
  "mcp": {
    "name": "bullet-journal",
    "version": "1.0.0"
  }
}
```

### VirtualBox MCP Config (`src/virtualbox-mcp/config.json`)

```json
{
  "ssh": {
    "host": "192.168.1.100",
    "port": 22,
    "user": "vboxcontroller",
    "privateKeyPath": "/home/user/.ssh/id_rsa"
  },
  "virtualbox": {
    "defaultMemory": "4096",
    "defaultCpus": "2",
    "defaultDiskSize": "40960"
  },
  "mcp": {
    "name": "virtualbox-controller",
    "version": "1.0.0"
  }
}
```

### Activity Reporter Config (`src/activity-reporter/config.json`)

```json
{
  "journal": {
    "host": "10.0.2.2",
    "port": 3333
  },
  "monitoring": {
    "git": true,
    "files": true,
    "extensions": [".js", ".ts", ".py", ".java", ".go"]
  },
  "reporting": {
    "intervalSeconds": 10,
    "batchSize": 10
  }
}
```

### Claude Desktop Config (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "bullet-journal": {
      "command": "node",
      "args": ["/path/to/journal-mcp/index.js"],
      "env": {
        "CONFIG_PATH": "/path/to/config.json"
      }
    },
    "virtualbox-controller": {
      "command": "ssh",
      "args": [
        "control-vm",
        "cd ~/virtualbox-mcp && node index.js"
      ]
    }
  }
}
```

---

## Security Considerations

### Data Privacy
- All data stored locally by default
- No external services unless explicitly configured
- Personal task content never leaves your machine
- Git commit messages and activity data is local-only

### Network Security
- HTTP endpoints should be localhost-only for MVP
- SSH keys for VM control should be dedicated and limited
- VMs should be on isolated networks when possible
- Consider firewall rules for production use

### Access Control
- No authentication required for MVP (local only)
- For team/shared use, add API key authentication
- VM agents should validate task sources
- Consider read-only vs read-write permissions

### VM Isolation
- Security VMs should be on isolated networks
- Build VMs should not have production access
- Consider VM snapshots before risky operations
- Implement VM resource limits

---

## Error Handling Strategy

### MCP Tools
- Always return structured errors
- Include error codes for programmatic handling
- Provide actionable error messages
- Log errors for debugging

```javascript
// Example error response
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      error: "DEPENDENCY_CYCLE",
      message: "Cannot add dependency: would create circular dependency",
      details: {
        path: ["Task A", "Task B", "Task C", "Task A"]
      }
    })
  }],
  isError: true
};
```

### Activity Reporter
- Graceful degradation if Journal MCP unavailable
- Buffer activities locally if network issues
- Retry with exponential backoff
- Don't crash on individual monitoring failures

### VM Operations
- Timeout on long-running operations
- Retry failed SSH connections
- Validate VBoxManage command results
- Clean up partial VM creations on failure

### Graph Operations
- Validate graph structure before operations
- Handle disconnected components
- Prevent infinite loops in traversal
- Check for edge cases (empty graph, single node, etc.)

---

## Testing Strategy

### Unit Tests
- Database operations
- Graph algorithms (especially cycle detection)
- Task dependency logic
- Activity parsing and matching

### Integration Tests
- MCP tool end-to-end
- Journal MCP ↔ VirtualBox MCP
- Activity Reporter → Journal MCP
- VM Agent → Journal MCP

### End-to-End Tests
- Complete workflows via Claude
- Multi-VM orchestration
- Dependency chain execution
- Activity-based suggestions

### Manual Testing
- Use the system for real work (Week 2)
- Test edge cases in conversation
- Verify Claude understands natural language
- Check performance with realistic data volumes

---

## Performance Targets

### Response Times
- MCP tool calls: < 100ms (database operations)
- Graph algorithms: < 500ms (for 1000+ tasks)
- Activity reporting: < 50ms (async, don't block dev work)
- VM operations: 1-5 seconds (VBoxManage is slow)

### Scalability
- Support 10,000+ tasks in database
- Handle 1,000+ dependencies without performance issues
- Process 100+ activity events per hour
- Manage 10+ concurrent VMs

### Database
- Proper indexes on frequently queried columns
- Efficient graph traversal queries

---

## Implementation Roadmap

This section tracks all tasks needed to complete the project as designed. Mark items as complete (✅) as they're finished.

### Phase 1: Foundation & Monorepo Setup

**1.1 Monorepo Structure**
- [ ] Create monorepo root structure
- [ ] Setup npm/pnpm workspaces configuration
- [ ] Create `packages/` directory
- [ ] Setup shared TypeScript config (`tsconfig.base.json`)
- [ ] Create root `.gitignore`
- [ ] Setup workspace scripts in root `package.json`

**1.2 Shared Types Package**
- [ ] Create `packages/shared/types/` directory
- [ ] Port existing type definitions (Task, Event, Collection, etc.)
- [ ] Create API type definitions (TaskApi, EventApi, etc.)
- [ ] Add proper exports in `index.ts`
- [ ] Setup `package.json` for shared types
- [ ] Configure TypeScript to build shared types

### Phase 2: Journal MCP Server (Core)

**2.1 Database Layer**
- [ ] Migrate existing database managers to `journal-mcp/src/database/`
- [ ] Port TaskManager with all operations
- [ ] Port EventManager with all operations
- [ ] Port CollectionManager with all operations
- [ ] Port CollectionItemManager (many-to-many)
- [ ] Port TaskDependencyManager with graph operations
- [ ] Port ActivityManager for activity tracking
- [ ] Port VmRegistryManager for VM tracking
- [ ] Fix date serialization issues (SQLite string ↔ Date object)
- [ ] Add error handling to all database operations
- [ ] Add input validation to all managers

**2.2 Graph Algorithms**
- [ ] Implement cycle detection (DFS-based)
- [ ] Implement topological sort (Kahn's algorithm)
- [ ] Implement critical path algorithm (longest path in DAG)
- [ ] Implement transitive closure (all dependencies)
- [ ] Implement reachability checks (BFS/DFS)
- [ ] Add graph utilities (common operations)
- [ ] Unit tests for all graph algorithms
- [ ] Performance testing with 1000+ tasks

**2.3 HTTP API Server**
- [ ] Setup Express server in `http/server.ts`
- [ ] Implement CORS middleware
- [ ] Implement error handling middleware
- [ ] Implement validation middleware
- [ ] Create task routes (GET/POST/PUT/DELETE /api/tasks)
- [ ] Create event routes (GET/POST/PUT/DELETE /api/events)
- [ ] Create collection routes (GET/POST/PUT /api/collections)
- [ ] Create dependency routes (POST/GET /api/dependencies)
- [ ] Create activity routes (POST/GET /api/activity)
- [ ] Create VM routes (GET/POST /api/vms)
- [ ] Create health check endpoint (GET /api/health)
- [ ] Add request logging
- [ ] Integration tests for all endpoints

**2.4 MCP Server Implementation**
- [ ] Setup MCP server in `mcp/server.ts`
- [ ] Implement task tools (create_task, complete_task, etc.)
- [ ] Implement collection tools (create_collection, add_to_collection)
- [ ] Implement dependency tools (add_task_dependency, get_critical_path)
- [ ] Implement activity tools (get_activity_summary, suggest_task_completion)
- [ ] Implement daily log tools (get_todays_log, migrate_task)
- [ ] Implement search tools (search_tasks, search_events)
- [ ] Add tool input validation
- [ ] Add structured error responses
- [ ] Unit tests for each MCP tool

**2.5 Utilities & Configuration**
- [ ] Implement date serialization utilities
- [ ] Implement logging utility
- [ ] Create `config.example.json`
- [ ] Create `.env.example`
- [ ] Add configuration loading
- [ ] Document all configuration options

**2.6 Main Entry Point**
- [ ] Create `index.ts` that starts both MCP and HTTP servers
- [ ] Handle graceful shutdown
- [ ] Add startup logging
- [ ] Add database initialization on startup
- [ ] Handle configuration errors

### Phase 3: Electron App Migration

**3.1 Electron App Package Setup**
- [ ] Move existing Electron app to `packages/electron-app/`
- [ ] Update package.json dependencies
- [ ] Update import paths to use `@shared/types`
- [ ] Configure build system for monorepo
- [ ] Test that Electron app still builds

**3.2 HTTP Client Implementation**
- [ ] Create `journal-client.ts` HTTP client
- [ ] Implement task endpoints client methods
- [ ] Implement event endpoints client methods
- [ ] Implement collection endpoints client methods
- [ ] Implement dependency endpoints client methods
- [ ] Implement activity endpoints client methods
- [ ] Implement VM endpoints client methods
- [ ] Add error handling and retries
- [ ] Add request/response types

**3.3 IPC Handlers Migration**
- [ ] Update `ipcTaskHandlers.ts` to proxy to HTTP API
- [ ] Update `ipcEventHandlers.ts` to proxy to HTTP API
- [ ] Update `ipcCollectionHandlers.ts` to proxy to HTTP API
- [ ] Update `ipcCollectionItemHandlers.ts` to proxy to HTTP API
- [ ] Update `ipcTaskDependencyHandlers.ts` to proxy to HTTP API
- [ ] Update `ipcActivityHandlers.ts` to proxy to HTTP API
- [ ] Update `ipcVmRegistryHandlers.ts` to proxy to HTTP API
- [ ] Remove direct database access from main process
- [ ] Test all IPC handlers with HTTP backend

**3.4 Claude API Integration (Embedded AI Chat)**
- [ ] Install Anthropic SDK dependency
- [ ] Create `claude-client.ts` for Claude API
- [ ] Create `mcp-tools.ts` with tool definitions
- [ ] Implement `ipcChatHandlers.ts` for chat operations
- [ ] Add API key configuration
- [ ] Implement streaming response handling
- [ ] Add error handling for API failures
- [ ] Add usage tracking/logging

**3.5 UI Components (Embedded AI Chat)**
- [ ] Create `AIChatPanel.tsx` component
- [ ] Create `ChatMessage.tsx` component
- [ ] Create `ContextProvider.tsx` for state sharing
- [ ] Create `useChat.ts` hook
- [ ] Integrate chat panel into main layout
- [ ] Implement context awareness (selected task, current view)
- [ ] Add chat message history persistence
- [ ] Add chat UI styling
- [ ] Add loading states and error handling

**3.6 Visual UI Updates**
- [ ] Update task list to work with HTTP API
- [ ] Update dependency graph to work with HTTP API
- [ ] Update daily log view to work with HTTP API
- [ ] Update collections view to work with HTTP API
- [ ] Add real-time updates from chat actions
- [ ] Test all visual UI components

### Phase 4: VirtualBox MCP Server

**4.1 VirtualBox MCP Setup**
- [ ] Create `packages/virtualbox-mcp/` structure
- [ ] Setup package.json with dependencies (ssh2, MCP SDK)
- [ ] Create config structure
- [ ] Setup TypeScript configuration

**4.2 SSH Client & VBoxManage**
- [ ] Implement SSH client wrapper (`ssh-client.ts`)
- [ ] Implement VBoxManage command helpers (`vbox-commands.ts`)
- [ ] Add connection retry logic
- [ ] Add timeout handling
- [ ] Test SSH connection to VirtualBox host

**4.3 VM Controller**
- [ ] Implement VM creation (`vm-controller.ts`)
- [ ] Implement VM start/stop operations
- [ ] Implement VM deletion
- [ ] Implement VM status checks
- [ ] Implement VM resource configuration
- [ ] Add error handling for VBoxManage failures
- [ ] Add cleanup for partial VM creations

**4.4 Task Assignment**
- [ ] Implement task → VM routing logic
- [ ] Integrate with Journal MCP's VM registry
- [ ] Add role-based VM selection
- [ ] Add load balancing for multiple VMs

**4.5 MCP Tools**
- [ ] Implement `create_vm` tool
- [ ] Implement `create_vm_with_role` tool
- [ ] Implement `start_vm` tool
- [ ] Implement `stop_vm` tool
- [ ] Implement `delete_vm` tool
- [ ] Implement `list_vms` tool
- [ ] Implement `assign_task_to_vm` tool
- [ ] Add tool input validation
- [ ] Add structured error responses

**4.6 Testing & Integration**
- [ ] Unit tests for VM controller
- [ ] Integration tests with real VirtualBox
- [ ] Test with Journal MCP integration
- [ ] Document VM setup requirements

### Phase 5: Activity Reporter (Dev VM)

**5.1 Activity Reporter Setup**
- [ ] Create `packages/activity-reporter/` structure
- [ ] Setup package.json with dependencies (simple-git, chokidar)
- [ ] Create config structure
- [ ] Setup TypeScript configuration

**5.2 Watchers Implementation**
- [ ] Implement git commit watcher (`git-watcher.ts`)
- [ ] Implement file change watcher (`file-watcher.ts`)
- [ ] Implement IDE integration hooks (`ide-integration.ts`)
- [ ] Add file extension filtering
- [ ] Add debouncing for rapid changes

**5.3 HTTP Reporter**
- [ ] Implement HTTP reporter (`http-reporter.ts`)
- [ ] Add batching for efficiency
- [ ] Add retry logic with exponential backoff
- [ ] Add local buffering when Journal MCP unavailable
- [ ] Add graceful degradation

**5.4 Main Entry Point**
- [ ] Create main entry point (`index.ts`)
- [ ] Add configuration loading
- [ ] Add startup logging
- [ ] Handle graceful shutdown
- [ ] Add error handling

**5.5 Testing & Documentation**
- [ ] Test git watcher with real commits
- [ ] Test file watcher with real file changes
- [ ] Test HTTP reporting to Journal MCP
- [ ] Document installation on dev VM
- [ ] Create installation script

### Phase 6: VM Agent (Worker VMs)

**6.1 VM Agent Setup (Python)**
- [ ] Create `packages/vm-agent/` structure
- [ ] Setup `requirements.txt`
- [ ] Create config structure
- [ ] Setup logging

**6.2 Task Polling**
- [ ] Implement task poller (`task_poller.py`)
- [ ] Add polling loop with configurable interval
- [ ] Add VM name/ID registration
- [ ] Add error handling for network failures

**6.3 Task Handlers**
- [ ] Implement security task handlers (`security.py`)
  - [ ] nmap scanning
  - [ ] nikto web scanning
  - [ ] Basic vulnerability checks
- [ ] Implement build task handlers (`build.py`)
  - [ ] npm/yarn builds
  - [ ] docker builds
  - [ ] maven builds
- [ ] Implement test task handlers (`test.py`)
  - [ ] pytest execution
  - [ ] jest execution
  - [ ] Generic test runners

**6.4 Result Reporter**
- [ ] Implement result reporter (`result_reporter.py`)
- [ ] Add structured result formatting
- [ ] Add error result handling
- [ ] Add retry logic

**6.5 Main Agent**
- [ ] Create main agent (`agent.py`)
- [ ] Implement polling loop
- [ ] Add task routing to handlers
- [ ] Add error handling
- [ ] Add graceful shutdown

**6.6 Testing & Documentation**
- [ ] Test each task handler individually
- [ ] Test full agent with Journal MCP
- [ ] Document VM setup requirements
- [ ] Create installation script

### Phase 7: Testing & Quality Assurance

**7.1 Unit Tests**
- [ ] Database operations tests
- [ ] Graph algorithm tests
- [ ] Task dependency logic tests
- [ ] Activity parsing tests
- [ ] HTTP client tests
- [ ] MCP tool tests

**7.2 Integration Tests**
- [ ] Journal MCP HTTP API tests
- [ ] Journal MCP tools end-to-end tests
- [ ] Electron ↔ Journal MCP tests
- [ ] Activity Reporter → Journal MCP tests
- [ ] VM Agent → Journal MCP tests
- [ ] VirtualBox MCP ↔ Journal MCP tests

**7.3 End-to-End Tests**
- [ ] Complete workflow via Claude Desktop
- [ ] Complete workflow via Electron Visual UI
- [ ] Complete workflow via Electron AI Chat
- [ ] Multi-VM orchestration test
- [ ] Dependency chain execution test
- [ ] Activity-based suggestion test

**7.4 Performance Testing**
- [ ] Load test with 10,000+ tasks
- [ ] Stress test graph algorithms
- [ ] Measure MCP tool response times
- [ ] Measure HTTP API response times
- [ ] Test with 100+ activity events/hour

### Phase 8: Documentation

**8.1 API Documentation**
- [ ] Document all HTTP endpoints (`api-endpoints.md`)
- [ ] Document all MCP tools (`mcp-tools-spec.md`)
- [ ] Document graph algorithms (`graph-algorithms.md`)
- [ ] Add example requests/responses

**8.2 User Documentation**
- [ ] Write setup guide (`README.md`)
- [ ] Write migration guide (`migration-guide.md`)
- [ ] Document Claude Desktop configuration
- [ ] Document Electron app usage
- [ ] Document three-way interface usage
- [ ] Add troubleshooting guide

**8.3 Developer Documentation**
- [ ] Document monorepo structure
- [ ] Document development setup
- [ ] Document testing procedures
- [ ] Add contributing guidelines
- [ ] Document architecture decisions

### Phase 9: Configuration & Deployment

**9.1 Configuration Files**
- [ ] Create all `.example` config files
- [ ] Document all configuration options
- [ ] Add validation for configs
- [ ] Create default configs

**9.2 Setup Scripts**
- [ ] Create `setup-monorepo.sh`
- [ ] Create `setup-journal-mcp.sh`
- [ ] Create `install-dev-vm.sh`
- [ ] Create `backup-database.sh`
- [ ] Create `migrate-electron-data.sh`
- [ ] Create `test-e2e.sh`
- [ ] Test all scripts

**9.3 Claude Desktop Integration**
- [ ] Create Claude Desktop config template
- [ ] Document MCP server installation
- [ ] Test Journal MCP with Claude Desktop
- [ ] Test VirtualBox MCP with Claude Desktop
- [ ] Document multi-MCP setup

**9.4 Data Migration**
- [ ] Create migration script for existing Electron data
- [ ] Test migration with existing database
- [ ] Verify data integrity after migration
- [ ] Document migration process

### Phase 10: Polish & Launch

**10.1 Bug Fixes**
- [ ] Fix date serialization issues
- [ ] Fix any typos in API names (collectinId → collectionId, deleteColection → deleteCollection)
- [ ] Address all TODO/FIXME comments
- [ ] Fix edge cases discovered in testing

**10.2 Error Handling**
- [ ] Add comprehensive error handling to all layers
- [ ] Add user-friendly error messages
- [ ] Add error logging
- [ ] Add error recovery mechanisms

**10.3 Security Review**
- [ ] Review HTTP API security
- [ ] Review SSH key permissions
- [ ] Review VM isolation
- [ ] Add rate limiting if needed
- [ ] Document security considerations

**10.4 Final Testing**
- [ ] Use system for real work for 1+ week
- [ ] Fix usability issues
- [ ] Optimize performance bottlenecks
- [ ] Final end-to-end test

**10.5 Launch Preparation**
- [ ] Write comprehensive README
- [ ] Create demo video/screenshots
- [ ] Write announcement post
- [ ] Prepare example workflows
- [ ] Tag v1.0.0 release

---

## Progress Tracking

**Overall Progress:**
- **Foundation:** 0/20 tasks complete (0%)
- **Journal MCP:** 0/50+ tasks complete (0%)
- **Electron App:** 0/30+ tasks complete (0%)
- **VirtualBox MCP:** 0/25+ tasks complete (0%)
- **Activity Reporter:** 0/15+ tasks complete (0%)
- **VM Agent:** 0/20+ tasks complete (0%)
- **Testing:** 0/20+ tasks complete (0%)
- **Documentation:** 1/15+ tasks complete (~7%)
- **Deployment:** 0/15+ tasks complete (0%)
- **Polish:** 0/15+ tasks complete (0%)

**Next Immediate Tasks:**
1. Fix typos in existing codebase (collectinId, deleteColection)
2. Fix date serialization in database layer
3. Add error handling and validation to database managers
4. Create monorepo structure and move code into packages
5. Implement graph algorithms (cycle detection first)