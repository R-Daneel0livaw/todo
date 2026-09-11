import { CollectionItem } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

export function setupCollectionItemHandlers() {
  ipcMain.handle(
    'add-to-collection',
    async (
      _: IpcMainInvokeEvent,
      collectionId: number,
      itemId: number,
      itemType: 'Task' | 'Event' | 'Collection'
    ): Promise<number> => {
      const result = await JournalClient.addItemToCollection(collectionId, itemId, itemType)
      return result.id
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
      await JournalClient.removeItemFromCollection(collectionId, itemId, itemType)
    }
  )

  ipcMain.handle(
    'get-collection-items',
    async (_: IpcMainInvokeEvent, collectionId: number): Promise<CollectionItem[]> => {
      return JournalClient.getCollectionItems(collectionId)
    }
  )

  ipcMain.handle(
    'get-item-collections',
    async (
      _: IpcMainInvokeEvent,
      itemId: number,
      itemType: 'Task' | 'Event' | 'Collection'
    ): Promise<CollectionItem[]> => {
      return JournalClient.getItemCollections(itemId, itemType)
    }
  )

  ipcMain.handle(
    'reorder-collection-items',
    async (
      _: IpcMainInvokeEvent,
      collectionId: number,
      items: { itemId: number; itemType: 'Task' | 'Event' | 'Collection' }[]
    ): Promise<void> => {
      await JournalClient.reorderCollectionItems(collectionId, items)
    }
  )

  // Disabled: unused so far. The HTTP route exists
  // (GET /api/collections/:id/items/:itemId/check) — wire this up like
  // get-item-collections above whenever something needs it.
  // ipcMain.handle(
  //   'is-item-in-collection',
  //   async (
  //     _: IpcMainInvokeEvent,
  //     collectionId: number,
  //     itemId: number,
  //     itemType: 'Task' | 'Event' | 'Collection'
  //   ): Promise<boolean> => {
  //     return isItemInCollection(collectionId, itemId, itemType)
  //   }
  // )
}
