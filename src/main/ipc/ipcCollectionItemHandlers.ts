import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  addToCollection,
  getCollectionItems,
  getItemCollections,
  isItemInCollection,
  removeFromCollection,
  type CollectionItem
} from '../database/CollectionItemManager'

export function setupCollectionItemHandlers() {
  ipcMain.handle(
    'add-to-collection',
    async (
      _: IpcMainInvokeEvent,
      collectionId: number,
      itemId: number,
      itemType: 'Task' | 'Event' | 'Collection'
    ): Promise<number> => {
      return addToCollection(collectionId, itemId, itemType)
    }
  )

  ipcMain.handle(
    'remove-from-collection',
    async (
      _: IpcMainInvokeEvent,
      collectionId: number,
      itemId: number,
      itemType: 'Task' | 'Event' | 'Collection'
    ): Promise<void> => {
      removeFromCollection(collectionId, itemId, itemType)
    }
  )

  ipcMain.handle(
    'get-collection-items',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<CollectionItem[]> => {
      return getCollectionItems(collectionId)
    }
  )

  ipcMain.handle(
    'get-item-collections',
    async (
      _: IpcMainInvokeEvent,
      itemId: number,
      itemType: 'Task' | 'Event' | 'Collection'
    ): Promise<CollectionItem[]> => {
      return getItemCollections(itemId, itemType)
    }
  )

  ipcMain.handle(
    'is-item-in-collection',
    async (
      _: IpcMainInvokeEvent,
      collectionId: number,
      itemId: number,
      itemType: 'Task' | 'Event' | 'Collection'
    ): Promise<boolean> => {
      return isItemInCollection(collectionId, itemId, itemType)
    }
  )
}
