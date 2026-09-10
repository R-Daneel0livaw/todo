import { ElectronAPI } from '@electron-toolkit/preload'
import {
  ActivityApi,
  CollectionApi,
  CollectionItemApi,
  DevApi,
  EventApi,
  MigrationHistoryApi,
  TaskApi,
  TaskDependencyApi,
  VmRegistryApi
} from '@awesome-dev-journal/shared'

declare global {
  interface Window {
    electron: ElectronAPI
    taskApi: TaskApi
    eventApi: EventApi
    collectionApi: CollectionApi
    collectionItemApi: CollectionItemApi
    taskDependencyApi: TaskDependencyApi
    activityApi: ActivityApi
    vmRegistryApi: VmRegistryApi
    migrationHistoryApi: MigrationHistoryApi
    devApi: DevApi
  }
}
