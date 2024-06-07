import CollectionView from '@renderer/components/CollectionView'
import { getCollections } from '@renderer/services/CollectionService'
import { Collection } from '@shared/types'
import { useEffect, useState } from 'react'

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [expandedCollectionId, setExpandedCollectionId] = useState<number | null>(null)

  useEffect(() => {
    async function loadCollections() {
      const collections = await getCollections()
      setCollections(collections)
    }
    loadCollections()
  }, [])

  const handleExpand = (collectionId: number) => {
    setExpandedCollectionId(expandedCollectionId === collectionId ? null : collectionId)
  }

  return (
    <div>
      <h1>Collection List</h1>
      <ul>
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionView
              collection={collection}
              isExpanded={expandedCollectionId === collection.id}
              onExpand={handleExpand}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
export default CollectionsPage
