import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as VmRegistryManager from '../../database/VmRegistryManager.js'
import { VmRole, VmStatus } from '../../database/VmRegistryManager.js'

export function getVmTools(): Tool[] {
  return [
    {
      name: 'register_vm',
      description: 'Register a new VM in the registry',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the VM'
          },
          role: {
            type: 'string',
            enum: ['security', 'build', 'test', 'data', 'general'],
            description: 'Role of the VM'
          },
          memory_mb: {
            type: 'number',
            description: 'Memory in MB'
          },
          cpus: {
            type: 'number',
            description: 'Number of CPUs'
          },
          disk_size_mb: {
            type: 'number',
            description: 'Disk size in MB'
          }
        },
        required: ['name', 'role']
      }
    },
    {
      name: 'get_vm',
      description: 'Get details of a specific VM',
      inputSchema: {
        type: 'object',
        properties: {
          vm_id: {
            type: 'number',
            description: 'ID of the VM'
          }
        },
        required: ['vm_id']
      }
    },
    {
      name: 'list_vms',
      description: 'List all VMs, optionally filtered by role',
      inputSchema: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['security', 'build', 'test', 'data', 'general'],
            description: 'Optional: Filter by role'
          }
        }
      }
    },
    {
      name: 'update_vm_status',
      description: 'Update the status of a VM',
      inputSchema: {
        type: 'object',
        properties: {
          vm_id: {
            type: 'number',
            description: 'ID of the VM'
          },
          status: {
            type: 'string',
            enum: ['running', 'stopped', 'paused', 'error'],
            description: 'New status'
          }
        },
        required: ['vm_id', 'status']
      }
    },
    {
      name: 'assign_task_to_vm',
      description: 'Assign a task to a VM',
      inputSchema: {
        type: 'object',
        properties: {
          vm_id: {
            type: 'number',
            description: 'ID of the VM'
          },
          task_id: {
            type: 'number',
            description: 'ID of the task'
          }
        },
        required: ['vm_id', 'task_id']
      }
    },
    {
      name: 'delete_vm',
      description: 'Delete a VM from the registry',
      inputSchema: {
        type: 'object',
        properties: {
          vm_id: {
            type: 'number',
            description: 'ID of the VM to delete'
          }
        },
        required: ['vm_id']
      }
    },
    {
      name: 'get_running_vms',
      description: 'Get all VMs that are currently running',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}

export async function handleVmTools(toolName: string, args: any) {
  switch (toolName) {
    case 'register_vm': {
      const result = VmRegistryManager.registerVm(
        args.name,
        args.role as VmRole,
        args.memory_mb,
        args.cpus,
        args.disk_size_mb
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              vm_id: result,
              message: `VM registered: ${args.name}`
            }, null, 2)
          }
        ]
      }
    }

    case 'get_vm': {
      const vm = VmRegistryManager.getVm(args.vm_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              vm
            }, null, 2)
          }
        ]
      }
    }

    case 'list_vms': {
      const vms = args.role
        ? VmRegistryManager.listVms(args.role as VmRole)
        : VmRegistryManager.listVms()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: vms.length,
              vms
            }, null, 2)
          }
        ]
      }
    }

    case 'update_vm_status': {
      VmRegistryManager.updateVmStatus(args.vm_id, args.status as VmStatus)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              vm_id: args.vm_id,
              status: args.status,
              message: 'VM status updated'
            }, null, 2)
          }
        ]
      }
    }

    case 'assign_task_to_vm': {
      VmRegistryManager.assignTaskToVm(args.vm_id, args.task_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              vm_id: args.vm_id,
              task_id: args.task_id,
              message: 'Task assigned to VM'
            }, null, 2)
          }
        ]
      }
    }

    case 'delete_vm': {
      VmRegistryManager.deleteVm(args.vm_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              vm_id: args.vm_id,
              message: 'VM deleted'
            }, null, 2)
          }
        ]
      }
    }

    case 'get_running_vms': {
      const vms = VmRegistryManager.getRunningVms()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: vms.length,
              vms
            }, null, 2)
          }
        ]
      }
    }

    default:
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'UNKNOWN_TOOL',
              message: `Unknown VM tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
