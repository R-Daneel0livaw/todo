import { Collection } from '@shared/types'

export const getCollections = async (): Promise<Collection[]> => {
  return window.api.getCollections()
}

export const addCollection = async (collectionData: Collection): Promise<void> => {
  window.api.addCollection(collectionData)
}

export const deleteColection = async (collectionId): Promise<void> => {
  window.api.deleteColection(collectionId)
}
