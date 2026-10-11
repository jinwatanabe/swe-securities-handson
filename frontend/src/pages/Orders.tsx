import { useEffect, useState } from 'react'
import { api, type Order } from '../api'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [q, setQ] = useState('')
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')
  const [detail, setDetail] = useState<Order | null>(null)
  const [lookupId, setLookupId] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      setOrders(await api<Order[]>('/api/orders'))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      setOrders(await api<Order[]>(`/api/orders/search?q=${encodeURIComponent(q)}`))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ item, quantity, amount, note }),
      })
      setItem('')
      setNote('')
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function cancel(id: number) {
    await api(`/api/orders/${id}/cancel`, { method: 'POST' })
    await load()
  }

  async function show(id: number) {
    setError('')
    try {
      setDetail(await api<Order>(`/api/orders/${id}`))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    await show(Number(lookupId))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <div className="card">
        <h2>新規注文</h2>
        <form onSubmit={create} className="row">
          <div><label>商品名</label><input value={item} onChange={(e) => setItem(e.target.value)} /></div>
          <div><label>数量</label><input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></div>
          <div><label>金額</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
          <div><label>メモ</label><input value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <button type="submit">注文する</button>
        </form>
      </div>

      <div className="card">
        <h2>注文番号で表示</h2>
        <form onSubmit={lookup} className="row">
          <div><input placeholder="注文番号" value={lookupId} onChange={(e) => setLookupId(e.target.value)} /></div>
          <button type="submit">表示</button>
        </form>
      </div>

      <div className="card">
        <h2>自分の注文</h2>
        <form onSubmit={search} className="row" style={{ marginBottom: 12 }}>
          <div><input placeholder="商品名・メモで検索" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button type="submit">検索</button>
          <button type="button" className="secondary" onClick={() => { setQ(''); load() }}>クリア</button>
        </form>
        {error && <p className="error">{error}</p>}
        <table>
          <thead>
            <tr><th>ID</th><th>商品</th><th>数量</th><th>金額</th><th>状態</th><th>メモ</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={o.status === 'cancelled' ? 'status-cancelled' : ''}>
                <td>{o.id}</td>
                <td>{o.item}</td>
                <td>{o.quantity}</td>
                <td>¥{Number(o.amount).toLocaleString()}</td>
                <td>{o.status}</td>
                <td>{o.note}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="secondary" onClick={() => show(o.id)}>詳細</button>{' '}
                  {o.status !== 'cancelled' && (
                    <button className="danger" onClick={() => cancel(o.id)}>キャンセル</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="card">
          <h2>注文詳細 #{detail.id}</h2>
          <pre>{JSON.stringify(detail, null, 2)}</pre>
          <button className="secondary" onClick={() => setDetail(null)}>閉じる</button>
        </div>
      )}
    </>
  )
}
