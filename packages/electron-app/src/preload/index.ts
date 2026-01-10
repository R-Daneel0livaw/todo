import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  ActivityApi,
  ActivityType,
  CollectionApi,
  CollectionItemApi,
  EventApi,
  TaskApi,
  TaskDependencyApi,
  VmRegistryApi,
  VmRole,
  VmStatus
} from '@awesome-dev-journal/shared'

const taskApi: TaskApi = {
  getAllTasks: () => ipcRenderer.invoke('get-all-tasks'),
  getTask: (taskId) => ipcRenderer.invoke('get-task', taskId),
  getTaskByCollectionId: (taskId, collectionId) =>
    ipcRenderer.invoke('get-task-by-collection-id', taskId, collectionId),
  getTasksByCollectionId: (collectionId) =>
    ipcRenderer.invoke('get-tasks-by-collection-id', collectionId),
  getTasksByCollection: (collectionData) =>
    ipcRenderer.invoke('get-tasks-by-collection', collectionData),
  addTask: (taskData) => ipcRenderer.invoke('add-task', taskData),
  updateTask: (taskData) => ipcRenderer.invoke('update-task', taskData),
  completeTask: (taskId) => ipcRenderer.invoke('complete-task', taskId),
  deleteTask: (taskId) => ipcRenderer.invoke('delete-task', taskId),
  cancelTask: (taskId) => ipcRenderer.invoke('cancel-task', taskId),
  migrateTask: (taskId, toTaskId) => ipcRenderer.invoke('migrate-task', taskId, toTaskId)
}

const eventApi: EventApi = {
  getAllEvents: () => ipcRenderer.invoke('get-all-events'),
  getEvent: (eventId) => ipcRenderer.invoke('get-event', eventId),
  getEventByCollectionId: (eventId, collectionId) =>
    ipcRenderer.invoke('get-event-by-collection-id', eventId, collectionId),
  getEventsByCollectionId: (collectionId) =>
    ipcRenderer.invoke('get-events-by-collection-id', collectionId),
  getEventsByCollection: (collectionData) =>
    ipcRenderer.invoke('get-events-by-collection', collectionData),
  addEvent: (eventData) => ipcRenderer.invoke('add-event', eventData),
  updateEvent: (eventData) => ipcRenderer.invoke('update-event', eventData),
  completeEvent: (eventId) => ipcRenderer.invoke('complete-event', eventId),
  deleteEvent: (eventId) => ipcRenderer.invoke('delete-event', eventId),
  cancelEvent: (eventId) => ipcRenderer.invoke('cancel-event', eventId)
}

const collectionApi: CollectionApi = {
  getCollection: (collectinId) => ipcRenderer.invoke('get-collection', collectinId),
  getCollections: () => ipcRenderer.invoke('get-collections'),
  addCollection: (collectionData) => ipcRenderer.invoke('add-collection', collectionData),
  deleteColection: (collectionId) => ipcRenderer.invoke('delete-collection', collectionId),
  addAndRetrieveCollection: (collectionData) =>
    ipcRenderer.invoke('add-retrieve-collection', collectionData),
  updateCollection: (collectionData) => ipcRenderer.invoke('update-collection', collectionData),
  archiveCollection: (collectionId) => ipcRenderer.invoke('archive-collection', collectionId)
}

const collectionItemApi: CollectionItemApi = {
  addToCollection: (collectionId: number, itemId: number, itemType: 'Task' | 'Event' | 'Collection') =>
    ipcRenderer.invoke('add-to-collection', collectionId, itemId, itemType),
  removeFromCollection: (collectionId: number, itemId: number, itemType: 'Task' | 'Event' | 'Collection') =>
    ipcRenderer.invoke('remove-from-collection', collectionId, itemId, itemType),
  getCollectionItems: (collectionId: number) =>
    ipcRenderer.invoke('get-collection-items', collectionId),
  getItemCollections: (itemId: number, itemType: 'Task' | 'Event' | 'Collection') =>
    ipcRenderer.invoke('get-item-collections', itemId, itemType),
  isItemInCollection: (collectionId: number, itemId: number, itemType: 'Task' | 'Event' | 'Collection') =>
    ipcRenderer.invoke('is-item-in-collection', collectionId, itemId, itemType)
}

