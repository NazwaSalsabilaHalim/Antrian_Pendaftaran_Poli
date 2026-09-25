import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function AktivitasPage() {
  const [aktivitas, setAktivitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAktivitas(50)
      .then((res) => {
        setAktivitas(res.aktivitas || [])
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">LOG SISTEM</div>
          <h1 className="page-intro__title">Aktivitas Sistem</h1>
          <p className="page-intro__subtitle">
            Riwayat aktivitas pengguna pada sistem
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            Riwayat Aktivitas
          </p>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aktivitas</th>
                </tr>
              </thead>

              <tbody>
                {aktivitas.map((item, index) => (
                  <tr key={index}>
                    <td>{item.tanggal}</td>
                    <td>{item.waktu}</td>
                    <td>{item.pengguna}</td>
                    <td>{item.aktivitas}</td>
                  </tr>
                ))}

                {aktivitas.length === 0 && (
                  <tr><td colSpan={4} className="empty-state">Belum ada aktivitas tercatat.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}