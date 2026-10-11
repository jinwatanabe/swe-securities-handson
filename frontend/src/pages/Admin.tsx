import { useEffect, useState } from 'react'
import { api, type Order, type User } from '../api'

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')

  async function load() {
    try {
      const [o, u] = await Promise.all([
        api<Order[]>('/api/admin/orders'),
        api<User[]>('/api/admin/users'),
      ])
      setOrders(o)
      setUsers(u)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function changeRole(id: number, role: string) {
    await api(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
    await load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <h2>ユーザー管理</h2>
        <table>
          <thead><tr><th>ID</th><th>名前</th><th>メール</th><th>電話</th><th>ロール</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>全注文一覧</h2>
        <table>
          <thead><tr><th>ID</th><th>ユーザー</th><th>商品</th><th>金額</th><th>状態</th><th>メモ</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user_name}</td>
                <td>{o.item}</td>
                <td>¥{Number(o.amount).toLocaleString()}</td>
                <td>{o.status}</td>
                <td>{o.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
