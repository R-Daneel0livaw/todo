import { ItemMigrationHistory } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

export function setupMigrationHistoryHandlers() {
  ipcMain.handle(
    'get-migrations-from-collection',
    async (
      _: IpcMainInvokeEvent,
      collectionId: number,
      itemType?: 'Task' | 'Event'
    ): Promise<ItemMigrationHistory[]> => {
      return JournalClient.getMigrationsFromCollection(collectionId, itemType)
    }
  )
}
