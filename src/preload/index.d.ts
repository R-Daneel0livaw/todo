import { ElectronAPI } from '@electron-toolkit/preload'

interface Task {
  id: number
  title: string
  description: string
}

interface Api {
  getTask(taskId: number): Promise<Task>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
