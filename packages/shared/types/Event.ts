import { BaseItem, TaskStatus } from '.'

export interface Event extends BaseItem {
  location?: string
  link?: string
  scheduledDate?: Date
  status: TaskStatus
  template_id?: number
  instance_number?: number
}
