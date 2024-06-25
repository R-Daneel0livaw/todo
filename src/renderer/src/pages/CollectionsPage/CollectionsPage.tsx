import { getCollections } from '@renderer/services/CollectionService'
import { Collection } from '@shared/types'
import { useEffect, useState } from 'react'
import styles from './CollectionsPage.module.css'
import CollectionList from '@renderer/components/CollectionList/CollectionList'
import CollectionForm from '@renderer/components/CollectionForm'

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0)

  useEffect(() => {
    async function loadCollections() {
      const collections = await getCollections()
      setCollections(collections)
    }
    loadCollections()
  }, [])

  const handleAddNew = async () => {
    const newCollection: Collection = {
      id: 3,
      type: 'DEFAULT',
      subType: 'CUSTOM',
      title: 'Dummy Collection',
      createDate: new Date()
    }
    setCollections((prevCollections) => [...prevCollections, newCollection])
  }

  const handleEdit = (index: number) => {
    setCurrentCollectionIndex(index)
    setIsEditing(true)
  }

  const handleSave = (collection: Collection) => {
    if (currentCollectionIndex !== null) {
      const updatedCollections = collections.map((c, index) =>
        index === currentCollectionIndex ? collection : c
      )
      setCollections(updatedCollections)
    } else {
      setCollections([...collections, collection])
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className={`${styles.collectionsContainer}`}>
      <h1>Collections</h1>
      <button className={styles.collectionsAddBtn} onClick={handleAddNew}>
        Add New
      </button>
      {isEditing ? (
        <CollectionForm
          onSave={handleSave}
          onCancel={handleCancel}
          collection={collections[currentCollectionIndex]}
        />
      ) : (
        <CollectionList collections={collections} onEdit={handleEdit} />
      )}
    </div>
  )
}

export default CollectionsPage
