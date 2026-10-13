import { useCallback, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { api } from '../../api/client'
import { useInterval } from '../../hooks/useInterval'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { StatCard } from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'

const REFRESH_MS = 15000

// Grafik per jam: 07:00–20:00
const JAM_MULAI = 7
const JUMLAH_JAM = 14

// ================= HELPER =================

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// "2026-10-13 14:30:00" -> Date
function parseWaktu(value) {
  return new Date(value.replace(' ', 'T'))
}

// Selisih dua waktu dalam menit (minimal 0)
function selisihMenit(dari, sampai) {
  return Math.max(
    0,
    Math.round((parseWaktu(sampai) - parseWaktu(dari)) / 60000)
  )
}

function formatTanggalWaktu(value) {
  if (!value) return '-'

  const date = parseWaktu(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Dashboard() {
  // ================= STATE =================

  const [tanggal, setTanggal] = useState(todayStr())
  const [data, setData] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    paginatedItems: paginatedRiwayat,
  } = usePagination(riwayat, 10)

  // ================= AMBIL DATA =================

  const load = useCallback(() => {
    Promise.all([
      api.getStatistik(tanggal),
      api.getRiwayat(`tanggal=${tanggal}`),
    ])
      .then(([statistik, riwayatData]) => {
        setData(statistik)
        setRiwayat(riwayatData.riwayat || [])
        setCurrentPage(1)
        setError('')
        setLastUpdate(new Date())
      })
      .catch((e) => setError(e.message))
  }, [tanggal])

  // Muat ulang saat tanggal berubah
  useEffect(() => {
    load()
  }, [load])

  // Auto-refresh setiap 15 detik untuk tanggal hari ini
  useInterval(() => {
    if (tanggal === todayStr()) load()
  }, REFRESH_MS)

  // ================= EXPORT =================

  function exportExcel() {
    if (riwayat.length === 0) return

    const dataForExcel = riwayat.map((row) => ({
      'No. Antrian': row.nomor,
      'Jenis Pasien': row.jenis_pasien,
      Counter: row.counter_nama,
      Status: row.status,
      'Waktu Ambil Nomor': row.tanggal_insert,
      'Waktu Dipanggil': row.tanggal_panggil,
    }))

    const ws = XLSX.utils.json_to_sheet(dataForExcel)

    ws['!cols'] = [
      { wch: 12 },
      { wch: 26 },
      { wch: 14 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ]

    const range = XLSX.utils.decode_range(ws['!ref'])

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })

      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E6F3EE' } },
        }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Antrian')

    XLSX.writeFile(wb, `riwayat-antrian-${tanggal}.xlsx`)
  }

  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Riwayat & Statistik Antrian', 14, 16)

    doc.setFontSize(10)
    doc.text(`Tanggal: ${tanggal}`, 14, 23)

    autoTable(doc, {
      startY: 28,
      head: [[
        'No',
        'Nomor Antrian',
        'Jenis Pasien',
        'Loket',
        'Status',
        'Waktu Diambil',
        'Waktu Dipanggil',
      ]],
      body: riwayat.map((r, index) => [
        index + 1,
        r.nomor,
        r.jenis_pasien,
        r.counter_nama,
        r.status,
        formatTanggalWaktu(r.tanggal_insert),
        formatTanggalWaktu(r.tanggal_panggil),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [38, 142, 103] },
    })

    doc.save(`riwayat-antrian-${tanggal}.pdf`)
  }

  // ================= STATISTIK PELAYANAN =================

  const loketData = data?.per_counter || []

  // Waktu tunggu (menit) tiap pasien yang sudah dipanggil
  const waktuTunggu = riwayat
    .filter((r) => r.tanggal_insert && r.tanggal_panggil)
    .map((r) => selisihMenit(r.tanggal_insert, r.tanggal_panggil))

  const rataRataTunggu =
    waktuTunggu.length > 0
      ? Math.round(
          waktuTunggu.reduce((total, menit) => total + menit, 0) /
            waktuTunggu.length
        )
      : 0

  const waktuTungguTerlama =
    waktuTunggu.length > 0 ? Math.max(...waktuTunggu) : 0

  const loketTeraktif =
    loketData.length > 0
      ? [...loketData].sort(
          (a, b) =>
            Number(b.total_dilayani || 0) -
            Number(a.total_dilayani || 0)
        )[0]
      : null

  // Jumlah pemanggilan per jam
  const jumlahPerJam = {}

  riwayat.forEach((r) => {
    if (!r.tanggal_panggil) return

    const waktu = parseWaktu(r.tanggal_panggil)

    if (Number.isNaN(waktu.getTime())) return

    const jam = waktu.getHours()
    jumlahPerJam[jam] = (jumlahPerJam[jam] || 0) + 1
  })

  const jamTerpadatData = Object.entries(jumlahPerJam).sort(
    (a, b) => b[1] - a[1]
  )[0]

  const jamTerpadat = jamTerpadatData
    ? `${String(jamTerpadatData[0]).padStart(2, '0')}:00`
    : '-'

  const jumlahJamTerpadat = jamTerpadatData ? jamTerpadatData[1] : 0

  // ================= DATA GRAFIK =================

  const chartData = Array.from({ length: JUMLAH_JAM }, (_, i) => {
    const jam = JAM_MULAI + i

    return {
      jam: `${String(jam).padStart(2, '0')}:00`,
      jumlah: jumlahPerJam[jam] || 0,
    }
  })

  // Batang jam puncak diberi warna berbeda (kosong jika belum ada data)
  const maxJumlah = Math.max(0, ...chartData.map((d) => d.jumlah))

  const jamPuncakIndex =
    maxJumlah > 0
      ? chartData.findIndex((d) => d.jumlah === maxJumlah)
      : -1

  // ================= TAMPILAN =================

  return (
    <div>
      {error && (
        <div className="it-toast it-toast--error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER TANGGAL & EXPORT */}
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
          onClick={exportExcel}
          disabled={riwayat.length === 0}
        >
          Export Excel
        </button>

        <button
          className="btn btn-outline"
          onClick={exportPDF}
          disabled={riwayat.length === 0}
        >
          Export PDF
        </button>

        <div className="page-intro__status">
          <span />
          Data diperbarui otomatis
        </div>

        {lastUpdate && (
          <span className="muted muted--sm">
            Diperbarui {lastUpdate.toLocaleTimeString('id-ID')}
          </span>
        )}
      </div>

      {data && (
        <>
          {/* STATISTIK PELAYANAN */}
          <div className="grid stat-grid">
            <StatCard
              label="Rata-rata Waktu Tunggu"
              value={`${rataRataTunggu} menit`}
              description={`${waktuTunggu.length} data pemanggilan`}
            />

            <StatCard
              label="Waktu Tunggu Terlama"
              value={`${waktuTungguTerlama} menit`}
              description="Waktu tunggu sebelum dipanggil"
            />

            <StatCard
              label="Loket Teraktif"
              value={loketTeraktif?.nama || '-'}
              description={`${Number(
                loketTeraktif?.total_dilayani || 0
              )} pasien dilayani`}
            />

            <StatCard
              label="Jam Terpadat"
              value={jamTerpadat}
              description={`${jumlahJamTerpadat} pasien dipanggil`}
            />
          </div>

          {/* RIWAYAT PEMANGGILAN */}
          <div className="card dashboard-history-card">
            <div className="dashboard-history-header">
              <p className="section-title dashboard-history-title">
                Riwayat Pemanggilan
              </p>
            </div>

            <div className="data-table-scroll">
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
                  {paginatedRiwayat.map((r, index) => (
                    <tr key={r.id}>
                      <td>{startIndex + index + 1}</td>

                      <td>
                        <strong>{r.nomor}</strong>
                      </td>

                      <td>{r.jenis_pasien}</td>
                      <td>{r.counter_nama}</td>
                      <td>{r.status}</td>
                      <td>{formatTanggalWaktu(r.tanggal_insert)}</td>
                      <td>{formatTanggalWaktu(r.tanggal_panggil)}</td>
                    </tr>
                  ))}

                  {riwayat.length === 0 && (
                    <tr>
                      <td colSpan={7} className="muted">
                        Belum ada riwayat pemanggilan pada tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={riwayat.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              itemName="antrian"
            />
          </div>

          {/* DISTRIBUSI PEMANGGILAN PER JAM */}
          <div className="card jam-chart-card jam-chart-card--full">
            <p className="jam-chart-title">
              Distribusi Pemanggilan per Jam
            </p>

            <span className="jam-chart-subtitle">
              Jumlah pasien dipanggil tiap jam pada tanggal ini
            </span>

            <div className="jam-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-soft)"
                  />

                  <XAxis
                    dataKey="jam"
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    axisLine={{ stroke: 'var(--border-soft)' }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [`${value} pasien`, 'Dipanggil']}
                    labelFormatter={(label) => `Jam ${label}`}
                  />

                  <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          index === jamPuncakIndex
                            ? 'var(--warning)'
                            : 'var(--primary)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}