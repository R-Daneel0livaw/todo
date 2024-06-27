import { getCollections } from '@renderer/services/CollectionService'
import { Collection } from '@shared/types'
import { useEffect, useState } from 'react'
import styles from './CollectionsPage.module.css'
import CollectionList from '@renderer/components/CollectionList/CollectionList'
import CollectionForm from '@renderer/components/CollectionForm/CollectionForm'

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0)
  const [inTransition, setInTransition] = useState(false)

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
    setInTransition(true)
    setTimeout(() => {
      setCurrentCollectionIndex(index)
      setIsEditing(true)
      setInTransition(false)
    }, 300)
  }

  const handleSave = (collection: Collection) => {
    setInTransition(true)
    setTimeout(() => {
      if (currentCollectionIndex !== null) {
        const updatedCollections = collections.map((c, index) =>
          index === currentCollectionIndex ? collection : c
        )
        setCollections(updatedCollections)
      } else {
        setCollections([...collections, collection])
      }
      setIsEditing(false)
      setInTransition(false)
    }, 300)
  }

  const handleCancel = () => {
    setInTransition(true)
    setTimeout(() => {
      setIsEditing(false)
      setInTransition(false)
    }, 300)
  }

  return (
    <div className={`${styles.collectionsContainer}`}>
      <h1>Collections</h1>
      <button className={styles.collectionsAddBtn} onClick={handleAddNew}>
        Add New
      </button>
      <div className={`${inTransition ? styles.viewTransitionExit : styles.viewTransitionEnter}`}>
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
    </div>
  )
}

export default CollectionsPage
