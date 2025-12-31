import { Router, Request, Response } from 'express'
import * as VmRegistryManager from '../../database/VmRegistryManager.js'
import { VmRole, VmStatus } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/vms - Get all VMs
router.get('/', (req: Request, res: Response) => {
  try {
    const { role } = req.query
    const vms = role
      ? VmRegistryManager.listVms(role as VmRole)
      : VmRegistryManager.listVms()
    res.json(vms)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/vms/:id - Get VM by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const vm = VmRegistryManager.getVm(id)
    if (!vm) {
      return res.status(404).json({ error: 'VM not found' })
    }
    res.json(vm)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/vms/name/:name - Get VM by name
router.get('/name/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params
    const vm = VmRegistryManager.getVmByName(name)
    if (!vm) {
      return res.status(404).json({ error: 'VM not found' })
    }
    res.json(vm)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/vms/running - Get running VMs
router.get('/status/running', (req: Request, res: Response) => {
  try {
    const vms = VmRegistryManager.getRunningVms()
    res.json(vms)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/vms/role/:role - Get VMs by role
router.get('/role/:role', (req: Request, res: Response) => {
  try {
    const role = req.params.role as VmRole
    const vms = VmRegistryManager.getVmsByRole(role)
    res.json(vms)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/vms - Register new VM
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, role, memoryMb, cpus, diskSizeMb } = req.body

    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required' })
    }

    const id = VmRegistryManager.registerVm(name, role, memoryMb, cpus, diskSizeMb)
    res.status(201).json({ id, message: 'VM registered successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// PUT /api/vms/:id/status - Update VM status
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'status is required' })
    }

    VmRegistryManager.updateVmStatus(id, status as VmStatus)
    res.json({ message: 'VM status updated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/vms/:id/assign-task - Assign task to VM
router.post('/:id/assign-task', (req: Request, res: Response) => {
  try {
    const vmId = parseInt(req.params.id)
    const { taskId } = req.body

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' })
    }

    VmRegistryManager.assignTaskToVm(vmId, taskId)
    res.json({ message: 'Task assigned to VM successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/vms/:id - Delete VM
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    VmRegistryManager.deleteVm(id)
    res.json({ message: 'VM deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
