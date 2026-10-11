import { Hono } from 'hono'
import { pool } from '../db.js'
import { hashPassword, issueToken } from '../auth.js'

export const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  const { email, name, password } = await c.req.json()
  if (!email || !name || !password) {
    return c.json({ error: 'email, name, password are required' }, 400)
  }
  const { rows } = await pool.query(
    'INSERT INTO users (email, name, password_md5) VALUES ($1, $2, $3) RETURNING id, email, name, role',
    [email, name, hashPassword(password)],
  )
  const user = rows[0]
  const token = issueToken({ userId: user.id, email: user.email, role: user.role })
  return c.json({ token, user }, 201)
})

authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const { rows } = await pool.query(
    'SELECT id, email, name, role, password_md5 FROM users WHERE email = $1',
    [email],
  )
  const user = rows[0]
  if (!user || user.password_md5 !== hashPassword(password)) {
    return c.json({ error: 'invalid credentials' }, 401)
  }
  const token = issueToken({ userId: user.id, email: user.email, role: user.role })
  return c.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})
