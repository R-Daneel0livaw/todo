import { BaseItem } from './BaseItem'

export interface Task extends BaseItem {
  topic: string
  startDate?: Date
  endDate?: Date
}
