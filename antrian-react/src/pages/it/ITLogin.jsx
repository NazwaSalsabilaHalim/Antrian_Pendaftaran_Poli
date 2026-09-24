import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function ITLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (username.trim() === '' || password.trim() === '') {
      setError('Username dan password wajib diisi.')
      return
    }

    // TODO: ganti dengan pemanggilan API login IT yang sebenarnya
    localStorage.setItem('it_auth', 'true')
    navigate('/it-dashboard/overview', { replace: true })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 24,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 380 }}>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <div className="sidebar__brand-icon" style={{ marginBottom: 14 }}>
            <ShieldCheck size={20} strokeWidth={2} />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: 'var(--text)',
            }}
          >
            Panel Admin IT
          </h1>

          <p
            className="muted"
            style={{ fontSize: 13, marginTop: 6, textAlign: 'center' }}
          >
            Masuk untuk mengelola sistem antrian pendaftaran
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--text-soft)',
              }}
            >
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--text-soft)',
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%' }}>
            Masuk
          </button>
        </form>
      </div>
    </div>
  )
}
