import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query as any
    const result = await query(
      `SELECT co.* FROM change_orders co
       JOIN user_projects up ON up.project_id = co.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND co.project_id = $2' : ''}
       ORDER BY co.created_at DESC`,
      project_id ? [req.userId, project_id] : [req.userId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, title, amount = 0, status = 'utkast', description, subcontractor_id } = req.body as any
    if (!project_id || !title) return res.status(400).json({ error: 'project_id och title krävs' })
    const result = await query(
      `INSERT INTO change_orders (project_id, title, amount, status, description, subcontractor_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [project_id, title, amount, status, description, subcontractor_id || null, req.userId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM change_orders WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'ÄTA hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, amount, status, description } = req.body
    const result = await query(
      `UPDATE change_orders SET
        title = COALESCE($1, title), amount = COALESCE($2, amount),
        status = COALESCE($3, status), description = COALESCE($4, description),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [title, amount, status, description, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'ÄTA hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM change_orders WHERE id = $1', [req.params.id])
    res.json({ message: 'ÄTA borttagen' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
