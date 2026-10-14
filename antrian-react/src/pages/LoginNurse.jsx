import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { isNurseLoggedIn, saveNurse } from '../utils/auth'
import { Stethoscope } from 'lucide-react'

export default function LoginNurse() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // sudah login -> langsung masuk, tidak perlu login ulang
  if (isNurseLoggedIn()) {
    return <Navigate to="/poli/nurse/dokter" replace />
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

      const result = await api.loginNurse({
        username: username.trim(),
        password,
      })

      saveNurse(result.user)
      navigate('/poli/nurse/dokter', { replace: true })
    } catch (err) {
      setError(err.message || 'Login nurse gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="ambil-hero__icon">
            <Stethoscope size={25} strokeWidth={1.9} />
          </div>
          <h1>Login Nurse</h1>
          <p>Silakan masuk untuk mengakses layanan poliklinik</p>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>

        </form>

      </div>
    </div>
  )
}