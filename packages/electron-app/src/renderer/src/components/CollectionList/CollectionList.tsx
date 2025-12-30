import { Collection } from '@awesome-dev-journal/shared'
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
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

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
    setDeletingIndex(index)
    setTimeout(() => {
      onDelete(index)
      setDeletingIndex(null)
    }, 300)
  }

  return (
    <ul>
      {collections.map((collection, index) => (
        <li
          key={collection.id}
          className={`${styles.collectionsItem} ${deletingIndex === index ? styles.fadeOut : ''}`}
        >
          <CollectionView
            collection={collection}
            isExpanded={expandedCollectionIds.includes(collection.id)}
            onExpand={() => handleExpand(collection.id)}
          />
          <div className={styles.collectionsItemBtnContainer}>
            <button onClick={() => handleEdit(index)}>Edit</button>
            {collection.type !== 'DEFAULT' && (
              <button onClick={() => handleDelete(index)}>Delete</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CollectionList
