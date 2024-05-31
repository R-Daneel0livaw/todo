export interface BaseItem {
  id: number
  title: string
  description?: string
  createDate: Date
  startDate?: Date
  endDate?: Date
  canceledDate?: Date
}
