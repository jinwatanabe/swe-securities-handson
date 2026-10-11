import { useEffect, useState } from 'react'
import { api, getStoredUser, getToken, setSession, type User } from '../api'

export default function Profile({ onUpdate }: { onUpdate: (u: User) => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [preview, setPreview] = useState<{ dataUrl: string; contentType: string; text?: string } | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api<User>('/api/profile').then((p) => {
      setName(p.name)
      setPhone(p.phone || '')
      setAvatarUrl(p.avatar_url || '')
    })
  }, [])

  async function loadPreview() {
    setError('')
    setPreview(null)
    try {
      setPreview(
        await api('/api/profile/avatar/preview', {
          method: 'POST',
          body: JSON.stringify({ url: avatarUrl }),
        }),
      )
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const updated = await api<User>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, avatar_url: avatarUrl }),
      })
      const current = getStoredUser()
      const merged = { ...current, ...updated } as User
      setSession(getToken() || '', merged)
      onUpdate(merged)
      setMessage('保存しました')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="card">
      <h2>プロフィール編集</h2>
      <form onSubmit={save}>
        <label>名前</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>電話番号</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>アバター画像URL</label>
        <div className="row">
          <div><input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} /></div>
          <button type="button" className="secondary" onClick={loadPreview}>プレビュー</button>
        </div>
        {preview && (
          <div style={{ marginTop: 12 }}>
            {preview.contentType.startsWith('image/') ? (
              <img className="avatar" src={preview.dataUrl} alt="avatar" />
            ) : (
              <pre>{preview.text ?? preview.contentType}</pre>
            )}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <button type="submit">保存</button>
        </div>
        {message && <p>{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
