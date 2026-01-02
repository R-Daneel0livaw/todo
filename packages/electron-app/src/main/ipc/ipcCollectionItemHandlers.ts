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

  // TODO: Temporarily disabled - need HTTP API endpoints for these methods
  // ipcMain.handle(
  //   'get-item-collections',
  //   async (
  //     _: IpcMainInvokeEvent,
  //     itemId: number,
  //     itemType: 'Task' | 'Event' | 'Collection'
  //   ): Promise<CollectionItem[]> => {
  //     return getItemCollections(itemId, itemType)
  //   }
  // )

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
