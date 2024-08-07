import { Collection } from '@shared/types'

export const getCollections = async (): Promise<Collection[]> => {
  return window.collectionApi.getCollections()
}

export const addCollection = async (collectionData: Collection): Promise<void> => {
  window.collectionApi.addCollection(collectionData)
}

export const deleteColection = async (collectionId: number): Promise<void> => {
  window.collectionApi.deleteColection(collectionId)
}

export const addAndRetrieveCollection = async (collectionData: Collection): Promise<Collection> => {
  return window.collectionApi.addAndRetrieveCollection(collectionData)
}

export const updateCollection = async (collectionData: Collection): Promise<Collection> => {
  return window.collectionApi.updateCollection(collectionData)
}
