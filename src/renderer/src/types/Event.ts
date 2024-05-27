import { BaseItem, TaskStatus } from '.'

export interface Event extends BaseItem {
  location?: string
  scheduledDate?: Date
  status: TaskStatus
}
