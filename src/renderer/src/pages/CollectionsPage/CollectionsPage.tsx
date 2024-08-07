import {
  addAndRetrieveCollection,
  deleteColection,
  getCollections,
  updateCollection
} from '@renderer/services/CollectionService'
import { Collection } from '@shared/types'
import { useEffect, useState } from 'react'
import styles from './CollectionsPage.module.css'
import CollectionList from '@renderer/components/CollectionList/CollectionList'
import CollectionForm from '@renderer/components/CollectionForm/CollectionForm'

function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [inTransition, setInTransition] = useState(false)

  useEffect(() => {
    async function loadCollections() {
      const collections = await getCollections()
      setCollections(collections)
    }
    loadCollections()
  }, [])

  const handleAddNew = async () => {
    setInTransition(true)
    setTimeout(() => {
      setCurrentCollectionIndex(null)
      setIsEditing(true)
      setInTransition(false)
    }, 300)
  }

  const handleEdit = (index: number) => {
    setInTransition(true)
    setTimeout(() => {
      setCurrentCollectionIndex(index)
      setIsEditing(true)
      setInTransition(false)
    }, 300)
  }

  const handleDelete = async (index: number) => {
    try {
      await deleteColection(collections[index].id)
      const updatedCollections = collections.filter((_, i) => i !== index)
      setCollections(updatedCollections)
    } catch (error) {
      console.error('Failed to delete the collection:', error)
    }
  }

  const handleSave = async (collection: Collection) => {
    setInTransition(true)
    try {
      let savedCollection: Collection
      if (currentCollectionIndex !== null) {
        savedCollection = await updateCollection(collection)
      } else {
        savedCollection = await addAndRetrieveCollection(collection)
      }

      setTimeout(() => {
        if (currentCollectionIndex !== null) {
          const updatedCollections = collections.map((c, index) =>
            index === currentCollectionIndex ? savedCollection : c
          )
          setCollections(updatedCollections)
        } else {
          setCollections([...collections, savedCollection])
        }
        setInTransition(false)
        setIsEditing(false)
      }, 300)
    } catch (error) {
      console.error('Failed to save the collection:', error)
      setInTransition(false)
    }
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
      <h1 className={styles.collectionsTitle}>Collections</h1>
      <div className={`${inTransition ? styles.viewTransitionExit : styles.viewTransitionEnter}`}>
        {isEditing ? (
          <CollectionForm
            onSave={handleSave}
            onCancel={handleCancel}
            collection={collections[currentCollectionIndex != null ? currentCollectionIndex : -1]}
          />
        ) : (
          <div className={styles.collectionsViewContainer}>
            <button className={styles.collectionsAddBtn} onClick={handleAddNew}>
              Add New
            </button>
            <CollectionList collections={collections} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionsPage
