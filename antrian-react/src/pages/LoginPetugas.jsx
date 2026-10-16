import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { api } from '../api/client'
import { isPetugasLoggedIn, savePetugas } from '../utils/auth'
import AuthForm, { LOGIN_FIELDS } from '../components/AuthForm'

export default function LoginPetugas() {
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.startsWith('/pendaftaran')
    ? location.state.from
    : '/pendaftaran/loket'

  // sudah login -> langsung masuk
  if (isPetugasLoggedIn()) return <Navigate to={from} replace />

  async function handleLogin({ username, password }) {
    const result = await api.loginPetugas({ username: username.trim(), password })
    savePetugas(result.user)
    navigate(from, { replace: true })
  }

  return (
    <AuthForm
      icon={Users}
      title="Login Petugas"
      subtitle="Silakan masuk untuk mengakses loket pelayanan"
      fields={LOGIN_FIELDS}
      onSubmit={handleLogin}
    />
  )
}