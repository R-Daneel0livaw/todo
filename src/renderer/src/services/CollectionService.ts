import { Collection } from '@shared/types'

export const getCollections = async (): Promise<Collection[]> => {
  return window.api.getCollections()
}
