import { useCallback, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { api } from '../../api/client'
import { useInterval } from '../../hooks/useInterval'

const POLL_MS = 5000 // Sedang Dilayani & Menunggu
const STAT_POLL_MS = 15000 // Ringkasan hari ini
const ACCENTS = ['accent-a', 'accent-b', 'accent-c', 'accent-d']

// Tanggal hari ini sesuai jam lokal (bukan UTC)
function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Rata-rata waktu tunggu (menit) per nama loket
function hitungRataTungguPerLoket(riwayat) {
  const kumpul = {}

  riwayat.forEach((r) => {
    if (!r.tanggal_insert || !r.tanggal_panggil || !r.counter_nama) return

    const masuk = new Date(r.tanggal_insert.replace(' ', 'T'))
    const dipanggil = new Date(r.tanggal_panggil.replace(' ', 'T'))
    const menit = Math.max(0, Math.round((dipanggil - masuk) / 60000))

    if (!kumpul[r.counter_nama]) kumpul[r.counter_nama] = []
    kumpul[r.counter_nama].push(menit)
  })

  const hasil = {}
  Object.keys(kumpul).forEach((nama) => {
    const list = kumpul[nama]
    hasil[nama] = Math.round(list.reduce((a, b) => a + b, 0) / list.length)
  })

  return hasil
}

export default function Overview() {
  const [data, setData] = useState(null)
  const [stat, setStat] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [error, setError] = useState('')

  // Sedang Dilayani & Menunggu (cepat, 5 detik)
  const load = useCallback(() => {
    api
      .getLiveMonitor()
      .then(setData)
      .then(() => setError(''))
      .catch((e) => setError(e.message))
  }, [])

  // Ringkasan hari ini (15 detik)
  const loadStat = useCallback(() => {
    const tgl = todayStr()

    Promise.all([api.getStatistik(tgl), api.getRiwayat(`tanggal=${tgl}`)])
      .then(([statistik, riwayatData]) => {
        setStat(statistik)
        setRiwayat(riwayatData.riwayat || [])
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    load()
    loadStat()
  }, [load, loadStat])

  useInterval(load, POLL_MS)
  useInterval(loadStat, STAT_POLL_MS)

  const persenSelesai =
    stat && stat.total_dicetak > 0
      ? Math.round((stat.total_dipanggil / stat.total_dicetak) * 100)
      : 0

  const jenisPasien = stat?.per_tombol || []
  const loketData = stat?.per_counter || []
  const rataTungguPerLoket = hitungRataTungguPerLoket(riwayat)

  return (
    <div>
      {error && (
        <div className="it-toast it-toast--error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-2col">
        {/* ============ KOLOM KIRI: PANTAUAN LIVE ============ */}
        <div className="dashboard-2col__column">
          <h2 className="section-title">Sedang Dilayani</h2>

          {data && data.serving.length === 0 && (
            <div className="card empty-state">Belum ada nomor yang dipanggil hari ini.</div>
          )}

          <div className="serving-grid">
            {data?.serving.map((s, i) => (
              <div key={s.counter_id} className={`serving-card ${ACCENTS[i % ACCENTS.length]}`}>
                <div className="serving-card__top">
                  <span className="badge">{s.tombol_nama}</span>
                  <span className="serving-card__room">{s.counter_nama}</span>
                </div>
                <div className="serving-card__eyebrow">Nomor Antrian</div>
                <div className="serving-card__number">{s.nomor_display}</div>
                <div className="serving-card__status">
                  <span className="status-dot" /> Dipanggil pukul {s.dipanggil_pukul}
                </div>
              </div>
            ))}
          </div>

          <h2 className="section-title section-title--spaced">Menunggu</h2>
          <div className="waiting-grid">
            {data?.waiting.map((w) => (
              <div key={w.tombol_id} className="waiting-col">
                <div className="waiting-col__header">
                  <span>{w.nama}</span>
                  <span className="waiting-col__count">{w.total_tunggu} Menunggu</span>
                </div>
                {w.nomor_berikut.length === 0 ? (
                  <div className="waiting-row muted">Tidak ada antrian</div>
                ) : (
                  w.nomor_berikut.map((n, i) => (
                    <div key={n} className="waiting-row">
                      <span className="waiting-row__index">{i + 1}</span>
                      <span>{n}</span>
                      {i === 0 && <span className="waiting-row__tag">Berikutnya</span>}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ============ KOLOM KANAN: RINGKASAN HARI INI ============ */}
        <div className="dashboard-2col__column">
          <h2 className="section-title">Ringkasan Hari Ini</h2>

          {stat && (
            <>
              {/* PERSENTASE SELESAI */}
              <div className="stat-card">
                <div className="stat-card__label">Persentase Selesai</div>
                <div className="stat-card__pct">{persenSelesai}%</div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${persenSelesai}%` }} />
                </div>
              </div>

              {/* RINGKASAN JENIS PASIEN */}
              <div className="card jenis-pasien-card">
                <p className="jenis-pasien-title">Ringkasan Jenis Pasien</p>

                <div className="jenis-pasien-grid">
                  {jenisPasien.map((t) => (
                    <div key={t.tombol_id} className="jenis-pasien-item">
                      <div className="jenis-pasien-name">{t.nama}</div>

                      <div className="jenis-pasien-stats">
                        <div>
                          <div className="jenis-pasien-label">Diambil</div>
                          <strong>{t.total_dicetak}</strong>
                        </div>

                        <div>
                          <div className="jenis-pasien-label">Dipanggil</div>
                          <strong>{t.total_dipanggil}</strong>
                        </div>

                        <div>
                          <div className="jenis-pasien-label">Sisa</div>
                          <strong>{t.sisa}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PER LOKET */}
              <div className="card loket-card">
                <div className="loket-header">
                  <div>
                    <p className="loket-title">Per Loket</p>
                  </div>
                </div>

                <div className="loket-grid">
                  {loketData.map((c) => {
                    const rataRata = rataTungguPerLoket[c.nama]

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
                            {rataRata !== undefined ? `${rataRata} menit` : '-'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}