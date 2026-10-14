import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { UserPlus } from 'lucide-react'

export default function RegisterAdmin() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        nama: '',
        username: '',
        password: '',
        konfirmasi_password: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setSuccess('')

        if (
            !form.nama ||
            !form.username ||
            !form.password ||
            !form.konfirmasi_password
        ) {
            setError('Semua field wajib diisi.')
            return
        }

        if (form.password !== form.konfirmasi_password) {
            setError('Konfirmasi password tidak sama.')
            return
        }

        try {
            setLoading(true)

            await api.registerAdmin(form)

            setSuccess('Registrasi Admin berhasil. Silakan login.')

            setTimeout(() => {
                navigate('/login')
            }, 1200)

        } catch (err) {
            setError(err.message || 'Registrasi gagal.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-header">
                    <div className="ambil-hero__icon">
                        <UserPlus size={25} strokeWidth={1.9} />
                    </div>
                    <h1>Registrasi Admin</h1>
                    <p>Buat akun Admin / IT</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Nama</label>
                        <input
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            placeholder="Masukkan nama"
                        />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Masukkan username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Masukkan password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Konfirmasi Password</label>
                        <input
                            type="password"
                            name="konfirmasi_password"
                            value={form.konfirmasi_password}
                            onChange={handleChange}
                            placeholder="Ulangi password"
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="login-success">
                            {success}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Memproses...' : 'Daftar'}
                    </button>

                </form>

                <div className="login-register">
                    <span>Sudah memiliki akun?</span>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                </div>

            </div>
        </div>
    )
}