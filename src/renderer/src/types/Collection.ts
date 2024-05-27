import { CollectionSubType, CollectionType } from '.'

export interface Collection {
  id: number
  title: string
  description?: string
  type: CollectionType
  subType: CollectionSubType
  createDate: Date
  startDate?: Date
  endDate?: Date
  canceledDate?: Date
}
