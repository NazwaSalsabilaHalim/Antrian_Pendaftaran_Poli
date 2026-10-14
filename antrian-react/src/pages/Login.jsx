import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { ShieldCheck } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')

        if (!username || !password) {
            setError('Username dan password wajib diisi.')
            return
        }

        try {
            setLoading(true)

            const result = await api.login({
                username,
                password,
            })

            const user = result.user

            localStorage.setItem(
                'admin_auth_user',
                JSON.stringify(user)
            )

            /*
             * Halaman yang sebelumnya ingin dibuka user.
             *
             * Contoh:
             * /loket → login → kembali ke /loket
             * /it-dashboard → login → kembali ke /it-dashboard
             */
            const from = location.state?.from

            // ==========================================
            // JIKA ADA TUJUAN SEBELUM LOGIN
            // ==========================================

            if (from) {

                // User PETUGAS boleh masuk ke /loket
                if (
                    from === '/loket' &&
                    user.role === 'petugas'
                ) {
                    navigate('/loket', { replace: true })
                    return
                }

                // User ADMIN boleh masuk ke IT Dashboard
                if (
                    from.startsWith('/it-dashboard') &&
                    user.role === 'admin'
                ) {
                    navigate(from, { replace: true })
                    return
                }

                // Halaman internal umum
                if (
                    user.role === 'admin' ||
                    user.role === 'petugas' ||
                    user.role === 'nurse'
                ) {
                    navigate(from, { replace: true })
                    return
                }

                setError(
                    'Akun Anda tidak memiliki akses ke halaman tersebut.'
                )

                return
            }

            // ==========================================
            // JIKA LOGIN LANGSUNG DARI /login
            // ==========================================

            if (user.role === 'admin') {
                navigate('/it-dashboard', {
                    replace: true,
                })

            } else if (user.role === 'petugas') {
                navigate('/loket', {
                    replace: true,
                })

            } else if (user.role === 'nurse') {
                navigate('/overview', {
                    replace: true,
                })

            } else {
                setError('Role akun tidak dikenali.')
            }

        } catch (err) {
            setError(
                err.message || 'Login gagal.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">
                    <div className="ambil-hero__icon">
                        <ShieldCheck size={25} strokeWidth={1.9} />
                    </div>
                    <h1>Login Sistem</h1>
                    <p>Silakan masuk menggunakan akun Anda</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Masukkan username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Masukkan password"
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'Login'}
                    </button>

                </form>

                <div className="login-register">

                    <span>
                        Belum memiliki akun?
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() =>
                            navigate('/register-admin')
                        }
                    >
                        Registrasi Admin
                    </button>

                </div>

            </div>

        </div>
    )
}