const taskDependencyApi: TaskDependencyApi = {
  addTaskDependency: (
    taskId: number,
    dependsOnTaskId: number,
    dependencyType?: 'blocks' | 'related' | 'suggested',
    createdBy?: 'user' | 'ai_suggested'
  ) => ipcRenderer.invoke('add-task-dependency', taskId, dependsOnTaskId, dependencyType, createdBy),
  removeTaskDependency: (dependencyId: number) =>
    ipcRenderer.invoke('remove-task-dependency', dependencyId),
  getTaskDependencies: (taskId: number) => ipcRenderer.invoke('get-task-dependencies', taskId),
  getDependentTasks: (taskId: number) => ipcRenderer.invoke('get-dependent-tasks', taskId),
  getUnblockedTasks: () => ipcRenderer.invoke('get-unblocked-tasks'),
  getBlockedTasks: () => ipcRenderer.invoke('get-blocked-tasks'),
  getCriticalPath: () => ipcRenderer.invoke('get-critical-path'),
  getAllDependencies: (taskId: number) => ipcRenderer.invoke('get-all-dependencies', taskId)
}

const activityApi: ActivityApi = {
  addActivity: (
    type: ActivityType,
    source: string,
    data: Record<string, any>,
    relatedTaskId?: number,
    relatedEventId?: number
  ) => ipcRenderer.invoke('add-activity', type, source, data, relatedTaskId, relatedEventId),
  getActivitySummary: (options?: { minutes?: number; hours?: number; days?: number }) =>
    ipcRenderer.invoke('get-activity-summary', options),
  getActivityByTask: (taskId: number) => ipcRenderer.invoke('get-activity-by-task', taskId),
  getActivityByEvent: (eventId: number) => ipcRenderer.invoke('get-activity-by-event', eventId),
  suggestTaskCompletion: (minutes?: number) =>
    ipcRenderer.invoke('suggest-task-completion', minutes),
  getRecentActivityByType: (type: ActivityType, limit?: number) =>
    ipcRenderer.invoke('get-recent-activity-by-type', type, limit),
  deleteOldActivity: (daysToKeep?: number) => ipcRenderer.invoke('delete-old-activity', daysToKeep)
}

const vmRegistryApi: VmRegistryApi = {
  registerVm: (name: string, role: VmRole, memoryMb?: number, cpus?: number, diskSizeMb?: number) =>
    ipcRenderer.invoke('register-vm', name, role, memoryMb, cpus, diskSizeMb),
  updateVmStatus: (vmId: number, status: VmStatus) =>
    ipcRenderer.invoke('update-vm-status', vmId, status),
  getVm: (vmId: number) => ipcRenderer.invoke('get-vm', vmId),
  getVmByName: (name: string) => ipcRenderer.invoke('get-vm-by-name', name),
  listVms: (role?: VmRole) => ipcRenderer.invoke('list-vms', role),
  getRunningVms: () => ipcRenderer.invoke('get-running-vms'),
  getVmsByRole: (role: VmRole) => ipcRenderer.invoke('get-vms-by-role', role),
  assignTaskToVm: (vmId: number, taskId: number) =>
    ipcRenderer.invoke('assign-task-to-vm', vmId, taskId),
  deleteVm: (vmId: number) => ipcRenderer.invoke('delete-vm', vmId)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('taskApi', taskApi)
    contextBridge.exposeInMainWorld('eventApi', eventApi)
    contextBridge.exposeInMainWorld('collectionApi', collectionApi)
    contextBridge.exposeInMainWorld('collectionItemApi', collectionItemApi)
    contextBridge.exposeInMainWorld('taskDependencyApi', taskDependencyApi)
    contextBridge.exposeInMainWorld('activityApi', activityApi)
    contextBridge.exposeInMainWorld('vmRegistryApi', vmRegistryApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.taskApi = taskApi
  // @ts-ignore (define in dts)
  window.eventApi = eventApi
  // @ts-ignore (define in dts)
  window.collectionApi = collectionApi
  // @ts-ignore (define in dts)
  window.collectionItemApi = collectionItemApi
  // @ts-ignore (define in dts)
  window.taskDependencyApi = taskDependencyApi
  // @ts-ignore (define in dts)
  window.activityApi = activityApi
  // @ts-ignore (define in dts)
  window.vmRegistryApi = vmRegistryApi
}
