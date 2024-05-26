import { TaskStatus } from '.'

export interface BaseItem {
  id: number
  title: string
  description?: string
  status: TaskStatus
  createDate: Date
}
