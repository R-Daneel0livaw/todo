import { BaseItem, ProjectStatus, Task } from '.'

export interface Project extends BaseItem {
  status: ProjectStatus
  tasks?: (Task | Event)[]
  dueDate?: Date
}
