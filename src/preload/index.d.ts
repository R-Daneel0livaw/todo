import { ElectronAPI } from '@electron-toolkit/preload'
import { CollectionApi, EventApi, TaskApi } from '@shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    taskApi: TaskApi
    eventApi: EventApi
    collectionApi: CollectionApi
  }
}
