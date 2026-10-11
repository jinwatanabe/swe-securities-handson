import { useState } from 'react'
import { api, setSession, type User } from '../api'

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login' ? { email, password } : { email, name, password }
      const res = await api<{ token: string; user: User }>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSession(res.token, res.user)
      onLogin(res.user)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <main style={{ maxWidth: 400 }}>
      <div className="card">
        <h2>{mode === 'login' ? 'ログイン' : 'ユーザー登録'}</h2>
        <form onSubmit={submit}>
          <label>メールアドレス</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === 'register' && (
            <>
              <label>名前</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </>
          )}
          <label>パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button type="submit">{mode === 'login' ? 'ログイン' : '登録'}</button>
            <button
              type="button"
              className="secondary"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? '新規登録へ' : 'ログインへ'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </main>
  )
}
