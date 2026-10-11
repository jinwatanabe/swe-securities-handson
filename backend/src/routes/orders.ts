import { Hono } from 'hono'
import { pool } from '../db.js'
import { authMiddleware, type TokenPayload } from '../auth.js'

type Env = { Variables: { user: TokenPayload } }

export const orderRoutes = new Hono<Env>()

orderRoutes.use('*', authMiddleware)

orderRoutes.get('/', async (c) => {
  const user = c.get('user')
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC',
    [user.userId],
  )
  return c.json(rows)
})

orderRoutes.get('/search', async (c) => {
  const user = c.get('user')
  const q = c.req.query('q') || ''
  const sql =
    "SELECT * FROM orders WHERE user_id = " +
    user.userId +
    " AND (item ILIKE '%" +
    q +
    "%' OR note ILIKE '%" +
    q +
    "%') ORDER BY id DESC"
  try {
    const { rows } = await pool.query(sql)
    return c.json(rows)
  } catch (err) {
    ;(err as Error & { executedSql?: string }).executedSql = sql
    throw err
  }
})

orderRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
  if (rows.length === 0) {
    return c.json({ error: 'not found' }, 404)
  }
  return c.json(rows[0])
})

orderRoutes.post('/', async (c) => {
  const user = c.get('user')
  const { item, quantity, amount, note } = await c.req.json()
  const { rows } = await pool.query(
    'INSERT INTO orders (user_id, item, quantity, amount, note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [user.userId, item, quantity ?? 1, amount ?? 0, note ?? null],
  )
  return c.json(rows[0], 201)
})

orderRoutes.post('/:id/cancel', async (c) => {
  const id = c.req.param('id')
  const { rows } = await pool.query(
    "UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *",
    [id],
  )
  if (rows.length === 0) {
    return c.json({ error: 'not found' }, 404)
  }
  return c.json(rows[0])
})
