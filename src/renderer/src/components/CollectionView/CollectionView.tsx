import { Collection } from '@shared/types'
import styles from './CollectionView.module.css'
import { getDateParts } from '@renderer/utils/utils'

interface CollectionViewProps {
  collection: Collection
  isExpanded: boolean
  onExpand: (collectionId: number) => void
}

function CollectionView({ collection, isExpanded, onExpand }: CollectionViewProps) {
  const createdDateParts = getDateParts(collection.createDate)
  const startDateParts = collection.startDate ? getDateParts(collection.startDate) : null
  const endDateParts = collection.endDate ? getDateParts(collection.endDate) : null
  const canceledDateParts = collection.canceledDate ? getDateParts(collection.canceledDate) : null

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
            <span title={createdDateParts.time}>Created: {createdDateParts.date}</span>
            {collection.startDate && (
              <span title={startDateParts?.time}>Started: {startDateParts?.date}</span>
            )}
          </p>
          <p className={styles.collectionViewExpansionDetails}>
            {collection.endDate && (
              <span title={endDateParts?.time}>Ended: {endDateParts?.date}</span>
            )}
            {collection.canceledDate && (
              <span title={canceledDateParts?.time}>Canceled: {canceledDateParts?.date}</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default CollectionView
