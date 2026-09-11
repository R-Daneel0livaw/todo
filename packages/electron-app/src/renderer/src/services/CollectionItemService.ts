import { CollectionItem } from '@awesome-dev-journal/shared'

export const addToCollection = async (
  collectionId: number,
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): Promise<number> => {
  return window.collectionItemApi.addToCollection(collectionId, itemId, itemType)
}

export const getCollectionItems = async (collectionId: number): Promise<CollectionItem[]> => {
  return window.collectionItemApi.getCollectionItems(collectionId)
}

export const getItemCollections = async (
  itemId: number,
  itemType: 'Task' | 'Event' | 'Collection'
): Promise<CollectionItem[]> => {
  return window.collectionItemApi.getItemCollections(itemId, itemType)
}

export const reorderCollectionItems = async (
  collectionId: number,
  items: { itemId: number; itemType: 'Task' | 'Event' | 'Collection' }[]
): Promise<void> => {
  return window.collectionItemApi.reorderCollectionItems(collectionId, items)
}
