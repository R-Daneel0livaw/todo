import { VmRole, VmStatus } from '@awesome-dev-journal/shared'
import { IpcMainInvokeEvent, ipcMain } from 'electron'
import * as JournalClient from '../api/journal-client'

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
      const result = await JournalClient.registerVm(name, role, memoryMb, cpus, diskSizeMb)
      return result.id
    }
  )

  ipcMain.handle(
    'update-vm-status',
    async (_: IpcMainInvokeEvent, vmId: number, status: VmStatus): Promise<void> => {
      await JournalClient.updateVmStatus(vmId, status)
    }
  )

  ipcMain.handle(
    'get-vm',
    async (_: IpcMainInvokeEvent, vmId: number): Promise<any> => {
      return JournalClient.getVm(vmId)
    }
  )

  ipcMain.handle(
    'get-vm-by-name',
    async (_: IpcMainInvokeEvent, name: string): Promise<any> => {
      return JournalClient.getVmByName(name)
    }
  )

  ipcMain.handle(
    'list-vms',
    async (_: IpcMainInvokeEvent, role?: VmRole): Promise<any[]> => {
      return JournalClient.getAllVms(role)
    }
  )

  ipcMain.handle('get-running-vms', async (): Promise<any[]> => {
    return JournalClient.getRunningVms()
  })

  ipcMain.handle(
    'get-vms-by-role',
    async (_: IpcMainInvokeEvent, role: VmRole): Promise<any[]> => {
      return JournalClient.getVmsByRole(role)
    }
  )

  ipcMain.handle(
    'assign-task-to-vm',
    async (_: IpcMainInvokeEvent, vmId: number, taskId: number): Promise<void> => {
      await JournalClient.assignTaskToVm(vmId, taskId)
    }
  )

  ipcMain.handle('delete-vm', async (_: IpcMainInvokeEvent, vmId: number): Promise<void> => {
    await JournalClient.deleteVm(vmId)
  })
}
