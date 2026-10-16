import { Navigate, useNavigate } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { api } from '../api/client'
import { isNurseLoggedIn, saveNurse } from '../utils/auth'
import AuthForm, { LOGIN_FIELDS } from '../components/AuthForm'

const HOME = '/poli/nurse/dokter'

export default function LoginNurse() {
  const navigate = useNavigate()

  // sudah login -> langsung masuk
  if (isNurseLoggedIn()) return <Navigate to={HOME} replace />

  async function handleLogin({ username, password }) {
    const result = await api.loginNurse({ username: username.trim(), password })
    saveNurse(result.user)
    navigate(HOME, { replace: true })
  }

  return (
    <AuthForm
      icon={Stethoscope}
      title="Login Nurse"
      subtitle="Silakan masuk untuk mengakses layanan poliklinik"
      fields={LOGIN_FIELDS}
      onSubmit={handleLogin}
    />
  )
}