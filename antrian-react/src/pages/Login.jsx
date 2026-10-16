import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { api } from '../api/client'
import { saveAdmin } from '../utils/auth'
import AuthForm, { LOGIN_FIELDS } from '../components/AuthForm'

// Login Admin / IT  ->  /it-login
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  // Kembali ke halaman IT yang tadi dibuka, kalau tidak ada ke dashboard
  const from = location.state?.from?.startsWith('/it-dashboard')
    ? location.state.from
    : '/it-dashboard'

  async function handleLogin({ username, password }) {
    const { user } = await api.login({ username: username.trim(), password })

    if (String(user?.role || '').toLowerCase() !== 'admin') {
      throw new Error(
        'Akun ini bukan Admin. Petugas dan nurse masuk lewat halaman login masing-masing.'
      )
    }

    saveAdmin(user)
    navigate(from, { replace: true })
  }

  return (
    <AuthForm
      icon={ShieldCheck}
      title="Login Sistem"
      subtitle="Silakan masuk menggunakan akun Anda"
      fields={LOGIN_FIELDS}
      onSubmit={handleLogin}
      footer={
        <>
          <span>Belum memiliki akun?</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/register-admin')}
          >
            Registrasi Admin
          </button>
        </>
      }
    />
  )
}