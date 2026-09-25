import { useEffect, useState } from 'react'
import { api } from '../../api/client'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function AntrianPage() {
  const [tanggal, setTanggal] = useState(todayStr())
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    api.getRiwayat(`tanggal=${tanggal}`)
      .then((res) => {
        setRiwayat(res.riwayat || [])
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tanggal])

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">DATA ANTRIAN</div>
          <h1 className="page-intro__title">Data Antrian</h1>
          <p className="page-intro__subtitle">
            Melihat seluruh data antrian berdasarkan tanggal
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card_loket-header card_loket-header--date">
  <label htmlFor="tanggal" className="muted">Tanggal:</label>

        <input
          id="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />

        <button className="btn btn-outline" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            Daftar Antrian
          </p>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Antrian</th>
                  <th>Jenis Pendaftaran</th>
                  <th>Loket</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {riwayat.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><strong>{item.nomor}</strong></td>
                    <td>{item.jenis_pasien}</td>
                    <td>{item.counter_nama || '-'}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}

                {riwayat.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">Belum ada antrian pada tanggal ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}