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
  db.prepare('DELETE FROM item_migration_history').run()
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
  const feb1 = new Date('2026-02-01T09:00:00')
  const feb1End = new Date('2026-02-01T17:00:00')

  // 1. Create Collections
  console.log('  📁 Creating collections...')

  // Task List (DEFAULT/TASK)
  const taskList = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Task List',
    description: 'Main Task List',
    longDescription: 'All created Tasks will be available in the Main Task List.',
    type: 'DEFAULT',
    subType: 'TASK',
    createDate: now,
    startDate: now
  })

  // Event List (DEFAULT/EVENT)
  const eventList = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Event List',
    description: 'Main Event List',
    longDescription: 'All created Events will be available in the Main Event List.',
    type: 'DEFAULT',
    subType: 'EVENT',
    createDate: now,
    startDate: now
  })

  // Eric's Task List (CUSTOM/TASK)
  const ericsTaskList = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: "Eric's Task List",
    description: "Eric's Task List",
    type: 'CUSTOM',
    subType: 'TASK',
    createDate: now,
    startDate: now
  })

  // Birthdays (CUSTOM/EVENT)
  const birthdays = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Birthdays',
    description: 'Important Birthday List',
    type: 'CUSTOM',
    subType: 'EVENT',
    createDate: now,
    startDate: now
  })

  // Project TODO (PROJECT, no subType)
  const projectTodo = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Project TODO',
    description: 'TODO Project List',
    longDescription: 'All items relating to the TODO Project.',
    type: 'PROJECT',
    createDate: now,
    startDate: now
  })

  // Daily Plan 2/1 (DAILY/PLAN)
  const dailyPlan = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Daily Plan 2/1',
    description: 'Daily Plan View for 2/1',
    type: 'DAILY',
    subType: 'PLAN',
    createDate: feb1,
    startDate: feb1
  })

  // Daily Log 2/1 (DAILY/LOG)
  const dailyLog = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Daily Log 2/1',
    description: 'Daily Log View for 2/1',
    type: 'DAILY',
    subType: 'LOG',
    createDate: feb1,
    startDate: feb1
  })

  // Daily 2/1 (DAILY, no subType) - meta-collection
  const daily = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Daily 2/1',
    description: 'Daily View for 2/1',
    type: 'DAILY',
    createDate: feb1,
    startDate: feb1
  })

  // February Plan (MONTHLY/PLAN)
  const februaryPlan = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'February Plan',
    description: 'Monthly Plan View for February',
    type: 'MONTHLY',
    subType: 'PLAN',
    createDate: new Date('2026-02-01'),
    startDate: new Date('2026-02-01')
  })

  // Quarter 1 Plan (QUARTERLY/PLAN)
  const q1Plan = CollectionManager.addAndRetrieveCollection({
    id: 0,
    title: 'Quarter 1 Plan',
    description: 'Quarter 1 Plan View',
    type: 'QUARTERLY',
    subType: 'PLAN',
    createDate: new Date('2026-01-01'),
    startDate: new Date('2026-01-01')
  })

  console.log(`    ✓ Created 10 collections`)

  // 2. Create Tasks
  console.log('  ✅ Creating tasks...')

  // Tasks for Task List
  const task1 = TaskManager.addTask({
    id: 0,
    title: 'Review pull requests',
    description: 'Review open PRs from the team',
    topic: 'code-review',
    status: 'IN_PROGRESS',
    createDate: now,
    startDate: now
  })
  CollectionItemManager.addToCollection(taskList.id, task1, 'Task')

  const task2 = TaskManager.addTask({
    id: 0,
    title: 'Update documentation',
    description: 'Update API documentation for new endpoints',
    topic: 'documentation',
    status: 'CREATED',
    createDate: now
  })
  CollectionItemManager.addToCollection(taskList.id, task2, 'Task')

  // Tasks for Eric's Task List
  const task3 = TaskManager.addTask({
    id: 0,
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, coffee',
    topic: 'personal',
    status: 'CREATED',
    createDate: now
  })
  CollectionItemManager.addToCollection(ericsTaskList.id, task3, 'Task')

  const task4 = TaskManager.addTask({
    id: 0,
    title: 'Schedule dentist appointment',
    description: 'Regular checkup',
    topic: 'health',
    status: 'CREATED',
    createDate: now
  })
  CollectionItemManager.addToCollection(ericsTaskList.id, task4, 'Task')

  // Tasks for Project TODO
  const task5 = TaskManager.addTask({
    id: 0,
    title: 'Implement OAuth authentication',
    description: 'Add OAuth 2.0 support for Google and GitHub',
    topic: 'feature',
    status: 'IN_PROGRESS',
    createDate: now,
    startDate: now
  })
  CollectionItemManager.addToCollection(projectTodo.id, task5, 'Task')

  const task6 = TaskManager.addTask({
    id: 0,
    title: 'Write unit tests for API',
    description: 'Add test coverage for REST endpoints',
    topic: 'testing',
    status: 'CREATED',
    createDate: now
  })
  CollectionItemManager.addToCollection(projectTodo.id, task6, 'Task')

  const task7 = TaskManager.addTask({
    id: 0,
    title: 'Fix login bug',
    description: 'Users unable to login with special characters',
    topic: 'bug-fix',
    status: 'FINISHED',
    createDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    endDate: now
  })
  CollectionItemManager.addToCollection(projectTodo.id, task7, 'Task')

  // Tasks for Daily Plan 2/1
  const task8 = TaskManager.addTask({
    id: 0,
    title: 'Morning standup prep',
    description: 'Prepare updates for team standup',
    topic: 'meeting',
    status: 'CREATED',
    createDate: feb1
  })
  CollectionItemManager.addToCollection(dailyPlan.id, task8, 'Task')

  const task9 = TaskManager.addTask({
    id: 0,
    title: 'Code review session',
    description: 'Review PRs before lunch',
    topic: 'code-review',
    status: 'CREATED',
    createDate: feb1
  })
  CollectionItemManager.addToCollection(dailyPlan.id, task9, 'Task')

  // Tasks for Daily Log 2/1
  const task10 = TaskManager.addTask({
    id: 0,
    title: 'Completed OAuth integration',
    description: 'Finished Google OAuth provider',
    topic: 'feature',
    status: 'FINISHED',
    createDate: feb1,
    startDate: feb1,
    endDate: feb1End
  })
  CollectionItemManager.addToCollection(dailyLog.id, task10, 'Task')

  // Tasks for February Plan
  const task11 = TaskManager.addTask({
    id: 0,
    title: 'Launch v2.0 of TODO app',
    description: 'Complete all features and deploy to production',
    topic: 'milestone',
    status: 'IN_PROGRESS',
    createDate: new Date('2026-02-01'),
    startDate: new Date('2026-02-01')
  })
  CollectionItemManager.addToCollection(februaryPlan.id, task11, 'Task')

  // Tasks for Q1 Plan
  const task12 = TaskManager.addTask({
    id: 0,
    title: 'Reach 1000 users',
    description: 'Marketing and growth initiatives',
    topic: 'growth',
    status: 'IN_PROGRESS',
    createDate: new Date('2026-01-01'),
    startDate: new Date('2026-01-01')
  })
  CollectionItemManager.addToCollection(q1Plan.id, task12, 'Task')

  console.log(`    ✓ Created 12 tasks`)

  // 3. Create Events
  console.log('  📅 Creating events...')

  // Events for Event List
  const event1 = EventManager.addEvent({
    id: 0,
    title: 'Team standup',
    description: 'Daily team sync',
    location: 'Zoom',
    status: 'CREATED',
    createDate: now,
    scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0)
  })
  CollectionItemManager.addToCollection(eventList.id, event1, 'Event')

  const event2 = EventManager.addEvent({
    id: 0,
    title: 'Sprint planning',
    description: 'Plan next sprint',
    location: 'Conference Room A',
    status: 'CREATED',
    createDate: now,
    scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14, 0)
  })
  CollectionItemManager.addToCollection(eventList.id, event2, 'Event')

  // Events for Birthdays
  const event3 = EventManager.addEvent({
    id: 0,
    title: "Mom's Birthday",
    description: 'Buy gift and call',
    location: 'Home',
    status: 'CREATED',
    createDate: now,
    scheduledDate: new Date('2026-03-15T00:00:00')
  })
  CollectionItemManager.addToCollection(birthdays.id, event3, 'Event')

  const event4 = EventManager.addEvent({
    id: 0,
    title: "Sarah's Birthday",
    description: 'Dinner party',
    location: 'Downtown Restaurant',
    status: 'CREATED',
    createDate: now,
    scheduledDate: new Date('2026-04-22T18:00:00')
  })
  CollectionItemManager.addToCollection(birthdays.id, event4, 'Event')

  // Events for Daily Plan 2/1
  const event5 = EventManager.addEvent({
    id: 0,
    title: 'Architecture review',
    description: 'Review system design with team',
    location: 'Virtual',
    status: 'CREATED',
    createDate: feb1,
    scheduledDate: new Date('2026-02-01T10:00:00')
  })
  CollectionItemManager.addToCollection(dailyPlan.id, event5, 'Event')

  // Events for Daily Log 2/1
  const event6 = EventManager.addEvent({
    id: 0,
    title: 'Client meeting',
    description: 'Demo new features',
    location: 'Office',
    status: 'FINISHED',
    createDate: feb1,
    scheduledDate: new Date('2026-02-01T14:00:00'),
    startDate: new Date('2026-02-01T14:00:00'),
    endDate: new Date('2026-02-01T15:00:00')
  })
  CollectionItemManager.addToCollection(dailyLog.id, event6, 'Event')

  // Events for February Plan
  const event7 = EventManager.addEvent({
    id: 0,
    title: 'Product launch event',
    description: 'Launch v2.0 publicly',
    location: 'Virtual Event',
    status: 'CREATED',
    createDate: new Date('2026-02-01'),
    scheduledDate: new Date('2026-02-28T10:00:00')
  })
  CollectionItemManager.addToCollection(februaryPlan.id, event7, 'Event')

  // Events for Q1 Plan
  const event8 = EventManager.addEvent({
    id: 0,
    title: 'Q1 Business Review',
    description: 'Review quarterly objectives',
    location: 'Board Room',
    status: 'CREATED',
    createDate: new Date('2026-01-01'),
    scheduledDate: new Date('2026-03-31T15:00:00')
  })
  CollectionItemManager.addToCollection(q1Plan.id, event8, 'Event')

  console.log(`    ✓ Created 8 events`)

  // 4. Add Collections to Daily 2/1 meta-collection
  console.log('  🗂️  Creating meta-collection items...')
  CollectionItemManager.addToCollection(daily.id, dailyPlan.id, 'Collection')
  CollectionItemManager.addToCollection(daily.id, dailyLog.id, 'Collection')
  console.log(`    ✓ Added 2 collections to Daily 2/1`)

  // 5. Create Task Dependencies
  console.log('  🔗 Creating task dependencies...')
  TaskDependencyManager.addTaskDependency(task6, task5, 'blocks', 'user')
  TaskDependencyManager.addTaskDependency(task11, task5, 'blocks', 'user')
  TaskDependencyManager.addTaskDependency(task11, task6, 'blocks', 'user')
  console.log(`    ✓ Created 3 dependencies`)

  // 6. Create Activity entries
  console.log('  📊 Creating activity entries...')

  ActivityManager.addActivity(
    'git_commit',
    'github',
    { message: 'feat: add OAuth Google integration', sha: 'abc123', author: 'eric@example.com' },
    task5
  )

  ActivityManager.addActivity(
    'git_commit',
    'github',
    { message: 'fix: handle special characters in login', sha: 'def456', author: 'eric@example.com' },
    task7
  )

  ActivityManager.addActivity('build', 'ci/cd', { status: 'success', duration: 142, branch: 'main' })

  ActivityManager.addActivity(
    'test_run',
    'jest',
    { passed: 156, failed: 0, skipped: 4, duration: 12.3 },
    task7
  )

  console.log(`    ✓ Created 4 activity entries`)

  // 7. Create VM registry entries
  console.log('  🖥️  Creating VM registry entries...')

  VmRegistryManager.registerVm('security-vm-01', 'security', 4096, 2, 50000)
  VmRegistryManager.registerVm('build-vm-01', 'build', 8192, 4, 100000)
  const testVmId = VmRegistryManager.registerVm('test-vm-01', 'test', 4096, 2, 75000)

  VmRegistryManager.updateVmStatus(testVmId, 'running')
  VmRegistryManager.assignTaskToVm(testVmId, task6)

  console.log(`    ✓ Created 3 VMs`)

  // 8. Create migration history examples
  console.log('  📋 Creating task migration history...')

  // Migrate task8 from Daily Plan to Daily Log (representing completed planned work)
  TaskManager.migrateTaskToCollection(
    task8,
    dailyLog.id,
    'user',
    'Completed during the day, moving to log'
  )

  // Migrate task3 (groceries) from Eric's list to Daily Log (completed personal task)
  TaskManager.migrateTaskToCollection(task3, dailyLog.id, 'user', 'Completed errands')

  // Migrate it again to show multiple migrations
  TaskManager.migrateTaskToCollection(task3, taskList.id, 'system', 'Archiving completed task to main list')

  console.log(`    ✓ Created migration history (3 migrations for 2 tasks)`)

  console.log('\n✅ Test data seeding complete!')
  console.log('\nSummary:')
  console.log(`  • 10 Collections`)
  console.log(`    - 2 DEFAULT (Task List, Event List)`)
  console.log(`    - 2 CUSTOM (Eric's Task List, Birthdays)`)
  console.log(`    - 1 PROJECT (Project TODO)`)
  console.log(`    - 3 DAILY (Daily 2/1 with Plan and Log sub-collections)`)
  console.log(`    - 1 MONTHLY (February Plan)`)
  console.log(`    - 1 QUARTERLY (Quarter 1 Plan)`)
  console.log(`  • 12 Tasks (various statuses and topics)`)
  console.log(`  • 8 Events (meetings, birthdays, milestones)`)
  console.log(`  • 3 Task Dependencies`)
  console.log(`  • 4 Activity Entries`)
  console.log(`  • 3 VMs`)
  console.log(`  • 3 Task Migrations (demonstrating migration history tracking)`)
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
