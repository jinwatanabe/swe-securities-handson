import { useEffect, useState } from 'react'
import { api, clearSession, getStoredUser, type User } from './api'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

type Page = 'orders' | 'products' | 'profile' | 'admin'

export default function App() {
  const [user, setUser] = useState<User | null>(getStoredUser())
  const [whoami, setWhoami] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('orders')

  useEffect(() => {
    if (!user) {
      setWhoami(null)
      return
    }
    api<User>('/api/profile')
      .then(setWhoami)
      .catch(() => setWhoami(null))
  }, [user])

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const current = whoami ?? user

  return (
    <>
      <header>
        <strong>注文管理</strong>
        <nav>
          <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}>注文</button>
          <button className={page === 'products' ? 'active' : ''} onClick={() => setPage('products')}>在庫</button>
          <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>プロフィール</button>
          <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>管理</button>
        </nav>
        <span>{current.name}（{current.email}）／ ロール: <strong>{current.role}</strong></span>
        <button onClick={() => { clearSession(); setUser(null) }}>ログアウト</button>
      </header>
      <main>
        {page === 'orders' && <Orders />}
        {page === 'products' && <Products />}
        {page === 'profile' && <Profile onUpdate={setUser} />}
        {page === 'admin' && <Admin />}
      </main>
    </>
  )
}
