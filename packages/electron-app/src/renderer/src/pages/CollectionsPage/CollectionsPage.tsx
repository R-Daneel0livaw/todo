import {
  addAndRetrieveCollection,
  deleteColection,
  getCollections,
  updateCollection
} from '@renderer/services/CollectionService'
import { getItemCollections } from '@renderer/services/CollectionItemService'
import { Collection } from '@awesome-dev-journal/shared'
import { useEffect, useState } from 'react'
import styles from './CollectionsPage.module.css'
import CollectionList from '@renderer/components/CollectionList/CollectionList'
import CollectionForm from '@renderer/components/CollectionForm/CollectionForm'
import { Route } from '@renderer/navigation/types'

interface CollectionsPageProps {
  onNavigate: (route: Route) => void
}

function CollectionsPage({ onNavigate }: CollectionsPageProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [inTransition, setInTransition] = useState(false)

  useEffect(() => {
    async function loadCollections() {
      const allCollections = await getCollections()

      // A collection nested under another one (e.g. a Daily's Plan/Log) isn't
      // meant to be browsed on its own — only show genuinely top-level
      // collections here. This is structural (based on actual nesting), not
      // tied to any specific type/subType, so it applies to any future
      // parent/child collection shape without extra code.
      const parentChecks = await Promise.all(
        allCollections.map((c) => getItemCollections(c.id, 'Collection'))
      )
      const topLevelCollections = allCollections.filter((_, index) => parentChecks[index].length === 0)

      setCollections(topLevelCollections)
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

  const handleOpen = (index: number) => {
    const collection = collections[index]
    onNavigate({ page: 'collection-detail', collectionId: collection.id, label: collection.title })
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
            <CollectionList
              collections={collections}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpen}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionsPage
