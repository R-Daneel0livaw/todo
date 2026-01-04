import { Tool } from '@modelcontextprotocol/sdk/types.js'
import * as CollectionManager from '../../database/CollectionManager.js'
import * as CollectionItemManager from '../../database/CollectionItemManager.js'
import { Collection } from '@awesome-dev-journal/shared'

export function getCollectionTools(): Tool[] {
  return [
    {
      name: 'create_collection',
      description: 'Create a new collection (project, monthly plan, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the collection'
          },
          description: {
            type: 'string',
            description: 'Short description'
          },
          type: {
            type: 'string',
            enum: ['PROJECT', 'DAILY', 'MONTHLY', 'QUARTERLY', 'DEFAULT', 'CUSTOM'],
            description: 'Type of collection'
          },
          subType: {
            type: 'string',
            enum: ['TASK', 'EVENT', 'PLAN', 'LOG', 'CUSTOM'],
            description: 'Sub-type of collection'
          }
        },
        required: ['title', 'type', 'subType']
      }
    },
    {
      name: 'list_collections',
      description: 'List all collections',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_collection',
      description: 'Get details of a specific collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection'
          }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'update_collection',
      description: 'Update an existing collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection to update'
          },
          title: {
            type: 'string',
            description: 'New title'
          },
          description: {
            type: 'string',
            description: 'New description'
          }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'delete_collection',
      description: 'Delete a collection permanently',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection to delete'
          }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'archive_collection',
      description: 'Archive a collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection to archive'
          }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'get_collections_by_type',
      description: 'Get collections filtered by type',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['PROJECT', 'DAILY', 'MONTHLY', 'QUARTERLY', 'DEFAULT', 'CUSTOM'],
            description: 'Collection type to filter by'
          }
        },
        required: ['type']
      }
    },
    {
      name: 'search_collections',
      description: 'Search collections by title or description',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          }
        },
        required: ['query']
      }
    },
    {
      name: 'add_to_collection',
      description: 'Add a task, event, or sub-collection to a collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection to add to'
          },
          item_id: {
            type: 'number',
            description: 'ID of the task, event, or collection to add'
          },
          item_type: {
            type: 'string',
            enum: ['Task', 'Event', 'Collection'],
            description: 'Type of item being added'
          }
        },
        required: ['collection_id', 'item_id', 'item_type']
      }
    },
    {
      name: 'remove_from_collection',
      description: 'Remove an item from a collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection'
          },
          item_id: {
            type: 'number',
            description: 'ID of the item to remove'
          },
          item_type: {
            type: 'string',
            enum: ['Task', 'Event', 'Collection'],
            description: 'Type of item being removed'
          }
        },
        required: ['collection_id', 'item_id', 'item_type']
      }
    },
    {
      name: 'get_collection_items',
      description: 'Get all items (tasks, events) in a collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection'
          }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'get_item_collections',
      description: 'Get all collections containing a specific item',
      inputSchema: {
        type: 'object',
        properties: {
          item_id: {
            type: 'number',
            description: 'ID of the item'
          },
          item_type: {
            type: 'string',
            enum: ['Task', 'Event', 'Collection'],
            description: 'Type of item'
          }
        },
        required: ['item_id', 'item_type']
      }
    },
    {
      name: 'is_item_in_collection',
      description: 'Check if an item is in a specific collection',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: {
            type: 'number',
            description: 'ID of the collection'
          },
          item_id: {
            type: 'number',
            description: 'ID of the item'
          },
          item_type: {
            type: 'string',
            enum: ['Task', 'Event', 'Collection'],
            description: 'Type of item'
          }
        },
        required: ['collection_id', 'item_id', 'item_type']
      }
    }
  ]
}

export async function handleCollectionTools(toolName: string, args: any) {
  switch (toolName) {
    case 'create_collection': {
      const collectionData: Collection = {
        id: 0, // Will be set by database
        title: args.title,
        description: args.description || '',
        longDescription: undefined,
        type: args.type,
        subType: args.subType,
        createDate: new Date(),
        startDate: undefined,
        endDate: undefined,
        canceledDate: undefined,
        archived_at: undefined,
        metadata: {}
      }

      const result = CollectionManager.addCollection(collectionData)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collection_id: result,
              message: `Collection created: "${args.title}"`
            }, null, 2)
          }
        ]
      }
    }

    case 'list_collections': {
      const collections = CollectionManager.getCollections()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: collections.length,
              collections
            }, null, 2)
          }
        ]
      }
    }

    case 'get_collection': {
      const collection = CollectionManager.getCollection(args.collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collection
            }, null, 2)
          }
        ]
      }
    }

    case 'update_collection': {
      const existingCollection = CollectionManager.getCollection(args.collection_id)
      const updatedCollection = CollectionManager.updateCollection({
        ...existingCollection,
        id: args.collection_id,
        title: args.title !== undefined ? args.title : existingCollection.title,
        description: args.description !== undefined ? args.description : existingCollection.description
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collection: updatedCollection,
              message: 'Collection updated'
            }, null, 2)
          }
        ]
      }
    }

    case 'delete_collection': {
      CollectionManager.deleteCollection(args.collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Collection deleted'
            }, null, 2)
          }
        ]
      }
    }

    case 'archive_collection': {
      CollectionManager.archiveCollection(args.collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Collection archived'
            }, null, 2)
          }
        ]
      }
    }

    case 'get_collections_by_type': {
      const collections = CollectionManager.getCollectionsByType(args.type)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: collections.length,
              collections
            }, null, 2)
          }
        ]
      }
    }

    case 'search_collections': {
      const allCollections = CollectionManager.getCollections()
      const query = args.query.toLowerCase()
      const results = allCollections.filter(c => {
        const titleMatch = c.title.toLowerCase().includes(query)
        const descMatch = c.description?.toLowerCase().includes(query)
        return titleMatch || descMatch
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              query: args.query,
              count: results.length,
              collections: results
            }, null, 2)
          }
        ]
      }
    }

    case 'add_to_collection': {
      const result = CollectionItemManager.addToCollection(
        args.collection_id,
        args.item_id,
        args.item_type
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collection_item_id: result,
              message: `${args.item_type} added to collection`
            }, null, 2)
          }
        ]
      }
    }

    case 'remove_from_collection': {
      CollectionItemManager.removeFromCollection(
        args.collection_id,
        args.item_id,
        args.item_type
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `${args.item_type} removed from collection`
            }, null, 2)
          }
        ]
      }
    }

    case 'get_collection_items': {
      const items = CollectionItemManager.getCollectionItems(args.collection_id)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: items.length,
              items
            }, null, 2)
          }
        ]
      }
    }

    case 'get_item_collections': {
      const collections = CollectionItemManager.getItemCollections(args.item_id, args.item_type)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: collections.length,
              collections
            }, null, 2)
          }
        ]
      }
    }

    case 'is_item_in_collection': {
      const isInCollection = CollectionItemManager.isItemInCollection(
        args.collection_id,
        args.item_id,
        args.item_type
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              is_in_collection: isInCollection
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
              message: `Unknown collection tool: ${toolName}`
            })
          }
        ],
        isError: true
      }
  }
}
