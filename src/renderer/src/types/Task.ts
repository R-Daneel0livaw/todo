import { BaseItem } from '.'

export interface Task extends BaseItem {
  topic: string
  startDate?: Date
  endDate?: Date
}
