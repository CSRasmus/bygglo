import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query
    const result = await query(
      `SELECT a.* FROM activities a
       JOIN user_projects up ON up.project_id = a.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND a.project_id = $2' : ''}
       ORDER BY a.start_date`,
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
    const { project_id, name, start_date, end_date, progress = 0, status = 'ej_redo', dependencies = [], trades = [] } = req.body
    if (!project_id || !name || !start_date || !end_date) {
      return res.status(400).json({ error: 'project_id, name, start_date och end_date krävs' })
    }
    const result = await query(
      `INSERT INTO activities (project_id, name, start_date, end_date, progress, status, dependencies, trades)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [project_id, name, start_date, end_date, progress, status, dependencies, trades]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM activities WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aktivitet hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, start_date, end_date, progress, status, dependencies, trades } = req.body
    const result = await query(
      `UPDATE activities SET
        name = COALESCE($1, name),
        start_date = COALESCE($2, start_date),
        end_date = COALESCE($3, end_date),
        progress = COALESCE($4, progress),
        status = COALESCE($5, status),
        dependencies = COALESCE($6, dependencies),
        trades = COALESCE($7, trades),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, start_date, end_date, progress, status, dependencies, trades, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aktivitet hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM activities WHERE id = $1', [req.params.id])
    res.json({ message: 'Aktivitet borttagen' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
