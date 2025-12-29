import { BaseItem, TaskStatus } from '.'

export interface Task extends BaseItem {
  topic: string
  status: TaskStatus
  migrated_from_id?: number
  migrated_to_id?: number
}
