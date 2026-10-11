import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth.js'
import { orderRoutes } from './routes/orders.js'
import { adminRoutes } from './routes/admin.js'
import { profileRoutes } from './routes/profile.js'
import { productRoutes } from './routes/products.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
    allowHeaders: ['*', 'Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))

app.route('/api/auth', authRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/products', productRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/profile', profileRoutes)

app.onError((err, c) => {
  return c.json(
    {
      error: err.message,
      sql: (err as Error & { executedSql?: string }).executedSql,
      stack: err.stack,
      env: { node: process.version, databaseUrl: process.env.DATABASE_URL },
    },
    500,
  )
})

const port = Number(process.env.PORT || 3000)
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on :${port}`)
})
