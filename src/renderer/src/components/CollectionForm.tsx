import { Collection } from '@shared/types'
import { FormEvent, useEffect, useState } from 'react'

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
    <div>
      <h1>{collection ? 'Edit Collection' : 'Add Collection'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={collectionState.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
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
          placeholder="Long Description"
          required
        />
        <select name="type" value={collectionState.type} onChange={handleChange} required>
          <option value="">Select Type</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Monthly">Monthly</option>
          <option value="Daily">Daily</option>
          <option value="Project">Project</option>
          <option value="Custom">Custom</option>
        </select>
        <select name="subType" value={collectionState.subType} onChange={handleChange} required>
          <option value="">Select Sub-Type</option>
          <option value="Task">Task</option>
          <option value="Event">Event</option>
          <option value="Plan">Plan</option>
          <option value="Log">Log</option>
          <option value="Custom">Custom</option>
        </select>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  )
}

export default CollectionForm
