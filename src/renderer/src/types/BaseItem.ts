import { TaskStatus } from './TaskStatus'

export interface BaseItem {
  id: number
  title: string
  description?: string
  status: TaskStatus
  createDate: Date
}
