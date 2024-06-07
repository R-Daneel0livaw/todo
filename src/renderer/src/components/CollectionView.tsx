import { Collection } from '@shared/types'

interface CollectionViewProps {
  collection: Collection
  isExpanded: boolean
  onExpand: (collectionId: number) => void
}

function CollectionView({ collection, isExpanded, onExpand }: CollectionViewProps) {
  return (
    <div>
      <div onClick={() => onExpand(collection.id)}>
        <h2>{collection.title}</h2>
        <p>{collection.description}</p>
      </div>
      {isExpanded && (
        <div>
          <p>Type: {collection.type}</p>
          <p>Sub-Type: {collection.subType}</p>
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
