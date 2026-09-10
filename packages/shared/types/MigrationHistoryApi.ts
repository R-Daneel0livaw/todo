import { ItemMigrationHistory } from '.'

export interface MigrationHistoryApi {
  getMigrationsFromCollection(
    collectionId: number,
    itemType?: 'Task' | 'Event'
  ): Promise<ItemMigrationHistory[]>
}
