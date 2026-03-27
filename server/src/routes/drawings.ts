import { Router, Request, Response } from 'express'
import { query } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { project_id } = req.query as any
    const result = await query(
      `SELECT dr.* FROM drawings dr
       JOIN user_projects up ON up.project_id = dr.project_id
       WHERE up.user_id = $1 ${project_id ? 'AND dr.project_id = $2' : ''}
       ORDER BY dr.created_at DESC`,
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
    const { project_id, name, version = 1, file_url, folder = 'Allmänt' } = req.body as any
    if (!project_id || !name || !file_url) return res.status(400).json({ error: 'project_id, name och file_url krävs' })
    const result = await query(
      `INSERT INTO drawings (project_id, name, version, file_url, folder, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [project_id, name, version, file_url, folder, req.userId]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM drawings WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ritning hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, folder } = req.body
    const result = await query(
      `UPDATE drawings SET name = COALESCE($1, name), folder = COALESCE($2, folder) WHERE id = $3 RETURNING *`,
      [name, folder, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ritning hittades inte' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM drawings WHERE id = $1', [req.params.id])
    res.json({ message: 'Ritning borttagen' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internt serverfel' })
  }
})

export default router
