import { Hono } from 'hono'
import { pool } from '../db.js'
import { authMiddleware, type TokenPayload } from '../auth.js'

type Env = { Variables: { user: TokenPayload } }

export const productRoutes = new Hono<Env>()

productRoutes.use('*', authMiddleware)

productRoutes.get('/', async (c) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id')
  return c.json(rows)
})

productRoutes.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  const sql =
    "SELECT * FROM products WHERE name ILIKE '%" +
    q +
    "%' OR sku ILIKE '%" +
    q +
    "%' ORDER BY id"
  try {
    const { rows } = await pool.query(sql)
    return c.json(rows)
  } catch (err) {
    ;(err as Error & { executedSql?: string }).executedSql = sql
    throw err
  }
})
