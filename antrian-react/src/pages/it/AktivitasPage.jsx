import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Toast } from '../../components/it/ITComponents'

export default function AktivitasPage() {
  const [aktivitas, setAktivitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.getAktivitas(50)
      .then((res) => setAktivitas(res.aktivitas || []))
      .catch((e) => setToast({ type: 'error', text: e.message }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            {loading ? 'Memuat data...' : `${aktivitas.length} aktivitas terakhir`}
          </p>
        </div>

        {!loading && (
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
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Belum ada aktivitas tercatat.
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