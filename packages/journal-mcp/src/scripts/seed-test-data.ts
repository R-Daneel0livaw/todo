import * as TaskManager from '../database/TaskManager.js'
import * as CollectionManager from '../database/CollectionManager.js'
import * as EventManager from '../database/EventManager.js'
import * as TaskDependencyManager from '../database/TaskDependencyManager.js'
import * as CollectionItemManager from '../database/CollectionItemManager.js'
import * as ActivityManager from '../database/ActivityManager.js'
import * as VmRegistryManager from '../database/VmRegistryManager.js'
import db from '../database/sqlite.js'

/**
 * Clear all test data from the database
 */
export function clearAllData() {
  console.log('🗑️  Clearing all data...')

  // Delete in order to respect foreign key constraints
  db.prepare('DELETE FROM task_dependencies').run()
  db.prepare('DELETE FROM collectionItems').run()
  db.prepare('DELETE FROM activity').run()
  db.prepare('DELETE FROM vm_registry').run()
  db.prepare('DELETE FROM tasks').run()
  db.prepare('DELETE FROM events').run()
  db.prepare('DELETE FROM collections').run()

  console.log('✅ All data cleared')
}

/**
 * Seed the database with realistic test data
 */
export function seedTestData() {
  console.log('🌱 Seeding test data...')

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // 1. Create Collections
  console.log('  📁 Creating collections...')

  const todayLog = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: `Daily Log - ${now.toISOString().split('T')[0]}`,
    description: "Today's tasks and events",
    type: 'DAILY',
    subType: 'LOG',
    createDate: now,
    startDate: now,
    metadata: { date: now.toISOString().split('T')[0] }
  })

  const yesterdayLog = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: `Daily Log - ${yesterday.toISOString().split('T')[0]}`,
    description: "Yesterday's tasks and events",
    type: 'DAILY',
    subType: 'LOG',
    createDate: yesterday,
    startDate: yesterday,
    metadata: { date: yesterday.toISOString().split('T')[0] }
  })

  const authProject = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'OAuth Implementation',
    description: 'Add OAuth 2.0 authentication to the app',
    longDescription: 'Full OAuth implementation with Google, GitHub, and Microsoft providers',
    type: 'PROJECT',
    subType: 'TASK',
    createDate: lastWeek,
    startDate: lastWeek
  })

  const apiProject = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'REST API Refactor',
    description: 'Modernize API endpoints and add versioning',
    type: 'PROJECT',
    subType: 'TASK',
    createDate: lastWeek,
    startDate: lastWeek
  })

  const monthlyPlan = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'January 2026 Plan',
    description: 'Monthly goals and objectives',
    type: 'MONTHLY',
    subType: 'PLAN',
    createDate: new Date('2026-01-01'),
    startDate: new Date('2026-01-01')
  })

  console.log(`    ✓ Created 5 collections`)

  // 2. Create Tasks
  console.log('  ✅ Creating tasks...')

  // Today's tasks
  const task1 = TaskManager.addTask({
    id: 0,
    title: 'Review pull requests',
    description: 'Review open PRs from the team',
    topic: 'code-review',
    status: 'IN_PROGRESS',
    createDate: now,
    startDate: now
  })
  CollectionItemManager.addToCollection(todayLog.id, task1, 'Task')

  const task2 = TaskManager.addTask({
    id: 0,
    title: 'Deploy auth service to staging',
    description: 'Deploy the OAuth service to staging environment for testing',
    topic: 'deployment',
    status: 'CREATED',
    createDate: now
  })
  CollectionItemManager.addToCollection(todayLog.id, task2, 'Task')

  const task3 = TaskManager.addTask({
    id: 0,
    title: 'Write unit tests for API endpoints',
    description: 'Add test coverage for new REST endpoints',
    topic: 'testing',
    status: 'CREATED',
    createDate: now
  })
  CollectionItemManager.addToCollection(todayLog.id, task3, 'Task')

  // Yesterday's tasks
  const task4 = TaskManager.addTask({
    id: 0,
    title: 'Fix login bug',
    description: 'Users unable to login with special characters in password',
    topic: 'bug-fix',
    status: 'FINISHED',
    createDate: yesterday,
    startDate: yesterday,
    endDate: yesterday
  })
  CollectionItemManager.addToCollection(yesterdayLog.id, task4, 'Task')

  const task5 = TaskManager.addTask({
    id: 0,
    title: 'Update documentation',
    description: 'Update API documentation for new endpoints',
    topic: 'documentation',
    status: 'MIGRATED',
    createDate: yesterday
  })
  CollectionItemManager.addToCollection(yesterdayLog.id, task5, 'Task')

  // OAuth Project tasks
  const googleOAuth = TaskManager.addTask({
    id: 0,
    title: 'Implement OAuth Google provider',
    description: 'Add Google OAuth 2.0 integration',
    topic: 'oauth',
    status: 'FINISHED',
    createDate: lastWeek,
    startDate: lastWeek,
    endDate: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000)
  })
  CollectionItemManager.addToCollection(authProject.id, googleOAuth, 'Task')

  const githubOAuth = TaskManager.addTask({
    id: 0,
    title: 'Implement OAuth GitHub provider',
    description: 'Add GitHub OAuth integration',
    topic: 'oauth',
    status: 'IN_PROGRESS',
    createDate: lastWeek,
    startDate: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000)
  })
  CollectionItemManager.addToCollection(authProject.id, githubOAuth, 'Task')

  const tokenRefresh = TaskManager.addTask({
    id: 0,
    title: 'Add OAuth token refresh logic',
    description: 'Implement automatic token refresh for expired tokens',
    topic: 'oauth',
    status: 'CREATED',
    createDate: lastWeek
  })
  CollectionItemManager.addToCollection(authProject.id, tokenRefresh, 'Task')

  const oauthTests = TaskManager.addTask({
    id: 0,
    title: 'Write OAuth integration tests',
    description: 'End-to-end tests for OAuth flows',
    topic: 'testing',
    status: 'CREATED',
    createDate: lastWeek
  })
  CollectionItemManager.addToCollection(authProject.id, oauthTests, 'Task')

  // API Project tasks
  const apiDesign = TaskManager.addTask({
    id: 0,
    title: 'Design API versioning strategy',
    description: 'Define how we will handle API versions (URL vs header)',
    topic: 'architecture',
    status: 'FINISHED',
    createDate: lastWeek,
    endDate: lastWeek
  })
  CollectionItemManager.addToCollection(apiProject.id, apiDesign, 'Task')

  const apiMigrate = TaskManager.addTask({
    id: 0,
    title: 'Migrate endpoints to v2',
    description: 'Update all endpoints to use new v2 structure',
    topic: 'refactoring',
    status: 'IN_PROGRESS',
    createDate: lastWeek,
    startDate: new Date(lastWeek.getTime() + 1 * 24 * 60 * 60 * 1000)
  })
  CollectionItemManager.addToCollection(apiProject.id, apiMigrate, 'Task')

  const apiClient = TaskManager.addTask({
    id: 0,
    title: 'Update API client library',
    description: 'Update SDK to support v2 endpoints',
    topic: 'sdk',
    status: 'CREATED',
    createDate: lastWeek
  })
  CollectionItemManager.addToCollection(apiProject.id, apiClient, 'Task')

  console.log(`    ✓ Created 12 tasks`)

  // 3. Create Task Dependencies
  console.log('  🔗 Creating task dependencies...')

  // OAuth dependencies
  TaskDependencyManager.addTaskDependency(githubOAuth, googleOAuth, 'blocks', 'user')
  TaskDependencyManager.addTaskDependency(tokenRefresh, googleOAuth, 'blocks', 'user')
  TaskDependencyManager.addTaskDependency(oauthTests, githubOAuth, 'blocks', 'user')
  TaskDependencyManager.addTaskDependency(oauthTests, tokenRefresh, 'blocks', 'user')

  // API dependencies
  TaskDependencyManager.addTaskDependency(apiMigrate, apiDesign, 'blocks', 'user')
  TaskDependencyManager.addTaskDependency(apiClient, apiMigrate, 'blocks', 'user')

  console.log(`    ✓ Created 6 dependencies`)

  // 4. Create Events
  console.log('  📅 Creating events...')

  const event1 = EventManager.addEvent({
    id: 0,
    title: 'Team standup',
    description: 'Daily team sync',
    location: 'Zoom',
    status: 'FINISHED',
    createDate: now,
    scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
    startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15)
  })
  CollectionItemManager.addToCollection(todayLog.id, event1, 'Event')

  const event2 = EventManager.addEvent({
    id: 0,
    title: 'API design review',
    description: 'Review new API design with architecture team',
    location: 'Conference Room A',
    status: 'CREATED',
    createDate: now,
    scheduledDate: tomorrow
  })
  CollectionItemManager.addToCollection(todayLog.id, event2, 'Event')

  const event3 = EventManager.addEvent({
    id: 0,
    title: 'OAuth security audit',
    description: 'Security team review of OAuth implementation',
    location: 'Virtual',
    status: 'CREATED',
    createDate: lastWeek,
    scheduledDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  })
  CollectionItemManager.addToCollection(authProject.id, event3, 'Event')

  console.log(`    ✓ Created 3 events`)

  // 5. Create Activity entries
  console.log('  📊 Creating activity entries...')

  ActivityManager.addActivity(
    'git_commit',
    'github',
    { message: 'feat: add Google OAuth integration', sha: 'abc123', author: 'dev@example.com' },
    googleOAuth
  )

  ActivityManager.addActivity(
    'git_commit',
    'github',
    { message: 'fix: handle OAuth callback errors', sha: 'def456', author: 'dev@example.com' },
    githubOAuth
  )

  ActivityManager.addActivity('build', 'ci/cd', { status: 'success', duration: 142, branch: 'main' })

  ActivityManager.addActivity(
    'test_run',
    'jest',
    { passed: 124, failed: 0, skipped: 3, duration: 8.5 },
    googleOAuth
  )

  console.log(`    ✓ Created 4 activity entries`)

  // 6. Create VM registry entries
  console.log('  🖥️  Creating VM registry entries...')

  VmRegistryManager.registerVm('security-vm-01', 'security', 4096, 2, 50000)
  VmRegistryManager.registerVm('build-vm-01', 'build', 8192, 4, 100000)
  const testVmId = VmRegistryManager.registerVm('test-vm-01', 'test', 4096, 2, 75000)

  VmRegistryManager.updateVmStatus(testVmId, 'running')
  VmRegistryManager.assignTaskToVm(testVmId, oauthTests)

  console.log(`    ✓ Created 3 VMs`)

  console.log('\n✅ Test data seeding complete!')
  console.log('\nSummary:')
  console.log(`  • 5 Collections (2 daily logs, 2 projects, 1 monthly plan)`)
  console.log(`  • 12 Tasks (various states and topics)`)
  console.log(`  • 6 Task Dependencies`)
  console.log(`  • 3 Events`)
  console.log(`  • 4 Activity Entries`)
  console.log(`  • 3 VMs`)
}

// CLI interface
const command = process.argv[2]

if (command === 'clear') {
  clearAllData()
} else if (command === 'seed') {
  seedTestData()
} else if (command === 'reset') {
  clearAllData()
  seedTestData()
} else {
  console.log('Usage:')
  console.log('  npm run db:clear  - Clear all data')
  console.log('  npm run db:seed   - Seed test data')
  console.log('  npm run db:reset  - Clear and seed')
}
