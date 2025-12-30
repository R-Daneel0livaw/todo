import { IpcMainInvokeEvent, ipcMain } from 'electron'
import {
  assignTaskToVm,
  deleteVm,
  getRunningVms,
  getVm,
  getVmByName,
  getVmsByRole,
  listVms,
  registerVm,
  updateVmStatus,
  type VmRegistry,
  type VmRole,
  type VmStatus
} from '../database/VmRegistryManager'

export function setupVmRegistryHandlers() {
  ipcMain.handle(
    'register-vm',
    async (
      _: IpcMainInvokeEvent,
      name: string,
      role: VmRole,
      memoryMb?: number,
      cpus?: number,
      diskSizeMb?: number
    ): Promise<number> => {
      return registerVm(name, role, memoryMb, cpus, diskSizeMb)
    }
  )

  ipcMain.handle(
    'update-vm-status',
    async (_: IpcMainInvokeEvent, vmId: number, status: VmStatus): Promise<void> => {
      updateVmStatus(vmId, status)
    }
  )

  ipcMain.handle(
    'get-vm',
    async (_: IpcMainInvokeEvent, vmId: number): Promise<VmRegistry | undefined> => {
      return getVm(vmId)
    }
  )

  ipcMain.handle(
    'get-vm-by-name',
    async (_: IpcMainInvokeEvent, name: string): Promise<VmRegistry | undefined> => {
      return getVmByName(name)
    }
  )

  ipcMain.handle(
    'list-vms',
    async (_: IpcMainInvokeEvent, role?: VmRole): Promise<VmRegistry[]> => {
      return listVms(role)
    }
  )

  ipcMain.handle('get-running-vms', async (): Promise<VmRegistry[]> => {
    return getRunningVms()
  })

  ipcMain.handle(
    'get-vms-by-role',
    async (_: IpcMainInvokeEvent, role: VmRole): Promise<VmRegistry[]> => {
      return getVmsByRole(role)
    }
  )

  ipcMain.handle(
    'assign-task-to-vm',
    async (_: IpcMainInvokeEvent, vmId: number, taskId: number): Promise<void> => {
      assignTaskToVm(vmId, taskId)
    }
  )

  ipcMain.handle('delete-vm', async (_: IpcMainInvokeEvent, vmId: number): Promise<void> => {
    deleteVm(vmId)
  })
}
