import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function KonfigurasiPage() {
  const [form, setForm] = useState({
    nomor_awal: 1,
    nomor_maksimal: 999,
    reset_nomor: 'daily',
    aktif: 'yes',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getKonfigurasi()
      .then((res) => {
        setForm(res.konfigurasi)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    api.saveKonfigurasi(form)
      .then(() => {
        setError('')
        setSaved(true)
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false))
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">KONFIGURASI</div>
          <h1 className="page-intro__title">Konfigurasi Antrian</h1>
          <p className="page-intro__subtitle">
            Atur aturan pembentukan nomor antrian
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="alert-success" style={{ marginBottom: 18 }}>Konfigurasi berhasil disimpan.</div>}

      {loading ? (
        <div className="card">
          <div className="empty-state">Memuat data...</div>
        </div>
      ) : (
        <form className="card" onSubmit={handleSubmit}>
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: 22 }}
          >
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>
                Nomor Awal
              </label>
              <input
                type="number"
                value={form.nomor_awal}
                onChange={(e) => handleChange('nomor_awal', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>
                Nomor Maksimal
              </label>
              <input
                type="number"
                value={form.nomor_maksimal}
                onChange={(e) => handleChange('nomor_maksimal', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>
                Reset Nomor
              </label>
              <select
                value={form.reset_nomor}
                onChange={(e) => handleChange('reset_nomor', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="daily">Setiap Hari</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 7 }}>
                Aktif
              </label>
              <select
                value={form.aktif}
                onChange={(e) => handleChange('aktif', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="yes">Ya</option>
                <option value="no">Tidak</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </form>
      )}
    </>
  )
}