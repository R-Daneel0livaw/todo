import { Collection } from '.'

export interface CollectionApi {
  getCollection(collectinId: number): Promise<Collection>
  getCollections(): Promise<Collection[]>
  addCollection(collectionData: Collection): Promise<void>
  deleteColection(collectionId: number): Promise<void>
  addAndRetrieveCollection(collectionData: Collection): Promise<Collection>
  updateCollection(collectionData: Collection): Promise<Collection>
}
