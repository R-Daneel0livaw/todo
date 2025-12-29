export interface CollectionItem {
  id: number
  collectionId: number
  itemId: number
  itemType: 'Task' | 'Event' | 'Collection'
}
