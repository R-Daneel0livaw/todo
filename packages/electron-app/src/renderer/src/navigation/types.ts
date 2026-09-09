export type Route =
  | { page: 'daily-log' }
  | { page: 'collections' }
  | { page: 'collection-detail'; collectionId: number; label: string }
