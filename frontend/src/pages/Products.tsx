import { useEffect, useState } from 'react'
import { api, type Product } from '../api'

export default function Products() {
  const [rows, setRows] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      setRows(await api<Product[]>('/api/products'))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      setRows(await api<Product[]>(`/api/products/search?q=${encodeURIComponent(q)}`))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="card">
      <h2>在庫検索</h2>
      <form onSubmit={search} className="row" style={{ marginBottom: 12 }}>
        <div><input placeholder="商品名・SKUで検索" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button type="submit">検索</button>
        <button type="button" className="secondary" onClick={() => { setQ(''); load() }}>クリア</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr><th>ID</th><th>商品名</th><th>SKU</th><th>カテゴリ</th><th>在庫数</th><th>価格</th></tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td>{p.stock}</td>
              <td>¥{Number(p.price).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
