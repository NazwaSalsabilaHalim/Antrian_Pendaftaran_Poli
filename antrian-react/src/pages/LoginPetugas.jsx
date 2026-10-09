import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { isPetugasLoggedIn, savePetugas } from '../utils/auth'

export default function LoginPetugas() {
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.startsWith('/pendaftaran')
    ? location.state.from
    : '/pendaftaran/loket'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // sudah login -> langsung masuk, tidak perlu login ulang
  if (isPetugasLoggedIn()) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.')
      return
    }

    try {
      setLoading(true)

      const result = await api.loginPetugas({
        username: username.trim(),
        password,
      })

      savePetugas(result.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login petugas gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Login Petugas</h1>

          <p>
            Silakan masuk untuk mengakses loket pelayanan
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Login Petugas'}
          </button>

        </form>

      </div>
    </div>
  )
}