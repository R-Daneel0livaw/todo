import { Collection } from '@shared/types'
import styles from './CollectionView.module.css'
import { getDateParts } from '@renderer/utils/utils'

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
          {collection.longDescription && <p>{collection.longDescription}</p>}
          <p className={styles.collectionViewExpansionDetails}>
            <span title={getDateParts(collection.createDate).time}>
              Created: {getDateParts(collection.createDate).date}
            </span>
            {collection.startDate && (
              <span title={getDateParts(collection.startDate).time}>
                Started: {getDateParts(collection.startDate).date}
              </span>
            )}
          </p>
          <p className={styles.collectionViewExpansionDetails}>
            {collection.endDate && (
              <span title={getDateParts(collection.endDate).time}>
                Ended: {getDateParts(collection.endDate).date}
              </span>
            )}
            {collection.canceledDate && (
              <span title={getDateParts(collection.canceledDate).time}>
                Canceled: {getDateParts(collection.canceledDate).date}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default CollectionView
