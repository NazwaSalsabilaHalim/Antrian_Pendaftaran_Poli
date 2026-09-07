import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'

const REFRESH_MS = 15000

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatTanggalWaktu(value) {
  if (!value) return '-'

  const date = new Date(value.replace(' ', 'T'))

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function Dashboard() {
  const [tanggal, setTanggal] = useState(todayStr())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [riwayat, setRiwayat] = useState([])

  const load = useCallback(() => {
    Promise.all([
      api.getStatistik(tanggal),
      api.getRiwayat(`tanggal=${tanggal}`)
    ])
      .then(([statistik, riwayatData]) => {
        console.log('HASIL RIWAYAT:', riwayatData)
        console.log('ITEM RIWAYAT:', riwayatData.riwayat?.[0])
        setData(statistik)
        setRiwayat(riwayatData.riwayat || [])
        setError('')
        setLastUpdate(new Date())
      })
      .catch((e) => setError(e.message))
  }, [tanggal])

  // muat ulang tiap kali tanggal berubah
  useEffect(() => {
    load()
  }, [load])

  // auto-refresh berkala, hanya untuk tanggal hari ini (data historis tidak berubah)
  useInterval(() => {
    if (tanggal === todayStr()) load()
  }, REFRESH_MS)

  const persenSelesai = data && data.total_dicetak > 0
    ? Math.round((data.total_dipanggil / data.total_dicetak) * 100)
    : 0

  // Data loket
  const loketData = data?.per_counter || []

  // Data ringkasan jenis pasien
  const jenisPasien = data?.per_tombol || []

  // ================= STATISTIK PELAYANAN =================

  const waktuTunggu = riwayat
    .filter((r) => r.tanggal_insert && r.tanggal_panggil)
    .map((r) => {
      const masuk = new Date(r.tanggal_insert.replace(' ', 'T'))
      const dipanggil = new Date(r.tanggal_panggil.replace(' ', 'T'))

      return Math.max(0, Math.round((dipanggil - masuk) / 60000))
    })

  const rataRataTunggu = waktuTunggu.length > 0
    ? Math.round(
      waktuTunggu.reduce((total, waktu) => total + waktu, 0) /
      waktuTunggu.length
    )
    : 0

  const waktuTungguTerlama = waktuTunggu.length > 0
    ? Math.max(...waktuTunggu)
    : 0

  const loketTeraktif = loketData.length > 0
    ? [...loketData].sort(
      (a, b) =>
        Number(b.total_dilayani || 0) -
        Number(a.total_dilayani || 0)
    )[0]
    : null

  const jumlahPerJam = {}

  riwayat.forEach((r) => {
    if (!r.tanggal_panggil) return

    const waktu = new Date(r.tanggal_panggil.replace(' ', 'T'))

    if (Number.isNaN(waktu.getTime())) return

    const jam = waktu.getHours()

    jumlahPerJam[jam] = (jumlahPerJam[jam] || 0) + 1
  })

  const jamTerpadatData = Object.entries(jumlahPerJam)
    .sort((a, b) => b[1] - a[1])[0]

  const jamTerpadat = jamTerpadatData
    ? `${String(jamTerpadatData[0]).padStart(2, '0')}:00`
    : '-'

  const jumlahJamTerpadat = jamTerpadatData
    ? jamTerpadatData[1]
    : 0

  return (
    <div>
      <h1 className="page-title">Dashboard Antrian</h1>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* FILTER TANGGAL */}
      <div className="card loket-header">
        <label htmlFor="tanggal" className="muted">
          Tanggal:
        </label>

        <input
          id="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />

        <button
          className="btn btn-outline"
          onClick={load}
        >
          Refresh
        </button>

        {lastUpdate && (
          <span
            className="muted"
            style={{ fontSize: 12 }}
          >
            Diperbarui {lastUpdate.toLocaleTimeString('id-ID')}
          </span>
        )}
      </div>

      {data && (
        <>
          {/* ================= STATISTIK PELAYANAN ================= */}
          <div
            className="grid stat-grid"
            style={{
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 16
            }}
          >
            {/* RATA-RATA WAKTU TUNGGU */}
            <div className="stat-card">
              <div className="stat-card__label">
                Rata-rata Waktu Tunggu
              </div>

              <div className="stat-card__value">
                {rataRataTunggu}
                <span style={{ fontSize: 16, marginLeft: 5 }}>
                  menit
                </span>
              </div>

              <div className="muted" style={{ fontSize: 12 }}>
                Dari ambil nomor sampai dipanggil
              </div>
            </div>

            {/* WAKTU TUNGGU TERLAMA */}
            <div className="stat-card">
              <div className="stat-card__label">
                Waktu Tunggu Terlama
              </div>

              <div className="stat-card__value">
                {waktuTungguTerlama}
                <span style={{ fontSize: 16, marginLeft: 5 }}>
                  menit
                </span>
              </div>

              <div className="muted" style={{ fontSize: 12 }}>
                Waktu tunggu paling lama
              </div>
            </div>

            {/* LOKET TERAKTIF */}
            <div className="stat-card">
              <div className="stat-card__label">
                Loket Teraktif
              </div>

              <div
                className="stat-card__value"
                style={{ fontSize: 26 }}
              >
                {loketTeraktif?.nama || '-'}
              </div>

              <div className="muted" style={{ fontSize: 12 }}>
                {loketTeraktif
                  ? `${loketTeraktif.total_dilayani} pasien dilayani`
                  : 'Belum ada pelayanan'}
              </div>
            </div>

            {/* JAM TERPADAT */}
            <div className="stat-card">
              <div className="stat-card__label">
                Jam Terpadat
              </div>

              <div className="stat-card__value">
                {jamTerpadat}
              </div>

              <div className="muted" style={{ fontSize: 12 }}>
                {jumlahJamTerpadat > 0
                  ? `${jumlahJamTerpadat} pasien dipanggil`
                  : 'Belum ada pemanggilan'}
              </div>
            </div>
          </div>

          {/* ================= RINGKASAN JENIS PASIEN ================= */}
          <div className="card jenis-pasien-card">

            <p className="jenis-pasien-title">
              Ringkasan Jenis Pasien
            </p>

            <div className="jenis-pasien-grid">
              {jenisPasien.map((t) => (
                <div
                  key={t.tombol_id}
                  className="jenis-pasien-item"
                >
                  <div className="jenis-pasien-name">
                    {t.nama}
                  </div>

                  <div className="jenis-pasien-stats">

                    <div>
                      <div className="jenis-pasien-label">
                        Diambil
                      </div>
                      <strong>
                        {t.total_dicetak}
                      </strong>
                    </div>

                    <div>
                      <div className="jenis-pasien-label">
                        Dipanggil
                      </div>
                      <strong>
                        {t.total_dipanggil}
                      </strong>
                    </div>

                    <div>
                      <div className="jenis-pasien-label">
                        Sisa
                      </div>
                      <strong>
                        {t.sisa}
                      </strong>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ================= PER LOKET ================= */}
          <div className="card loket-card">

            <div className="loket-header">
              <div>
                <p className="loket-title">
                  Per Loket
                </p>

                <span className="loket-subtitle">
                  Ringkasan pelayanan setiap loket
                </span>
              </div>
            </div>

            <div className="loket-grid">
              {loketData.map((c) => (
                <div
                  key={c.counter_id}
                  className="loket-item"
                >
                  <div className="loket-item__content">

                    <div>
                      <div className="loket-item__label">
                        LOKET
                      </div>

                      <strong className="loket-item__name">
                        {c.nama}
                      </strong>
                    </div>

                    <div className="loket-item__total">
                      <div className="loket-item__label">
                        DILAYANI
                      </div>

                      <strong className="loket-item__number">
                        {c.total_dilayani}
                      </strong>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ================= RIWAYAT ================= */}
          <div
            className="card"
            style={{ marginTop: 24 }}
          >
            <div style={{ marginBottom: 16 }}>
              <p className="section-title" style={{ marginBottom: 4 }}>
                Riwayat Pemanggilan
              </p>

              <span className="muted" style={{ fontSize: 12 }}>
                Daftar nomor yang sudah dipanggil pada tanggal ini
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nomor Antrian</th>
                    <th>Jenis Pasien</th>
                    <th>Loket</th>
                    <th>Status</th>
                    <th>Waktu Diambil</th>
                    <th>Waktu Dipanggil</th>
                  </tr>
                </thead>

                <tbody>
                  {riwayat.map((r, index) => (
                    <tr key={r.id}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {r.nomor}
                        </strong>
                      </td>

                      <td>
                        {r.jenis_pasien}
                      </td>

                      <td>
                        {r.counter_nama}
                      </td>

                      <td>
                        {r.status}
                      </td>

                      <td>
                        {formatTanggalWaktu(r.tanggal_insert)}
                      </td>

                      <td>
                        {formatTanggalWaktu(r.tanggal_panggil)}
                      </td>
                    </tr>
                  ))}

                  {riwayat.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="muted"
                      >
                        Belum ada riwayat pemanggilan pada tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}