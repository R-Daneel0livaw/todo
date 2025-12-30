import { CollectionItem } from '.'

export interface CollectionItemApi {
  addToCollection(
    collectionId: number,
    itemId: number,
    itemType: 'Task' | 'Event' | 'Collection'
  ): Promise<number>
  removeFromCollection(
    collectionId: number,
    itemId: number,
    itemType: 'Task' | 'Event' | 'Collection'
  ): Promise<void>
  getCollectionItems(collectionId: number): Promise<CollectionItem[]>
  getItemCollections(
    itemId: number,
    itemType: 'Task' | 'Event' | 'Collection'
  ): Promise<CollectionItem[]>
  isItemInCollection(
    collectionId: number,
    itemId: number,
    itemType: 'Task' | 'Event' | 'Collection'
  ): Promise<boolean>
}
