const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export interface User {
  id: number
  email: string
  name: string
  role: string
  avatar_url?: string | null
  phone?: string | null
}

export interface Order {
  id: number
  user_id: number
  item: string
  quantity: number
  amount: number
  status: string
  note: string | null
  created_at: string
  user_email?: string
  user_name?: string
}

export interface Product {
  id: number
  name: string
  sku: string
  category: string
  stock: number
  price: number
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setSession(token: string, user: User) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user')
  return raw ? (JSON.parse(raw) as User) : null
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (body && body.stack) {
      throw new Error(JSON.stringify(body, null, 2))
    }
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return body as T
}
