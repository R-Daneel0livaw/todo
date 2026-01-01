import {
  Task,
  Event,
  Collection,
  CollectionItem,
  ActivityType,
  VmRole,
  VmStatus
} from '@awesome-dev-journal/shared'

const API_BASE_URL = process.env.JOURNAL_API_URL || 'http://localhost:3333/api'

// Helper function for making HTTP requests
async function fetchJSON<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// ============================================================================
// TASK ENDPOINTS
// ============================================================================

export async function getAllTasks(): Promise<Task[]> {
  return fetchJSON<Task[]>('/tasks')
}

export async function getTask(taskId: number): Promise<Task> {
  return fetchJSON<Task>(`/tasks/${taskId}`)
}

export async function getTasksByCollectionId(collectionId: number): Promise<Task[]> {
  return fetchJSON<Task[]>(`/tasks/collection/${collectionId}`)
}

export async function createTask(taskData: Task): Promise<{ id: number; message: string }> {
  return fetchJSON('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  })
}

export async function updateTask(
  taskId: number,
  taskData: Partial<Task>
): Promise<{ message: string }> {
  return fetchJSON(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  })
}

export async function deleteTask(taskId: number): Promise<{ message: string }> {
  return fetchJSON(`/tasks/${taskId}`, {
    method: 'DELETE'
  })
}

export async function completeTask(taskId: number): Promise<{ message: string }> {
  return fetchJSON(`/tasks/${taskId}/complete`, {
    method: 'POST'
  })
}

export async function cancelTask(taskId: number): Promise<{ message: string }> {
  return fetchJSON(`/tasks/${taskId}/cancel`, {
    method: 'POST'
  })
}

export async function migrateTask(
  taskId: number,
  toTaskId: number
): Promise<{ message: string }> {
  return fetchJSON(`/tasks/${taskId}/migrate`, {
    method: 'POST',
    body: JSON.stringify({ toTaskId })
  })
}

// ============================================================================
// EVENT ENDPOINTS
// ============================================================================

export async function getAllEvents(): Promise<Event[]> {
  return fetchJSON<Event[]>('/events')
}

export async function getEvent(eventId: number): Promise<Event> {
  return fetchJSON<Event>(`/events/${eventId}`)
}

export async function getEventsByCollectionId(collectionId: number): Promise<Event[]> {
  return fetchJSON<Event[]>(`/events/collection/${collectionId}`)
}

export async function createEvent(eventData: Event): Promise<{ id: number; message: string }> {
  return fetchJSON('/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  })
}

export async function updateEvent(
  eventId: number,
  eventData: Partial<Event>
): Promise<{ message: string }> {
  return fetchJSON(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  })
}

export async function deleteEvent(eventId: number): Promise<{ message: string }> {
  return fetchJSON(`/events/${eventId}`, {
    method: 'DELETE'
  })
}

export async function completeEvent(eventId: number): Promise<{ message: string }> {
  return fetchJSON(`/events/${eventId}/complete`, {
    method: 'POST'
  })
}

export async function cancelEvent(eventId: number): Promise<{ message: string }> {
  return fetchJSON(`/events/${eventId}/cancel`, {
    method: 'POST'
  })
}

// ============================================================================
// COLLECTION ENDPOINTS
// ============================================================================

export async function getAllCollections(): Promise<Collection[]> {
  return fetchJSON<Collection[]>('/collections')
}

export async function getCollection(collectionId: number): Promise<Collection> {
  return fetchJSON<Collection>(`/collections/${collectionId}`)
}

export async function getCollectionsByType(type: string): Promise<Collection[]> {
  return fetchJSON<Collection[]>(`/collections/type/${type}`)
}

export async function createCollection(
  collectionData: Collection
): Promise<{ id: number; message: string }> {
  return fetchJSON('/collections', {
    method: 'POST',
    body: JSON.stringify(collectionData)
  })
}

export async function updateCollection(
  collectionId: number,
  collectionData: Partial<Collection>
): Promise<{ message: string }> {
  return fetchJSON(`/collections/${collectionId}`, {
    method: 'PUT',
    body: JSON.stringify(collectionData)
  })
}

export async function deleteCollection(collectionId: number): Promise<{ message: string }> {
  return fetchJSON(`/collections/${collectionId}`, {
    method: 'DELETE'
  })
}

export async function archiveCollection(collectionId: number): Promise<{ message: string }> {
  return fetchJSON(`/collections/${collectionId}/archive`, {
    method: 'POST'
  })
}

// ============================================================================
// COLLECTION ITEM ENDPOINTS
// ============================================================================

export async function getCollectionItems(collectionId: number): Promise<CollectionItem[]> {
  return fetchJSON<CollectionItem[]>(`/collections/${collectionId}/items`)
}

export async function addItemToCollection(
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): Promise<{ id: number; message: string }> {
  return fetchJSON(`/collections/${collectionId}/items`, {
    method: 'POST',
    body: JSON.stringify({ itemId, itemType })
  })
}

export async function removeItemFromCollection(
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): Promise<{ message: string }> {
  return fetchJSON(`/collections/${collectionId}/items`, {
    method: 'DELETE',
    body: JSON.stringify({ itemId, itemType })
  })
}

// ============================================================================
// DEPENDENCY ENDPOINTS
// ============================================================================

