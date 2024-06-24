import { Collection } from '@shared/types'
import CollectionView from '../CollectionView/CollectionView'
import styles from './CollectionList.module.css'
import { useState } from 'react'

interface CollectionListProps {
  collections: Collection[]
  onEdit: (collections: Collection[]) => void
}

const CollectionList = ({ collections, onEdit }: CollectionListProps) => {
  const [expandedCollectionIds, setExpandedCollectionIds] = useState<number[]>([])

  const handleExpand = (collectionId) => {
    setExpandedCollectionIds((prevExpandedIds) =>
      prevExpandedIds.includes(collectionId)
        ? prevExpandedIds.filter((id) => id !== collectionId)
        : [...prevExpandedIds, collectionId]
    )
  }

  const handleEdit = async (collectionId) => {
    const updatedCollections = collections.map((collection) =>
      collection.id === collectionId ? { ...collection, title: 'Modified Title' } : collection
    )
    onEdit(updatedCollections)
  }

  return (
    <ul>
      {collections.map((collection) => (
        <li key={collection.id} className={styles.collectionsItem}>
          <CollectionView
            collection={collection}
            isExpanded={expandedCollectionIds.includes(collection.id)}
            onExpand={() => handleExpand(collection.id)}
          />
          <button
            className={styles.collectionsItemEditBtn}
            onClick={() => handleEdit(collection.id)}
          >
            Edit
          </button>
        </li>
      ))}
    </ul>
  )
}

export default CollectionList
