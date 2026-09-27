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

  // =========================
  // Load Configuration
  // =========================
  useEffect(() => {
    api.getKonfigurasi()
      .then((res) => {
        setForm(res.konfigurasi)
        setError('')
      })
      .catch((e) => {
        setError(e.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // =========================
  // Form Change
  // =========================
  function handleChange(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))

    setSaved(false)
  }

  // =========================
  // Submit
  // =========================
  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    api.saveKonfigurasi(form)
      .then(() => {
        setError('')
        setSaved(true)
      })
      .catch((e) => {
        setError(e.message)
      })
      .finally(() => {
        setSaving(false)
      })
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">
            KONFIGURASI
          </div>

          <h1 className="page-intro__title">
            Konfigurasi Antrian
          </h1>

          <p className="page-intro__subtitle">
            Atur aturan pembentukan nomor antrian
          </p>
        </div>
      </div>

      {/* Notification */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {saved && (
        <div className="alert-success config-success">
          Konfigurasi berhasil disimpan.
        </div>
      )}

      {/* Configuration Form */}
      {loading ? (
        <div className="card">
          <div className="empty-state">
            Memuat data...
          </div>
        </div>
      ) : (
        <form
          className="card"
          onSubmit={handleSubmit}
        >
          <div className="grid config-grid">
            {/* Nomor Awal */}
            <div>
              <label className="config-field-label">
                Nomor Awal
              </label>

              <input
                type="number"
                value={form.nomor_awal}
                onChange={(e) =>
                  handleChange(
                    'nomor_awal',
                    Number(e.target.value)
                  )
                }
                className="config-input"
              />
            </div>

            {/* Nomor Maksimal */}
            <div>
              <label className="config-field-label">
                Nomor Maksimal
              </label>

              <input
                type="number"
                value={form.nomor_maksimal}
                onChange={(e) =>
                  handleChange(
                    'nomor_maksimal',
                    Number(e.target.value)
                  )
                }
                className="config-input"
              />
            </div>

            {/* Reset Nomor */}
            <div>
              <label className="config-field-label">
                Reset Nomor
              </label>

              <select
                value={form.reset_nomor}
                onChange={(e) =>
                  handleChange(
                    'reset_nomor',
                    e.target.value
                  )
                }
                className="config-input"
              >
                <option value="daily">
                  Setiap Hari
                </option>

                <option value="manual">
                  Manual
                </option>
              </select>
            </div>

            {/* Status Aktif */}
            <div>
              <label className="config-field-label">
                Aktif
              </label>

              <select
                value={form.aktif}
                onChange={(e) =>
                  handleChange(
                    'aktif',
                    e.target.value
                  )
                }
                className="config-input"
              >
                <option value="yes">
                  Ya
                </option>

                <option value="no">
                  Tidak
                </option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving
              ? 'Menyimpan...'
              : 'Simpan Konfigurasi'}
          </button>
        </form>
      )}
    </>
  )
}