import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import {
  StatCard,
  StatusBadge,
} from '../../components/it/ITComponents'
import { Tv } from 'lucide-react'
import { formatNomor, isDokterNonaktif } from '../../utils/dokter'
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

  const [doctors, setDoctors] = useState([])
  const [poliLoading, setPoliLoading] = useState(true)
  const [poliError, setPoliError] = useState('')

  useEffect(() => {
    api.getDoctors()
      .then((res) => {
        const rows = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : []
        setDoctors(rows)
      })
      .catch((e) => setPoliError(e.message || 'Gagal memuat data poli.'))
      .finally(() => setPoliLoading(false))
  }, [])

  const dokterNonaktif = doctors.filter(isDokterNonaktif).length
  const dokterAktif = doctors.length - dokterNonaktif
  const poliBerjalan = doctors.filter(
    (d) => !isDokterNonaktif(d) && Number(d.Antrian) > 0
  ).length

  const {
    currentPage: poliPage,
    setCurrentPage: setPoliPage,
    totalPages: poliTotalPages,
    startIndex: poliStartIndex,
    paginatedItems: paginatedDoctors,
  } = usePagination(doctors, 5)

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

      <p className="section-title">Monitoring Pendaftaran</p>

      {/* Stat Grid */}
      <div className="grid stat-grid">
        <StatCard
          label="Antrian Menunggu"
          value={loading ? '-' : stat.menunggu ?? 0}
          description="Hari ini"
        />

        <StatCard
          label="Sedang Dilayani"
          value={loading ? '-' : stat.dilayani ?? 0}
          description="Loket aktif melayani"
        />

        <StatCard
          label="Petugas Aktif"
          value={loading ? '-' : stat.petugas_aktif ?? 0}
          description="Petugas"
        />

        <StatCard
          label="Loket Aktif"
          value={loading ? '-' : stat.loket_aktif ?? 0}
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
                      <td colSpan={4} className="empty-state">
                        {loading ? 'Memuat data...' : 'Belum ada panggilan hari ini.'}
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

      {/* ================= MONITORING POLIKLINIK ================= */}
      <p className="section-title it-dashboard-group-title">
        Monitoring Poliklinik
      </p>

      {poliError && <div className="error-banner">{poliError}</div>}

      <div className="grid stat-grid">
        <StatCard
          label="Dokter Terdaftar"
          value={poliLoading ? '-' : doctors.length}
          description="Seluruh poliklinik"
        />

        <StatCard
          label="Dokter Aktif"
          value={poliLoading ? '-' : dokterAktif}
          description="Siap melayani"
        />

        <StatCard
          label="Dokter Tidak Aktif"
          value={poliLoading ? '-' : dokterNonaktif}
          description="Tidak praktik"
        />

        <StatCard
          label="Poli Sedang Berjalan"
          value={poliLoading ? '-' : poliBerjalan}
          description="Antrean sudah dipanggil"
        />
      </div>

      <div className="card">
        <div className="section-header">
          <p className="section-title it-dashboard-section-title">
            Status Poli & Dokter
          </p>
        </div>

        <div className="it-dashboard-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Dokter</th>
                <th>Poli</th>
                <th>Ruang</th>
                <th>Status</th>
                <th>Antrean</th>
              </tr>
            </thead>

            <tbody>
              {paginatedDoctors.map((doctor, index) => (
                <tr key={doctor.AID}>
                  <td>{poliStartIndex + index + 1}</td>
                  <td><strong>{doctor.Nama || '-'}</strong></td>
                  <td>{doctor.NamaPoli || '-'}</td>
                  <td>{doctor.Ruang ? `Ruang ${doctor.Ruang}` : '-'}</td>
                  <td>
                    <StatusBadge
                      status={isDokterNonaktif(doctor) ? 'Tidak Aktif' : 'Aktif'}
                    />
                  </td>
                  <td>
                    <strong>{formatNomor(doctor.Antrian)}</strong>
                  </td>
                </tr>
              ))}

              {doctors.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    {poliLoading ? 'Memuat data...' : 'Belum ada data dokter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!poliLoading && (
          <Pagination
            currentPage={poliPage}
            totalPages={poliTotalPages}
            totalItems={doctors.length}
            pageSize={5}
            onPageChange={setPoliPage}
            itemName="dokter"
          />
        )}
      </div>
    </>
  )
}