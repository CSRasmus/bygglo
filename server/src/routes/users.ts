import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, email, name, role, created_at FROM users ORDER BY name')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Användare hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.userId !== req.params.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Ej behörig' })
    }
    const { name, role } = req.body as any
    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role), updated_at = NOW()
       WHERE id = $3 RETURNING id, email, name, role, updated_at`,
      [name, role, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Användare hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
