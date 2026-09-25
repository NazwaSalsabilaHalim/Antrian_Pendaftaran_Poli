import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { StatCard, StatusBadge } from '../../components/it/ITComponents'

export default function ITDashboardOverview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRingkasanIT()
      .then((res) => {
        setData(res)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const stat = data?.stat || {}
  const statusLoket = data?.status_loket || []
  const aktivitas = data?.aktivitas || []

  return (
    <>
      {/* WELCOME BANNER */}
      <div className="card it-dashboard-welcome">
        <div className="it-dashboard-welcome__label">
          SISTEM INFORMASI ANTRIAN
        </div>

        <h2 className="it-dashboard-welcome__title">
          Selamat Datang, Administrator
        </h2>

        <p className="it-dashboard-welcome__description">
          Pantau dan kelola sistem antrian pendaftaran dari satu halaman.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Memuat data...</div>
      ) : (
        <>
          {/* STAT GRID */}
          <div className="grid stat-grid">
            <StatCard
              label="Antrian Menunggu"
              value={stat.menunggu ?? 0}
              description="Hari ini"
            />

            <StatCard
              label="Sedang Dilayani"
              value={stat.dilayani ?? 0}
              description="Loket aktif melayani"
            />

            <StatCard
              label="Petugas Aktif"
              value={stat.petugas_aktif ?? 0}
              description="Petugas"
            />

            <StatCard
              label="Loket Aktif"
              value={stat.loket_aktif ?? 0}
              description="Loket"
            />
          </div>

          <div className="dashboard-2col">

            {/* STATUS LOKET */}
            <div className="dashboard-2col__column">
              <div className="card">
                <div className="section-header">
                  <p className="section-title it-dashboard-section-title">
                    Status Loket
                  </p>
                </div>

                <div className="it-dashboard-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Loket</th>
                        <th>Petugas</th>
                        <th>Status</th>
                        <th>Antrian</th>
                      </tr>
                    </thead>

                    <tbody>
                      {statusLoket.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.loket}</strong></td>
                          <td>{item.petugas}</td>
                          <td>
                            <StatusBadge status={item.status} />
                          </td>
                          <td>{item.antrian}</td>
                        </tr>
                      ))}

                      {statusLoket.length === 0 && (
                        <tr>
                          <td colSpan={4} className="empty-state">
                            Belum ada panggilan hari ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AKTIVITAS TERBARU */}
            <div className="dashboard-2col__column">
              <div className="card">
                <div className="section-header">
                  <p className="section-title it-dashboard-section-title">
                    Aktivitas Terbaru
                  </p>
                </div>

                {aktivitas.map((item, index) => (
                  <div className="waiting-row" key={index}>
                    <span className="waiting-row__index">
                      {index + 1}
                    </span>

                    <span>{item.text}</span>

                    <span className="waiting-row__tag it-dashboard-activity-time">
                      {item.time}

                      <br />

                      <span className="it-dashboard-activity-date">
                        {item.date}
                      </span>
                    </span>
                  </div>
                ))}

                {aktivitas.length === 0 && (
                  <div className="empty-state">
                    Belum ada aktivitas.
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </>
  )
}