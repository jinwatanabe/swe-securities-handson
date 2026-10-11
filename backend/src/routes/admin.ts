import { Hono } from 'hono'
import { pool } from '../db.js'
import { authMiddleware, type TokenPayload } from '../auth.js'

type Env = { Variables: { user: TokenPayload } }

export const adminRoutes = new Hono<Env>()

adminRoutes.use('*', authMiddleware)

adminRoutes.get('/orders', async (c) => {
  const { rows } = await pool.query(
    `SELECT o.*, u.email AS user_email, u.name AS user_name
       FROM orders o JOIN users u ON u.id = o.user_id
      ORDER BY o.id DESC`,
  )
  return c.json(rows)
})

adminRoutes.get('/users', async (c) => {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY id')
  return c.json(rows)
})

adminRoutes.patch('/users/:id/role', async (c) => {
  const id = c.req.param('id')
  const { role } = await c.req.json()
  const { rows } = await pool.query(
    'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
    [role, id],
  )
  if (rows.length === 0) {
    return c.json({ error: 'not found' }, 404)
  }
  return c.json(rows[0])
})
