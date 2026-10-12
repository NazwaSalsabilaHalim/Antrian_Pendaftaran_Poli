import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import {
  StatCard,
  StatusBadge,
} from '../../components/it/ITComponents'
import { Tv, Stethoscope } from 'lucide-react'
import Pagination, { usePagination } from '../../components/Pagination'

export default function ITDashboardOverview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // =========================
  // Load Dashboard Data
  // =========================
  useEffect(() => {
    api.getRingkasanIT()
      .then((res) => {
        setData(res)
        setError('')
      })
      .catch((e) => {
        setError(e.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const stat = data?.stat || {}
  const statusLoket = data?.status_loket || []
  const aktivitas = data?.aktivitas || []

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedStatusLoket,
  } = usePagination(statusLoket, 10)

  return (
    <>
      {/* Welcome Banner */}
      <div className="card it-dashboard-welcome">
        <div className="it-dashboard-welcome__text">
          <div className="it-dashboard-welcome__label">
            SISTEM INFORMASI ANTRIAN
          </div>

          <h2 className="it-dashboard-welcome__title">
            Selamat Datang, Administrator
          </h2>

          <p className="it-dashboard-welcome__description">
            Pantau dan kelola sistem antrian pendaftaran
            dari satu halaman.
          </p>
        </div>

        <div className="it-dashboard-welcome__actions">
          <a
            href="/display"
            target="_blank"
            rel="noreferrer"
            className="it-welcome-btn"
          >
            <Tv size={16} />
            <span>Layar TV Pendaftaran</span>
            <span aria-hidden="true">↗</span>
          </a>

          <a
            href="/poli/display"
            target="_blank"
            rel="noreferrer"
            className="it-welcome-btn"
          >
            <Tv size={16} />
            <span>Layar TV Poli</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Loading / Dashboard */}
      {loading ? (
        <div className="empty-state">
          Memuat data...
        </div>
      ) : (
        <>
          {/* Stat Grid */}
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

          {/* Dashboard Columns */}
          <div className="dashboard-2col">

            {/* Status Loket */}
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
                      {paginatedStatusLoket.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.loket}</strong>
                          </td>

                          <td>
                            {item.petugas}
                          </td>

                          <td>
                            <StatusBadge
                              status={item.status}
                            />
                          </td>

                          <td>
                            {item.antrian}
                          </td>
                        </tr>
                      ))}

                      {statusLoket.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="empty-state"
                          >
                            Belum ada panggilan hari ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={statusLoket.length}
                  pageSize={10}
                  onPageChange={setCurrentPage}
                  itemName="loket"
                />
              </div>
            </div>

            {/* Aktivitas Terbaru */}
            <div className="dashboard-2col__column">
              <div className="card">
                <div className="section-header">
                  <p className="section-title it-dashboard-section-title">
                    Aktivitas Terbaru
                  </p>
                </div>

                {aktivitas.map((item, index) => (
                  <div
                    className="waiting-row"
                    key={index}
                  >
                    <span className="waiting-row__index">
                      {index + 1}
                    </span>

                    <span>
                      {item.text}
                    </span>

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