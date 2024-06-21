import { Collection } from '@shared/types'
import styles from './CollectionView.module.css'

interface CollectionViewProps {
  collection: Collection
  isExpanded: boolean
  onExpand: (collectionId: number) => void
}

const removeTimeStamp = (date: Date) => {
  return date.toLocaleString().split('T')[0]
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
          <p className={styles.collectionViewExpansionDetails}>
            <span>Created: {removeTimeStamp(collection.createDate)}</span>
            {collection.startDate && <span>Started: {removeTimeStamp(collection.startDate)}</span>}
          </p>
          <p className={styles.collectionViewExpansionDetails}>
            {collection.endDate && <span>Ended: {removeTimeStamp(collection.endDate)}</span>}
            {collection.canceledDate && (
              <span>Canceled: {removeTimeStamp(collection.canceledDate)}</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default CollectionView
