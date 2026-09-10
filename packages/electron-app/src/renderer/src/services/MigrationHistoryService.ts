import { ItemMigrationHistory } from '@awesome-dev-journal/shared'

export const getMigrationsFromCollection = async (
  collectionId: number,
  itemType?: 'Task' | 'Event'
): Promise<ItemMigrationHistory[]> => {
  return window.migrationHistoryApi.getMigrationsFromCollection(collectionId, itemType)
}
