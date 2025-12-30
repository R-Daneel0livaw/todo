import { Task, TaskDependency } from '.'

export interface TaskDependencyApi {
  addTaskDependency(
    taskId: number,
    dependsOnTaskId: number,
    dependencyType?: 'blocks' | 'related' | 'suggested',
    createdBy?: 'user' | 'ai_suggested'
  ): Promise<number>
  removeTaskDependency(dependencyId: number): Promise<void>
  getTaskDependencies(taskId: number): Promise<TaskDependency[]>
  getDependentTasks(taskId: number): Promise<TaskDependency[]>
  getUnblockedTasks(): Promise<Task[]>
  getBlockedTasks(): Promise<Task[]>
  getCriticalPath(): Promise<Task[]>
  getAllDependencies(taskId: number): Promise<TaskDependency[]>
}
