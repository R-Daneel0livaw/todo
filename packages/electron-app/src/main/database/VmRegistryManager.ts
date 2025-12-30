import db from './sqlite'

export type VmRole = 'security' | 'build' | 'test' | 'data' | 'general'
export type VmStatus = 'running' | 'stopped' | 'paused' | 'error'

export interface VmRegistry {
  id: number
  name: string
  role: VmRole
  status: VmStatus
  memory_mb?: number
  cpus?: number
  disk_size_mb?: number
  created_at: Date
  last_started_at?: Date
  last_stopped_at?: Date
  last_task_id?: number
}

export function registerVm(
  name: string,
  role: VmRole,
  memoryMb?: number,
  cpus?: number,
  diskSizeMb?: number
): number {
  const stmt = db.prepare(`
    INSERT INTO vm_registry (name, role, memory_mb, cpus, disk_size_mb, status)
    VALUES (?, ?, ?, ?, ?, 'stopped')
  `)
  const result = stmt.run(name, role, memoryMb || null, cpus || null, diskSizeMb || null)
  return result.lastInsertRowid as number
}

export function updateVmStatus(vmId: number, status: VmStatus) {
  const now = new Date().toISOString()
  let stmt

  if (status === 'running') {
    stmt = db.prepare(`
      UPDATE vm_registry
      SET status = ?, last_started_at = ?
      WHERE id = ?
    `)
    stmt.run(status, now, vmId)
  } else if (status === 'stopped') {
    stmt = db.prepare(`
      UPDATE vm_registry
      SET status = ?, last_stopped_at = ?
      WHERE id = ?
    `)
    stmt.run(status, now, vmId)
  } else {
    stmt = db.prepare(`
      UPDATE vm_registry
      SET status = ?
      WHERE id = ?
    `)
    stmt.run(status, vmId)
  }
}

export function getVm(vmId: number): VmRegistry | undefined {
  const stmt = db.prepare('SELECT * FROM vm_registry WHERE id = ?')
  const vm = stmt.get(vmId) as any

  if (!vm) return undefined

  return {
    ...vm,
    created_at: new Date(vm.created_at),
    last_started_at: vm.last_started_at ? new Date(vm.last_started_at) : undefined,
    last_stopped_at: vm.last_stopped_at ? new Date(vm.last_stopped_at) : undefined
  }
}

export function getVmByName(name: string): VmRegistry | undefined {
  const stmt = db.prepare('SELECT * FROM vm_registry WHERE name = ?')
  const vm = stmt.get(name) as any

  if (!vm) return undefined

  return {
    ...vm,
    created_at: new Date(vm.created_at),
    last_started_at: vm.last_started_at ? new Date(vm.last_started_at) : undefined,
    last_stopped_at: vm.last_stopped_at ? new Date(vm.last_stopped_at) : undefined
  }
}

export function listVms(role?: VmRole): VmRegistry[] {
  let stmt

  if (role) {
    stmt = db.prepare('SELECT * FROM vm_registry WHERE role = ? ORDER BY name')
    const vms = stmt.all(role) as any[]
    return vms.map((vm) => ({
      ...vm,
      created_at: new Date(vm.created_at),
      last_started_at: vm.last_started_at ? new Date(vm.last_started_at) : undefined,
      last_stopped_at: vm.last_stopped_at ? new Date(vm.last_stopped_at) : undefined
    }))
  }

  stmt = db.prepare('SELECT * FROM vm_registry ORDER BY name')
  const vms = stmt.all() as any[]
  return vms.map((vm) => ({
    ...vm,
    created_at: new Date(vm.created_at),
    last_started_at: vm.last_started_at ? new Date(vm.last_started_at) : undefined,
    last_stopped_at: vm.last_stopped_at ? new Date(vm.last_stopped_at) : undefined
  }))
}

export function deleteVm(vmId: number) {
  const stmt = db.prepare('DELETE FROM vm_registry WHERE id = ?')
  stmt.run(vmId)
}

export function assignTaskToVm(vmId: number, taskId: number) {
  const stmt = db.prepare(`
    UPDATE vm_registry
    SET last_task_id = ?
    WHERE id = ?
  `)
  stmt.run(taskId, vmId)
}

export function getRunningVms(): VmRegistry[] {
  const stmt = db.prepare("SELECT * FROM vm_registry WHERE status = 'running' ORDER BY name")
  const vms = stmt.all() as any[]
  return vms.map((vm) => ({
    ...vm,
    created_at: new Date(vm.created_at),
    last_started_at: vm.last_started_at ? new Date(vm.last_started_at) : undefined,
    last_stopped_at: vm.last_stopped_at ? new Date(vm.last_stopped_at) : undefined
  }))
}

export function getVmsByRole(role: VmRole): VmRegistry[] {
  return listVms(role)
}
