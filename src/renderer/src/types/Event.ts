import { BaseItem } from './BaseItem'

export interface Event extends BaseItem {
  location: string
  scheduledDate: Date
  startDate?: Date
  endDate?: Date
}
