import { Collection } from '@awesome-dev-journal/shared'
import { toTitleCase } from '@renderer/utils/utils'
import styles from './MigrateSelect.module.css'

interface MigrateSelectProps {
  collections: Collection[]
  onMigrate: (collectionId: number) => void
}

const MigrateSelect = ({ collections, onMigrate }: MigrateSelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value) onMigrate(Number(value))
  }

  return (
    <select className={styles.migrateSelect} value="" onChange={handleChange}>
      <option value="" disabled>
        Move to...
      </option>
      {collections.map((collection) => (
        <option key={collection.id} value={collection.id}>
          {collection.title} ({toTitleCase(collection.type)}
          {collection.subType ? `/${toTitleCase(collection.subType)}` : ''})
        </option>
      ))}
    </select>
  )
}

export default MigrateSelect
