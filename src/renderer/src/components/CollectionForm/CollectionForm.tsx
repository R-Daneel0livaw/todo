import { collectionSubTypes, collectionTypes } from '@renderer/utils/utils'
import { Collection } from '@shared/types'
import { FormEvent, useEffect, useState } from 'react'
import styles from './CollectionForm.module.css'

interface CollectionFormProps {
  onSave: (collection: Collection) => void
  onCancel: () => void
  collection: Collection
}

const CollectionForm = ({ onSave, onCancel, collection }: CollectionFormProps) => {
  const [collectionState, setCollectionState] = useState<Collection>(
    collection || {
      title: '',
      description: '',
      longDescription: '',
      type: 'DEFAULT',
      subType: 'CUSTOM'
    }
  )

  useEffect(() => {
    setCollectionState(
      collection || {
        title: '',
        description: '',
        longDescription: '',
        type: 'DEFAULT',
        subType: 'CUSTOM'
      }
    )
  }, [collection])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCollectionState((prevCollection) => ({ ...prevCollection, [name]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave(collectionState)
  }

  return (
    <div className={styles.collectionFormContainer}>
      <h1>{collection ? `Edit Collection ${collectionState.title}` : 'Add Collection'}</h1>
      <form className={styles.collectionForm} onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={collectionState.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <select name="type" value={collectionState.type} onChange={handleChange} required>
          <option value="">Select Type</option>
          {collectionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select name="subType" value={collectionState.subType} onChange={handleChange} required>
          <option value="">Select Sub-Type</option>
          {collectionSubTypes.map((subType) => (
            <option key={subType} value={subType}>
              {subType}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="description"
          value={collectionState.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <input
          type="text"
          name="longDescription"
          value={collectionState.longDescription}
          onChange={handleChange}
          placeholder="More Information"
          required
        />
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  )
}

export default CollectionForm
