import { Collection } from '@shared/types'
import CollectionView from '../CollectionView/CollectionView'
import styles from './CollectionList.module.css'
import { useState } from 'react'

interface CollectionListProps {
  collections: Collection[]
  onEdit: (index: number) => void
}

const CollectionList = ({ collections, onEdit }: CollectionListProps) => {
  const [expandedCollectionIds, setExpandedCollectionIds] = useState<number[]>([])

  const handleExpand = (collectionId: number) => {
    setExpandedCollectionIds((prevExpandedIds) =>
      prevExpandedIds.includes(collectionId)
        ? prevExpandedIds.filter((id) => id !== collectionId)
        : [...prevExpandedIds, collectionId]
    )
  }

  const handleEdit = async (index: number) => {
    onEdit(index)
  }

  return (
    <ul>
      {collections.map((collection, index) => (
        <li key={collection.id} className={styles.collectionsItem}>
          <CollectionView
            collection={collection}
            isExpanded={expandedCollectionIds.includes(collection.id)}
            onExpand={() => handleExpand(collection.id)}
          />
          <button className={styles.collectionsItemEditBtn} onClick={() => handleEdit(index)}>
            Edit
          </button>
        </li>
      ))}
    </ul>
  )
}

export default CollectionList
