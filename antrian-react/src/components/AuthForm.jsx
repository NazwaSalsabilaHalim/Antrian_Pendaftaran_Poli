import { useState } from 'react'

// Field standar untuk halaman login (admin, petugas, nurse)
export const LOGIN_FIELDS = [
  {
    name: 'username',
    label: 'Username',
    placeholder: 'Masukkan username',
    autoComplete: 'username',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Masukkan password',
    autoComplete: 'current-password',
  },
]

/*
  Kerangka bersama semua halaman login/registrasi.

  - fields   : [{ name, label, type?, placeholder?, autoComplete? }]
  - onSubmit : async (values) => pesan sukses (opsional).
               Lempar Error untuk menampilkan pesan gagal.
  - footer   : isi baris bawah (mis. tombol ke halaman lain), opsional
*/
export default function AuthForm({
  icon: Icon,
  title,
  subtitle,
  fields,
  submitLabel = 'Login',
  requiredMessage = 'Username dan password wajib diisi.',
  onSubmit,
  footer,
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, '']))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const kosong = fields.some((f) =>
      f.type === 'password' ? !values[f.name] : !values[f.name].trim()
    )

    if (kosong) {
      setError(requiredMessage)
      return
    }

    try {
      setLoading(true)
      const message = await onSubmit(values)
      if (message) setSuccess(message)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="ambil-hero__icon">
            <Icon size={25} strokeWidth={1.9} />
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="form-group" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>

              <input
                id={f.name}
                name={f.name}
                type={f.type || 'text'}
                value={values[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
              />
            </div>
          ))}

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : submitLabel}
          </button>
        </form>

        {footer && <div className="login-register">{footer}</div>}
      </div>
    </div>
  )
}