export async function getTaskDependencies(taskId: number): Promise<Task[]> {
  return fetchJSON<Task[]>(`/dependencies/task/${taskId}`)
}

export async function getAllTaskDependencies(taskId: number): Promise<Task[]> {
  return fetchJSON<Task[]>(`/dependencies/task/${taskId}/all`)
}

export async function getDependentTasks(taskId: number): Promise<Task[]> {
  return fetchJSON<Task[]>(`/dependencies/task/${taskId}/dependent`)
}

export async function getUnblockedTasks(): Promise<Task[]> {
  return fetchJSON<Task[]>('/dependencies/unblocked')
}

export async function getBlockedTasks(): Promise<Task[]> {
  return fetchJSON<Task[]>('/dependencies/blocked')
}

export async function getCriticalPath(): Promise<Task[]> {
  return fetchJSON<Task[]>('/dependencies/critical-path')
}

export async function addTaskDependency(
  taskId: number,
  dependsOnTaskId: number,
  dependencyType?: 'blocks' | 'related' | 'suggested',
  createdBy?: 'user' | 'ai_suggested'
): Promise<{ id: number; message: string }> {
  return fetchJSON('/dependencies', {
    method: 'POST',
    body: JSON.stringify({ taskId, dependsOnTaskId, dependencyType, createdBy })
  })
}

export async function removeTaskDependency(dependencyId: number): Promise<{ message: string }> {
  return fetchJSON(`/dependencies/${dependencyId}`, {
    method: 'DELETE'
  })
}

// ============================================================================
// ACTIVITY ENDPOINTS
// ============================================================================

export async function getActivitySummary(options?: {
  minutes?: number
  hours?: number
  days?: number
}): Promise<any[]> {
  const params = new URLSearchParams()
  if (options?.minutes) params.append('minutes', options.minutes.toString())
  if (options?.hours) params.append('hours', options.hours.toString())
  if (options?.days) params.append('days', options.days.toString())

  const query = params.toString() ? `?${params}` : ''
  return fetchJSON<any[]>(`/activity${query}`)
}

export async function getActivityByTask(taskId: number): Promise<any[]> {
  return fetchJSON<any[]>(`/activity/task/${taskId}`)
}

export async function getActivityByEvent(eventId: number): Promise<any[]> {
  return fetchJSON<any[]>(`/activity/event/${eventId}`)
}

export async function getRecentActivityByType(
  type: ActivityType,
  limit?: number
): Promise<any[]> {
  const query = limit ? `?limit=${limit}` : ''
  return fetchJSON<any[]>(`/activity/type/${type}${query}`)
}

export async function suggestTaskCompletion(minutes?: number): Promise<
  Array<{
    task: Task
    confidence: number
    reason: string
  }>
> {
  const query = minutes ? `?minutes=${minutes}` : ''
  return fetchJSON(`/activity/suggestions${query}`)
}

export async function addActivity(
  type: ActivityType,
  source: string,
  data: Record<string, any>,
  relatedTaskId?: number,
  relatedEventId?: number
): Promise<{ id: number; message: string }> {
  return fetchJSON('/activity', {
    method: 'POST',
    body: JSON.stringify({ type, source, data, relatedTaskId, relatedEventId })
  })
}

export async function deleteOldActivity(daysToKeep?: number): Promise<{ message: string }> {
  const query = daysToKeep ? `?days=${daysToKeep}` : ''
  return fetchJSON(`/activity/cleanup${query}`, {
    method: 'DELETE'
  })
}

// ============================================================================
// VM ENDPOINTS
// ============================================================================

export async function getAllVms(role?: VmRole): Promise<any[]> {
  const query = role ? `?role=${role}` : ''
  return fetchJSON<any[]>(`/vms${query}`)
}

export async function getVm(vmId: number): Promise<any> {
  return fetchJSON<any>(`/vms/${vmId}`)
}

export async function getVmByName(name: string): Promise<any> {
  return fetchJSON<any>(`/vms/name/${name}`)
}

export async function getRunningVms(): Promise<any[]> {
  return fetchJSON<any[]>('/vms/status/running')
}

export async function getVmsByRole(role: VmRole): Promise<any[]> {
  return fetchJSON<any[]>(`/vms/role/${role}`)
}

export async function registerVm(
  name: string,
  role: VmRole,
  memoryMb?: number,
  cpus?: number,
  diskSizeMb?: number
): Promise<{ id: number; message: string }> {
  return fetchJSON('/vms', {
    method: 'POST',
    body: JSON.stringify({ name, role, memoryMb, cpus, diskSizeMb })
  })
}

export async function updateVmStatus(
  vmId: number,
  status: VmStatus
): Promise<{ message: string }> {
  return fetchJSON(`/vms/${vmId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
}

export async function assignTaskToVm(vmId: number, taskId: number): Promise<{ message: string }> {
  return fetchJSON(`/vms/${vmId}/assign-task`, {
    method: 'POST',
    body: JSON.stringify({ taskId })
  })
}

export async function deleteVm(vmId: number): Promise<{ message: string }> {
  return fetchJSON(`/vms/${vmId}`, {
    method: 'DELETE'
  })
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function checkHealth(): Promise<{
  status: string
  timestamp: string
  service: string
}> {
  return fetchJSON('/health')
}
