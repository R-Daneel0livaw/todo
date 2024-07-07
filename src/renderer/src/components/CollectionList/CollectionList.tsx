import { Collection } from '@shared/types'
import CollectionView from '../CollectionView/CollectionView'
import styles from './CollectionList.module.css'
import { useState } from 'react'

interface CollectionListProps {
  collections: Collection[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}

const CollectionList = ({ collections, onEdit, onDelete }: CollectionListProps) => {
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

  const handleDelete = async (index: number) => {
    onDelete(index)
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
          <div className={styles.collectionsItemBtnContainer}>
            <button onClick={() => handleEdit(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CollectionList
