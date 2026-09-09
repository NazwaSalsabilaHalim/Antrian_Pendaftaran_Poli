import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  function exportCSV() {
    const header = ['No', 'Nomor Antrian', 'Jenis Pasien', 'Loket', 'Status', 'Waktu Diambil', 'Waktu Dipanggil']

    const rows = riwayat.map((r, index) => [
      index + 1,
      r.nomor,
      r.jenis_pasien,
      r.counter_nama,
      r.status,
      formatTanggalWaktu(r.tanggal_insert),
      formatTanggalWaktu(r.tanggal_panggil)
    ])

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n')

    // \uFEFF di depan supaya Excel baca UTF-8 dengan benar (karakter é, ü, dll aman)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `riwayat-antrian-${tanggal}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Riwayat & Statistik Antrian', 14, 16)
    doc.setFontSize(10)
    doc.text(`Tanggal: ${tanggal}`, 14, 23)

    autoTable(doc, {
      startY: 28,
      head: [['No', 'Nomor Antrian', 'Jenis Pasien', 'Loket', 'Status', 'Waktu Diambil', 'Waktu Dipanggil']],
      body: riwayat.map((r, index) => [
        index + 1,
        r.nomor,
        r.jenis_pasien,
        r.counter_nama,
        r.status,
        formatTanggalWaktu(r.tanggal_insert),
        formatTanggalWaktu(r.tanggal_panggil)
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [38, 142, 103] } // warna primary kamu, RGB dari #268e67
    })

    doc.save(`riwayat-antrian-${tanggal}.pdf`)
  }
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

  // Chart per jam (jam operasional 07:00–20:00, sesuaikan kalau perlu)
  const jamOperasional = Array.from({ length: 14 }, (_, i) => i + 7)

  const chartData = jamOperasional.map((jam) => ({
    jam: `${String(jam).padStart(2, '0')}:00`,
    jumlah: jumlahPerJam[jam] || 0
  }))

  const maxJumlahPerJam = Math.max(1, ...chartData.map((d) => d.jumlah))

  const jamPuncakIndex = maxJumlahPerJam > 0
    ? chartData.reduce((maxIdx, d, i, arr) => (d.jumlah > arr[maxIdx].jumlah ? i : maxIdx), 0)
    : -1

  // Rata-rata waktu tunggu per loket
  const waktuTungguPerLoket = {}

  riwayat
    .filter((r) => r.tanggal_insert && r.tanggal_panggil && r.counter_nama)
    .forEach((r) => {
      const masuk = new Date(r.tanggal_insert.replace(' ', 'T'))
      const dipanggil = new Date(r.tanggal_panggil.replace(' ', 'T'))
      const menit = Math.max(0, Math.round((dipanggil - masuk) / 60000))

      if (!waktuTungguPerLoket[r.counter_nama]) {
        waktuTungguPerLoket[r.counter_nama] = []
      }
      waktuTungguPerLoket[r.counter_nama].push(menit)
    })

  function rataRataPerLoket(namaLoket) {
    const list = waktuTungguPerLoket[namaLoket]
    if (!list || list.length === 0) return null
    return Math.round(list.reduce((a, b) => a + b, 0) / list.length)
  }

  return (
    <div>
      <h1 className="page-title">Dashboard Antrian</h1>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* FILTER TANGGAL */}
      <div className="card_loket-header">
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

        <button
          className="btn btn-outline"
          onClick={exportCSV}
          disabled={riwayat.length === 0}
        >
          Export CSV
        </button>

        <button
          className="btn btn-outline"
          onClick={exportPDF}
          disabled={riwayat.length === 0}
        >
          Export PDF
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
          <div className="grid stat-grid">
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

              <div className="stat-card__value">
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

          <div className="dashboard-2col">
            {/* KOLOM KIRI */}
            <div className="dashboard-2col__column">

              {/* PERSENTASE SELESAI */}
              <div className="stat-card stat-card">
                <div className="stat-card__label">Persentase Selesai</div>
                <div className="stat-card__pct">{persenSelesai}%</div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${persenSelesai}%` }} />
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  {data.total_dipanggil} dari {data.total_dicetak} nomor dipanggil
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
                  </div>
                </div>

                <div className="loket-grid">
                  {loketData.map((c) => {
                    const rataRata = rataRataPerLoket(c.nama)

                    return (
                      <div key={c.counter_id} className="loket-item">
                        <div className="loket-item__content">
                          <div>
                            <div className="loket-item__label">LOKET</div>
                            <strong className="loket-item__name">{c.nama}</strong>
                          </div>

                          <div className="loket-item__total">
                            <div className="loket-item__label">DILAYANI</div>
                            <strong className="loket-item__number">{c.total_dilayani}</strong>
                          </div>
                        </div>

                        <div className="loket-item__wait">
                          <span className="loket-item__wait-label">Rata-rata tunggu</span>
                          <span className="loket-item__wait-value">
                            {rataRata !== null ? `${rataRata} menit` : '-'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            </div>

            <div className="dashboard-2col__column">
              {/* ================= DISTRIBUSI PER JAM ================= */}
              <div className="card jam-chart-card">
                <p className="jam-chart-title">Distribusi Pemanggilan per Jam</p>
                <span className="jam-chart-subtitle">
                  Jumlah pasien dipanggil tiap jam pada tanggal ini
                </span>

                <div style={{ marginTop: 16, width: '100%', flex: 1, minHeight: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                      <XAxis dataKey="jam" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={{ stroke: 'var(--border-soft)' }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value} pasien`, 'Dipanggil']} labelFormatter={(label) => `Jam ${label}`} />
                      <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={index === jamPuncakIndex ? 'var(--warning)' : 'var(--primary)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
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