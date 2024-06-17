import CollectionView from '@renderer/components/CollectionView'
import { getCollections } from '@renderer/services/CollectionService'
import { Collection } from '@shared/types'
import { useEffect, useState } from 'react'
import styles from './CollectionsPage.module.css'

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
    <div className={`${styles.collectionsContainer}`}>
      <h1>Collections</h1>
      <button>Add New</button>
      <ul>
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionView
              collection={collection}
              isExpanded={expandedCollectionId === collection.id}
              onExpand={handleExpand}
            />
            <button>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionsPage
