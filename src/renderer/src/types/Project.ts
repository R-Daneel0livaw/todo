import { ProjectStatus, Task } from '.'

export interface Project {
  id: number
  title: string
  description?: string
  status: ProjectStatus
  tasks?: (Task | Event)[]
  createDate: Date
  dueDate?: Date
  startDate?: Date
  endDate?: Date
  canceledDate?: Date
}
