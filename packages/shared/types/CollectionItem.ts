export interface CollectionItem {
  id: number
  collectionId: number
  itemId: number
  itemType: 'Task' | 'Event' | 'Collection'
  // Position within this collection. Null/unused for collections that don't
  // care about order (most of them) — meaningful for ones that do, e.g. a
  // Daily's Plan.
  sortOrder?: number | null
}
