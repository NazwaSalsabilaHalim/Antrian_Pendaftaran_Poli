import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'

const REFRESH_MS = 15000

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const [tanggal, setTanggal] = useState(todayStr())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)

  const load = useCallback(() => {
    api
      .getStatistik(tanggal)
      .then((d) => {
        setData(d)
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

  return (
    <div>
      <h1 className="page-title">Dashboard Antrian</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="card loket-header">
        <label htmlFor="tanggal" className="muted">Tanggal:</label>
        <input
          id="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />
        <button className="btn btn-outline" onClick={load}>Refresh</button>
        {lastUpdate && (
          <span className="muted" style={{ fontSize: 12 }}>
            Diperbarui {lastUpdate.toLocaleTimeString('id-ID')}
          </span>
        )}
      </div>

      {data && (
        <>
          <div className="grid stat-grid">
            <div className="stat-card">
              <div className="stat-card__label">Total Nomor Diambil</div>
              <div className="stat-card__value">{data.total_dicetak}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Sudah Dipanggil</div>
              <div className="stat-card__value">{data.total_dipanggil}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Sisa Antrian</div>
              <div className="stat-card__value">{data.sisa}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Progres Hari Ini</div>
              <div className="stat-card__value">{persenSelesai}%</div>
              <div className="progress-bar" style={{ marginTop: 10 }}>
                <div className="progress-bar__fill" style={{ width: `${persenSelesai}%` }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <p className="page-title" style={{ fontSize: 16 }}>Per Jenis Pasien</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Jenis Pasien</th>
                  <th>Diambil</th>
                  <th>Dipanggil</th>
                  <th>Sisa</th>
                </tr>
              </thead>
              <tbody>
                {data.per_tombol.map((t) => (
                  <tr key={t.tombol_id}>
                    <td>{t.nama}</td>
                    <td>{t.total_dicetak}</td>
                    <td>{t.total_dipanggil}</td>
                    <td>{t.sisa}</td>
                  </tr>
                ))}
                {data.per_tombol.length === 0 && (
                  <tr><td colSpan={4} className="muted">Belum ada antrian pada tanggal ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <p className="section-title">Per Loket</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loket</th>
                  <th>Total Dilayani</th>
                </tr>
              </thead>
              <tbody>
                {data.per_counter.map((c) => (
                  <tr key={c.counter_id}>
                    <td>{c.nama}</td>
                    <td>{c.total_dilayani}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
