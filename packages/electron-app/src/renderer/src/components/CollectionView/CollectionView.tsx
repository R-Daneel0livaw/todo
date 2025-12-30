import { Collection } from '@awesome-dev-journal/shared'
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
        <h2 className={styles.collectionViewTitle}>
          <span className={styles.collectionViewType}>[{collection.type.charAt(0)}]</span>
          <span className={styles.collectionViewType}>[{collection.subType.charAt(0)}]</span>
          {collection.title}
        </h2>
        <p className={styles.collectionViewMainInfo}>{collection.description}</p>
      </div>
      {isExpanded && (
        <div className={styles.collectionViewContainer}>
          {collection.longDescription && (
            <p className={styles.collectionViewMainInfo}>{collection.longDescription}</p>
          )}
          <ul className={styles.collectionViewExpansionDetails}>
            <p title={createdDateParts.time}>Created: {createdDateParts.date}</p>
            {collection.startDate && (
              <p title={startDateParts?.time}>Started: {startDateParts?.date}</p>
            )}
          </ul>
          <ul className={styles.collectionViewExpansionDetails}>
            {collection.endDate && <p title={endDateParts?.time}>Ended: {endDateParts?.date}</p>}
            {collection.canceledDate && (
              <p title={canceledDateParts?.time}>Canceled: {canceledDateParts?.date}</p>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CollectionView
