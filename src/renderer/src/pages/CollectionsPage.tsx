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
            <div onClick={() => handleExpand(collection.id)}>
              <h2>{collection.title}</h2>
              <p>{collection.description}</p>
            </div>
            {expandedCollectionId === collection.id && (
              <div>
                <p>Type: {collection.type}</p>
                <p>Sub-Type: {collection.subType}</p>
                <p>Created At: {collection.createDate.toLocaleString()}</p>
                {collection.startDate && (
                  <p>Started At: {collection.startDate?.toLocaleString()}</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionsPage
