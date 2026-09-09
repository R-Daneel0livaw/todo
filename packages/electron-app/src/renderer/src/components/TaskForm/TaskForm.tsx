import { Task } from '@awesome-dev-journal/shared'
import { FormEvent, useState } from 'react'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  onSave: (task: Task) => void
  onCancel: () => void
}

interface TaskFormState {
  title: string
  topic: string
  description: string
  startDate: string
  endDate: string
}

const emptyState: TaskFormState = {
  title: '',
  topic: '',
  description: '',
  startDate: '',
  endDate: ''
}

interface TouchedFields {
  [key: string]: boolean
}

const TaskForm = ({ onSave, onCancel }: TaskFormProps) => {
  const [taskState, setTaskState] = useState<TaskFormState>(emptyState)
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setTaskState((prev) => ({ ...prev, [name]: value }))
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
    const task: Task = {
      id: 0,
      title: taskState.title,
      description: taskState.description || undefined,
      topic: taskState.topic,
      status: 'CREATED',
      createDate: new Date(),
      startDate: taskState.startDate ? new Date(taskState.startDate) : undefined,
      endDate: taskState.endDate ? new Date(taskState.endDate) : undefined
    }
    onSave(task)
  }

  return (
    <div className={styles.taskFormContainer}>
      <h2 className={styles.taskFormTitle}>Add Task</h2>
      <form className={styles.taskForm} onSubmit={handleSubmit}>
        <div className={styles.taskFormInputContainer}>
          <div className={styles.fieldHolder}>
            <input
              type="text"
              name="title"
              id="title"
              value={taskState.title}
              onChange={handleChange}
              onBlur={handleBlur('title', false)}
              required
              className={`${styles.innerInput} ${styles.taskFormMidWidthInput} ${touchedFields.title ? styles.touched : ''}`}
            />
            <label htmlFor="title" className={styles.innerLabel}>
              Title
            </label>
          </div>
          <div className={styles.fieldHolder}>
            <input
              type="text"
              name="topic"
              id="topic"
              value={taskState.topic}
              onChange={handleChange}
              onBlur={handleBlur('topic', false)}
              required
              className={`${styles.innerInput} ${styles.taskFormMidWidthInput} ${touchedFields.topic ? styles.touched : ''}`}
            />
            <label htmlFor="topic" className={styles.innerLabel}>
              Topic
            </label>
          </div>
        </div>
        <div className={styles.fieldHolder}>
          <textarea
            name="description"
            id="description"
            value={taskState.description}
            onChange={handleChange}
            onBlur={handleBlur('description', true)}
            className={`${styles.innerInput} ${styles.taskFormLongWidthInput} ${touchedFields.description ? styles.touched : ''}`}
          />
          <label htmlFor="description" className={styles.innerLabel}>
            Description
          </label>
        </div>
        <div className={styles.taskFormInputContainer}>
          <div className={styles.fieldHolder}>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={taskState.startDate}
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
              value={taskState.endDate}
              onChange={handleChange}
              onBlur={handleBlur('endDate', true)}
              className={`${styles.innerInput} ${touchedFields.endDate ? styles.touched : ''}`}
            />
            <label htmlFor="endDate" className={styles.innerLabel}>
              End Date
            </label>
          </div>
        </div>
        <div className={styles.taskFormBtnContainer}>
          <button type="submit" className={styles.taskFormBtn}>
            Save
          </button>
          <button type="button" className={styles.taskFormBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm
