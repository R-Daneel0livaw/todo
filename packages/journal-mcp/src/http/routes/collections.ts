import { Router, Request, Response } from 'express'
import * as CollectionManager from '../../database/CollectionManager.js'
import * as CollectionItemManager from '../../database/CollectionItemManager.js'
import { Collection } from '@awesome-dev-journal/shared'

const router = Router()

// GET /api/collections - Get all collections
router.get('/', (req: Request, res: Response) => {
  try {
    const collections = CollectionManager.getCollections()
    res.json(collections)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/collections/:id - Get collection by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const collection = CollectionManager.getCollection(id)
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }
    res.json(collection)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/collections/type/:type - Get collections by type
router.get('/type/:type', (req: Request, res: Response) => {
  try {
    const { type } = req.params
    const collections = CollectionManager.getCollectionsByType(type as any)
    res.json(collections)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/collections - Create new collection
router.post('/', (req: Request, res: Response) => {
  try {
    const collectionData = req.body as Collection
    const collectionId = CollectionManager.addCollection(collectionData)
    res.status(201).json({ id: collectionId, message: 'Collection created successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// PUT /api/collections/:id - Update collection
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const collectionData = { ...req.body, id }
    CollectionManager.updateCollection(collectionData)
    res.json({ message: 'Collection updated successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    CollectionManager.deleteCollection(id)
    res.json({ message: 'Collection deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/collections/:id/archive - Archive collection
router.post('/:id/archive', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    CollectionManager.archiveCollection(id)
    res.json({ message: 'Collection archived successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/collections/:id/items - Get items in collection
router.get('/:id/items', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const items = CollectionItemManager.getCollectionItems(id)
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/collections/:id/items - Add item to collection
router.post('/:id/items', (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.id)
    const { itemId, itemType } = req.body

    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'itemId and itemType are required' })
    }

    const id = CollectionItemManager.addToCollection(collectionId, itemId, itemType)
    res.status(201).json({ id, message: 'Item added to collection successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// DELETE /api/collections/:id/items - Remove item from collection
router.delete('/:id/items', (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.id)
    const { itemId, itemType } = req.body

    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'itemId and itemType are required' })
    }

    CollectionItemManager.removeFromCollection(collectionId, itemId, itemType)
    res.json({ message: 'Item removed from collection successfully' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
