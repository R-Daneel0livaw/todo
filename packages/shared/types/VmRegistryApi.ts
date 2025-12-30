import { VmRegistry, VmRole, VmStatus } from '.'

export interface VmRegistryApi {
  registerVm(
    name: string,
    role: VmRole,
    memoryMb?: number,
    cpus?: number,
    diskSizeMb?: number
  ): Promise<number>
  updateVmStatus(vmId: number, status: VmStatus): Promise<void>
  getVm(vmId: number): Promise<VmRegistry>
  getVmByName(name: string): Promise<VmRegistry>
  listVms(role?: VmRole): Promise<VmRegistry[]>
  getRunningVms(): Promise<VmRegistry[]>
  getVmsByRole(role: VmRole): Promise<VmRegistry[]>
  assignTaskToVm(vmId: number, taskId: number): Promise<void>
  deleteVm(vmId: number): Promise<void>
}
