import { BaseItem, CollectionSubType, CollectionType } from '.'

export interface Collection extends BaseItem {
  type: CollectionType
  subType: CollectionSubType
  longDescription?: string
  archived_at?: Date
}
