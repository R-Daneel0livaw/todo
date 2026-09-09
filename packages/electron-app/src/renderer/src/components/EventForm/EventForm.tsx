import { Event } from '@awesome-dev-journal/shared'
import { FormEvent, useState } from 'react'
import styles from './EventForm.module.css'

interface EventFormProps {
  onSave: (event: Event) => void
  onCancel: () => void
}

interface EventFormState {
  title: string
  description: string
  location: string
  link: string
  scheduledDate: string
  startDate: string
  endDate: string
}

const emptyState: EventFormState = {
  title: '',
  description: '',
  location: '',
  link: '',
  scheduledDate: '',
  startDate: '',
  endDate: ''
}

interface TouchedFields {
  [key: string]: boolean
}

const EventForm = ({ onSave, onCancel }: EventFormProps) => {
  const [eventState, setEventState] = useState<EventFormState>(emptyState)
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setEventState((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur =
    (field: string, checkValue: boolean) =>
    (event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>) => {
      if (!checkValue || (checkValue && event.target.value)) {
        setTouchedFields((prev) => ({ ...prev, [field]: true }))
      }
    }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const event: Event = {
      id: 0,
      title: eventState.title,
      description: eventState.description || undefined,
      location: eventState.location || undefined,
      link: eventState.link || undefined,
      status: 'CREATED',
      createDate: new Date(),
      scheduledDate: eventState.scheduledDate ? new Date(eventState.scheduledDate) : undefined,
      startDate: eventState.startDate ? new Date(eventState.startDate) : undefined,
      endDate: eventState.endDate ? new Date(eventState.endDate) : undefined
    }
    onSave(event)
  }

  return (
    <div className={styles.eventFormContainer}>
      <h2 className={styles.eventFormTitle}>Add Event</h2>
      <form className={styles.eventForm} onSubmit={handleSubmit}>
        <div className={styles.eventFormInputContainer}>
          <div className={styles.fieldHolder}>
            <input
              type="text"
              name="title"
              id="title"
              value={eventState.title}
              onChange={handleChange}
              onBlur={handleBlur('title', false)}
              required
              className={`${styles.innerInput} ${styles.eventFormMidWidthInput} ${touchedFields.title ? styles.touched : ''}`}
            />
            <label htmlFor="title" className={styles.innerLabel}>
              Title
            </label>
          </div>
          <div className={styles.fieldHolder}>
            <input
              type="text"
              name="location"
              id="location"
              value={eventState.location}
              onChange={handleChange}
              onBlur={handleBlur('location', true)}
              className={`${styles.innerInput} ${styles.eventFormMidWidthInput} ${touchedFields.location ? styles.touched : ''}`}
            />
            <label htmlFor="location" className={styles.innerLabel}>
              Location
            </label>
          </div>
        </div>
        <div className={styles.fieldHolder}>
          <textarea
            name="description"
            id="description"
            value={eventState.description}
            onChange={handleChange}
            onBlur={handleBlur('description', true)}
            className={`${styles.innerInput} ${styles.eventFormLongWidthInput} ${touchedFields.description ? styles.touched : ''}`}
          />
          <label htmlFor="description" className={styles.innerLabel}>
            Description
          </label>
        </div>
        <div className={styles.fieldHolder}>
          <input
            type="text"
            name="link"
            id="link"
            value={eventState.link}
            onChange={handleChange}
            onBlur={handleBlur('link', true)}
            className={`${styles.innerInput} ${styles.eventFormLongWidthInput} ${touchedFields.link ? styles.touched : ''}`}
          />
          <label htmlFor="link" className={styles.innerLabel}>
            Link
          </label>
        </div>
        <div className={styles.eventFormInputContainer}>
          <div className={styles.fieldHolder}>
            <input
              type="date"
              name="scheduledDate"
              id="scheduledDate"
              value={eventState.scheduledDate}
              onChange={handleChange}
              onBlur={handleBlur('scheduledDate', true)}
              className={`${styles.innerInput} ${touchedFields.scheduledDate ? styles.touched : ''}`}
            />
            <label htmlFor="scheduledDate" className={styles.innerLabel}>
              Scheduled Date
            </label>
          </div>
          <div className={styles.fieldHolder}>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={eventState.startDate}
              onChange={handleChange}
              onBlur={handleBlur('startDate', true)}
              className={`${styles.innerInput} ${touchedFields.startDate ? styles.touched : ''}`}
            />
            <label htmlFor="startDate" className={styles.innerLabel}>
              Start Date
            </label>
          </div>
          <div className={styles.fieldHolder}>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={eventState.endDate}
              onChange={handleChange}
              onBlur={handleBlur('endDate', true)}
              className={`${styles.innerInput} ${touchedFields.endDate ? styles.touched : ''}`}
            />
            <label htmlFor="endDate" className={styles.innerLabel}>
              End Date
            </label>
          </div>
        </div>
        <div className={styles.eventFormBtnContainer}>
          <button type="submit" className={styles.eventFormBtn}>
            Save
          </button>
          <button type="button" className={styles.eventFormBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventForm
