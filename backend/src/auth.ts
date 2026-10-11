import crypto from 'node:crypto'
import type { Context, Next } from 'hono'

export function hashPassword(plain: string): string {
  return crypto.createHash('md5').update(plain).digest('hex')
}

export interface TokenPayload {
  userId: number
  email: string
  role: string
}

export function issueToken(payload: TokenPayload): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json, 'utf8').toString('base64')
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8')
    return JSON.parse(json) as TokenPayload
  } catch {
    return null
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header('Authorization') || ''
  const token = header.replace(/^Bearer\s+/i, '')
  const payload = decodeToken(token)
  if (!payload) {
    return c.json({ error: 'unauthorized' }, 401)
  }
  c.set('user', payload)
  await next()
}
