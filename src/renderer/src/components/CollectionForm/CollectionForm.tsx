import { collectionSubTypes, collectionTypes, toTitleCase } from '@renderer/utils/utils'
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
      type: '',
      subType: ''
    }
  )

  useEffect(() => {
    setCollectionState(
      collection || {
        title: '',
        description: '',
        longDescription: '',
        type: '',
        subType: ''
      }
    )
  }, [collection])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setCollectionState((prevCollection) => ({ ...prevCollection, [name]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!collectionState.createDate) {
      collectionState.createDate = new Date()
    }
    onSave(collectionState)
  }

  return (
    <div className={styles.collectionFormContainer}>
      <h1 className={styles.collectionFormTitle}>
        {collection ? `Edit Collection ${collectionState.title}` : 'Add Collection'}
      </h1>
      <form className={styles.collectionForm} onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          id="title"
          value={collectionState.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className={styles.collectionFormMidWidthInput}
        />
        <label htmlFor="title">Title</label>
        <div className={styles.collectionFormInputContainer}>
          {collectionState.type !== 'DEFAULT' && (
            <>
              <select
                name="type"
                id="type"
                value={collectionState.type}
                onChange={handleChange}
                required
                className={styles.collectionFormShortWidthInput}
              >
                <option value="">Select Type</option>
                {collectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {toTitleCase(type)}
                  </option>
                ))}
              </select>
              <label htmlFor="type">Type</label>
            </>
          )}
          <select
            name="subType"
            id="subType"
            value={collectionState.subType}
            onChange={handleChange}
            required
            className={styles.collectionFormShortWidthInput}
          >
            <option value="">Select Sub-Type</option>
            {collectionSubTypes.map((subType) => (
              <option key={subType} value={subType}>
                {toTitleCase(subType)}
              </option>
            ))}
          </select>
          <label htmlFor="subType">Sub-Type</label>
        </div>
        <input
          type="text"
          name="description"
          id="description"
          value={collectionState.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className={styles.collectionFormMidWidthInput}
        />
        <label htmlFor="description">Description</label>
        <textarea
          name="longDescription"
          value={collectionState.longDescription}
          id="longDescription"
          onChange={handleChange}
          placeholder="More Information"
          className={styles.collectionFormLongWidthInput}
        />
        <label htmlFor="longDescription">More Information</label>
        <div className={styles.collectionFormBtnContainer}>
          <button type="submit" className={styles.collectionFormBtn}>
            Save
          </button>
          <button type="button" className={styles.collectionFormBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CollectionForm
