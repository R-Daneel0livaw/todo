import { allSubTypes, validSubTypes } from '@renderer/utils/utils'
import { Collection, CollectionType } from '@shared/types'
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

  const subTypeOptions =
    collectionState.type && collectionState.type in validSubTypes
      ? validSubTypes[collectionState.type as CollectionType]
      : allSubTypes

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
        <div className={styles.fieldHolder}>
          <input
            type="text"
            name="title"
            id="title"
            value={collectionState.title}
            onChange={handleChange}
            required
            className={`${styles.innerInput} ${styles.collectionFormMidWidthInput}`}
          />
          <label htmlFor="title" className={styles.innerLabel}>
            Title
          </label>
        </div>
        <div className={styles.collectionFormInputContainer}>
          {collectionState.type !== 'DEFAULT' && (
            <div className={styles.fieldHolder}>
              <select
                name="type"
                id="type"
                value={collectionState.type}
                onChange={handleChange}
                required
                className={`${styles.innerInput}`}
              >
                <option disabled value="" className={styles.displayNone}></option>
                {Object.keys(validSubTypes).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label htmlFor="type" className={styles.innerLabel}>
                Type
              </label>
            </div>
          )}
          <div className={styles.fieldHolder}>
            <select
              name="subType"
              id="subType"
              value={collectionState.subType}
              onChange={handleChange}
              required
              className={`${styles.innerInput}`}
            >
              <option disabled value="" className={styles.displayNone}></option>
              {subTypeOptions.map((subType) => (
                <option key={subType} value={subType}>
                  {subType}
                </option>
              ))}
            </select>
            <label htmlFor="subType" className={styles.innerLabel}>
              Sub-Type
            </label>
          </div>
        </div>
        <div className={styles.fieldHolder}>
          <input
            type="text"
            name="description"
            id="description"
            value={collectionState.description}
            onChange={handleChange}
            required
            className={`${styles.innerInput} ${styles.collectionFormMidWidthInput}`}
          />
          <label htmlFor="description" className={styles.innerLabel}>
            Description
          </label>
        </div>
        <div className={styles.fieldHolder}>
          <textarea
            name="longDescription"
            value={collectionState.longDescription}
            id="longDescription"
            onChange={handleChange}
            className={`${styles.innerInput} ${styles.collectionFormLongWidthInput}`}
          />
          <label htmlFor="longDescription" className={styles.innerLabel}>
            More Information
          </label>
        </div>
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
