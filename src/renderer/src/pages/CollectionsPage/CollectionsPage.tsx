import { getCollections } from '@renderer/services/CollectionService'
import { Collection } from '@shared/types'
import { useEffect, useState } from 'react'
import styles from './CollectionsPage.module.css'
import CollectionView from '@renderer/components/CollectionView/CollectionView'

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [expandedCollectionIds, setExpandedCollectionIds] = useState<number[]>([])

  useEffect(() => {
    async function loadCollections() {
      const collections = await getCollections()
      setCollections(collections)
    }
    loadCollections()
  }, [])

  const handleExpand = (collectionId) => {
    setExpandedCollectionIds((prevExpandedIds) =>
      prevExpandedIds.includes(collectionId)
        ? prevExpandedIds.filter((id) => id !== collectionId)
        : [...prevExpandedIds, collectionId]
    )
  }

  return (
    <div className={`${styles.collectionsContainer}`}>
      <h1>Collections</h1>
      <button className={styles.collectionsAddBtn}>Add New</button>
      <ul>
        {collections.map((collection) => (
          <li key={collection.id} className={styles.collectionsItem}>
            <CollectionView
              collection={collection}
              isExpanded={expandedCollectionIds.includes(collection.id)}
              onExpand={() => handleExpand(collection.id)}
            />
            <button className={styles.collectionsItemEditBtn}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionsPage
