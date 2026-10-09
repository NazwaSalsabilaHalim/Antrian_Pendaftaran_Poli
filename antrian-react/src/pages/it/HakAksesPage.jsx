import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const IZIN = [
  ['dokter_tambah', 'Tambah dokter'],
  ['dokter_edit', 'Edit dokter'],
  ['dokter_hapus', 'Hapus dokter'],
  ['antrean_kosongkan', 'Kosongkan antrean'],
]

export default function HakAksesPage() {
  const [nurses, setNurses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function load() {
    setLoading(true)
    api.getNurse()
      .then((res) => {
        setNurses((res.petugas || []).map((n) => ({ ...n, hak_akses: n.hak_akses || {} })))
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function toggle(id, key) {
    setNurses((list) =>
      list.map((n) =>
        n.id === id ? { ...n, hak_akses: { ...n.hak_akses, [key]: !n.hak_akses[key] } } : n
      )
    )
  }

  function simpan(nurse) {
    setMessage('')
    api.saveHakAkses({ id: nurse.id, hak_akses: nurse.hak_akses })
      .then(() => {
        setError('')
        setMessage(`Hak akses ${nurse.nama} disimpan. Berlaku setelah nurse login ulang.`)
      })
      .catch((e) => setError(e.message))
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">MANAJEMEN AKSES</div>
          <h1 className="page-intro__title">Hak Akses Nurse</h1>
          <p className="page-intro__subtitle">
            Atur fitur Data Dokter yang boleh dipakai tiap nurse
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="error-banner" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>{message}</div>}

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nurse</th>
                  {IZIN.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {nurses.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <strong>{n.nama}</strong>
                      <div className="muted">{n.username}</div>
                    </td>
                    {IZIN.map(([key]) => (
                      <td key={key}>
                        <input
                          type="checkbox"
                          checked={!!n.hak_akses[key]}
                          onChange={() => toggle(n.id, key)}
                        />
                      </td>
                    ))}
                    <td>
                      <button className="btn" onClick={() => simpan(n)}>
                        Simpan
                      </button>
                    </td>
                  </tr>
                ))}

                {nurses.length === 0 && (
                  <tr>
                    <td colSpan={IZIN.length + 2} className="empty-state">
                      Belum ada akun nurse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}