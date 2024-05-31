import { BaseItem, TaskStatus } from '.'

export interface Task extends BaseItem {
  topic: string
  status: TaskStatus
}
