import { Collection } from '@shared/types'
import styles from './CollectionView.module.css'

interface CollectionViewProps {
  collection: Collection
  isExpanded: boolean
  onExpand: (collectionId: number) => void
}

function CollectionView({ collection, isExpanded, onExpand }: CollectionViewProps) {
  return (
    <div>
      <div className={styles.collectionViewContainer} onClick={() => onExpand(collection.id)}>
        <h2>
          <span className={styles.collectionViewType}>[{collection.type.charAt(0)}]</span>
          <span className={styles.collectionViewType}>[{collection.subType.charAt(0)}]</span>
          {collection.title}
        </h2>
        <p>{collection.description}</p>
      </div>
      {isExpanded && (
        <div className={styles.collectionViewContainer}>
          <p>Created At: {collection.createDate.toLocaleString()}</p>
          {collection.startDate && <p>Started At: {collection.startDate.toLocaleString()}</p>}
          {collection.endDate && <p>Ended At: {collection.endDate.toLocaleString()}</p>}
          {collection.canceledDate && (
            <p>Canceled At: {collection.canceledDate.toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CollectionView
