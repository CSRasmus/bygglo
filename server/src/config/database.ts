import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'platsledning_ai',
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params)
}

export const getClient = () => {
  return pool.connect()
}

export default pool
