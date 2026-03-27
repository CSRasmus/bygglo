import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query as any
    const result = await query(
      `SELECT dl.* FROM daily_logs dl
       JOIN user_projects up ON up.project_id = dl.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND dl.project_id = $2' : ''}
       ORDER BY dl.date DESC`,
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
    const { project_id, date, weather, personnel_own = 0, personnel_subcontractors = 0, equipment = [], activities_text = [], deliveries = [], notes } = req.body as any
    if (!project_id || !date) return res.status(400).json({ error: 'project_id och date krävs' })
    const result = await query(
      `INSERT INTO daily_logs (project_id, date, weather, personnel_own, personnel_subcontractors, equipment, activities_text, deliveries, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [project_id, date, weather, personnel_own, personnel_subcontractors, equipment, activities_text, deliveries, notes, req.userId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM daily_logs WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dagbok hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { weather, personnel_own, personnel_subcontractors, equipment, activities_text, deliveries, notes } = req.body
    const result = await query(
      `UPDATE daily_logs SET
        weather = COALESCE($1, weather),
        personnel_own = COALESCE($2, personnel_own),
        personnel_subcontractors = COALESCE($3, personnel_subcontractors),
        equipment = COALESCE($4, equipment),
        activities_text = COALESCE($5, activities_text),
        deliveries = COALESCE($6, deliveries),
        notes = COALESCE($7, notes),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [weather, personnel_own, personnel_subcontractors, equipment, activities_text, deliveries, notes, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dagbok hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM daily_logs WHERE id = $1', [req.params.id])
    res.json({ message: 'Dagbok borttagen' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
