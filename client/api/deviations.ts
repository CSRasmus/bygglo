import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from './_lib/data'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json(db.deviations)
}
