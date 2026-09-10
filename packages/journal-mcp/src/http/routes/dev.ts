import { Router, Request, Response } from 'express'
import { clearAllData, seedTestData } from '../../scripts/seed-test-data.js'

const router = Router()

// POST /api/dev/reset-db - Wipe all data and reseed with test data.
// Dev convenience only — mirrors `npm run db:reset`.
router.post('/reset-db', (_req: Request, res: Response) => {
  try {
    clearAllData()
    seedTestData()
    res.json({ message: 'Database reset and reseeded' })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
