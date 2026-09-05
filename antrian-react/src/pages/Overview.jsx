import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'

const POLL_MS = 5000
const ACCENTS = ['accent-a', 'accent-b', 'accent-c', 'accent-d']

export default function Overview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.getLiveMonitor().then(setData).then(() => setError('')).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useInterval(load, POLL_MS)

  return (
    <div>
      {error && <div className="error-banner">{error}</div>}

      <div className="section-header">
        <h2 className="section-title">Sedang Dilayani</h2>
        <span className="live-dot">
          <span className="live-dot__ping" /> Live
        </span>
      </div>

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

      <h2 className="section-title" style={{ marginTop: 32 }}>Menunggu</h2>
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
  )
}
