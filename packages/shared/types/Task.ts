import { BaseItem, TaskStatus } from '.'

export interface Task extends BaseItem {
  topic: string
  status: TaskStatus
  template_id?: number
  instance_number?: number
}
