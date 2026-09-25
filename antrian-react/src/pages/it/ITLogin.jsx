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
    <div className="it-login">
      <div className="card it-login__card">

        <div className="it-login__header">
          <div className="sidebar__brand-icon it-login__icon">
            <ShieldCheck size={20} strokeWidth={2} />
          </div>

          <h1 className="it-login__title">
            Panel Admin IT
          </h1>

          <p className="muted it-login__description">
            Masuk untuk mengelola sistem antrian pendaftaran
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="it-login__field">
            <label className="it-login__label">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="it-login__input"
            />
          </div>

          <div className="it-login__field it-login__field--password">
            <label className="it-login__label">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="it-login__input"
            />
          </div>

          <button type="submit" className="btn it-login__submit">
            Masuk
          </button>
        </form>

      </div>
    </div>
  )
}