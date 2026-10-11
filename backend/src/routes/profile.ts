import { Hono } from 'hono'
import axios from 'axios'
import _ from 'lodash'
import { pool } from '../db.js'
import { authMiddleware, type TokenPayload } from '../auth.js'

type Env = { Variables: { user: TokenPayload } }

export const profileRoutes = new Hono<Env>()

profileRoutes.use('*', authMiddleware)

profileRoutes.get('/', async (c) => {
  const user = c.get('user')
  const { rows } = await pool.query(
    'SELECT id, email, name, role, avatar_url, phone FROM users WHERE id = $1',
    [user.userId],
  )
  return c.json(rows[0] ?? null)
})

profileRoutes.put('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const fields = _.pick(body, ['name', 'phone', 'avatar_url'])
  const { rows } = await pool.query(
    `UPDATE users
        SET name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            avatar_url = COALESCE($3, avatar_url)
      WHERE id = $4
      RETURNING id, email, name, role, avatar_url, phone`,
    [fields.name ?? null, fields.phone ?? null, fields.avatar_url ?? null, user.userId],
  )
  return c.json(rows[0])
})

profileRoutes.post('/avatar/preview', async (c) => {
  const { url } = await c.req.json()
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 })
  const contentType = String(res.headers['content-type'] || 'application/octet-stream')
  const base64 = Buffer.from(res.data).toString('base64')
  return c.json({
    contentType,
    size: res.data.byteLength,
    dataUrl: `data:${contentType};base64,${base64}`,
    text: contentType.startsWith('text/') ? Buffer.from(res.data).toString('utf8') : undefined,
  })
})
