import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { api } from '../api/client'
import AuthForm from '../components/AuthForm'

const FIELDS = [
  { name: 'nama', label: 'Nama', placeholder: 'Masukkan nama' },
  { name: 'username', label: 'Username', placeholder: 'Masukkan username' },
  { name: 'password', label: 'Password', type: 'password', placeholder: 'Masukkan password' },
  {
    name: 'konfirmasi_password',
    label: 'Konfirmasi Password',
    type: 'password',
    placeholder: 'Ulangi password',
  },
]

export default function RegisterAdmin() {
  const navigate = useNavigate()

  async function handleRegister(values) {
    if (values.password !== values.konfirmasi_password) {
      throw new Error('Konfirmasi password tidak sama.')
    }

    await api.registerAdmin(values)

    setTimeout(() => navigate('/it-login'), 1200)
    return 'Registrasi Admin berhasil. Silakan login.'
  }

  return (
    <AuthForm
      icon={UserPlus}
      title="Registrasi Admin"
      subtitle="Buat akun Admin / IT"
      fields={FIELDS}
      submitLabel="Daftar"
      requiredMessage="Semua field wajib diisi."
      onSubmit={handleRegister}
      footer={
        <>
          <span>Sudah memiliki akun?</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/it-login')}
          >
            Login
          </button>
        </>
      }
    />
  )
}