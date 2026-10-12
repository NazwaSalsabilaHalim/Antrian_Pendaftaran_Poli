import { useEffect, useState } from 'react'
import {
  Stethoscope,
  LockKeyhole,
  LogIn,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Tv,
} from 'lucide-react'
import { api } from '../../../api/client'
import { Toast } from '../../../components/it/ITComponents'

function formatNomor(value) {
  if (value === null || value === undefined || value === '') {
    return '000'
  }
  return String(value).padStart(3, '0')
}

export default function KelolaAntrean() {
  const [doctors, setDoctors] = useState([])
  const [aid, setAid] = useState('')
  const [password, setPassword] = useState('')
  const [doctor, setDoctor] = useState(null)
  const [nomor, setNomor] = useState('000')
  const [nomorManual, setNomorManual] = useState('')
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadDoctors() {
    setLoadingDoctors(true)
    setError('')

    try {
      const result = await api.getDoctors()
      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : []

      setDoctors(rows)

      if (aid && !rows.some((item) => String(item.AID) === aid)) {
        setAid('')
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data dokter.')
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }, [success])

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!aid || !password) {
      setError('Pilih dokter dan masukkan password terlebih dahulu.')
      return
    }

    setProcessing(true)

    try {
      const result = await api.loginDoctor(aid, password)

      if (Number(result.OK) === 0) {
        throw new Error(result.MSG || 'Login dokter gagal. Periksa password Anda.')
      }

      const data = await api.getDoctorQueueData(aid, password)

      setDoctor(data)
      setNomor(formatNomor(data.Antrian))
      setNomorManual(String(Number(data.Antrian) || 0))
      setSuccess('Login berhasil! Panel antrean dokter siap digunakan.')
    } catch (err) {
      setError(err.message || 'Tidak dapat menghubungi server database.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleChangeNomor(direction) {
    if (!doctor || processing) return

    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      const result = await api.updateDoctorQueue(aid, password, direction)

      if (Number(result.OK) === 0) {
        throw new Error(result.MSG || 'Nomor antrean gagal diubah.')
      }

      setNomor(formatNomor(result.Antrian))
      setNomorManual(String(Number(result.Antrian)))
      setSuccess(
        direction > 0
          ? `Nomor antrean bertambah ke ${formatNomor(result.Antrian)} (Tampil di TV Poli).`
          : `Nomor antrean diubah ke ${formatNomor(result.Antrian)}.`,
      )
    } catch (err) {
      setError(err.message || 'Gagal mengubah nomor antrean.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleManual(event) {
    event.preventDefault()

    if (!doctor || processing) return

    if (
      nomorManual.trim() === '' ||
      !Number.isInteger(Number(nomorManual)) ||
      Number(nomorManual) < 0
    ) {
      setError('Masukkan nomor antrean berupa bilangan bulat minimal 0.')
      return
    }

    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      const result = await api.setDoctorQueueManual(aid, password, Number(nomorManual))

      if (Number(result.OK) === 0) {
        throw new Error(result.MSG || 'Nomor manual gagal disimpan.')
      }

      setNomor(formatNomor(result.Antrian))
      setSuccess(`Nomor antrean manual berhasil disimpan: ${formatNomor(result.Antrian)}.`)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan nomor antrean.')
    } finally {
      setProcessing(false)
    }
  }

  function handleLogout() {
    setDoctor(null)
    setPassword('')
    setNomor('000')
    setNomorManual('')
    setError('')
    setSuccess('')
  }

  const selectedDoctor = doctors.find((item) => String(item.AID) === aid)
  const toast = error
    ? { type: 'error', text: error }
    : success
      ? { type: 'success', text: success }
      : null

  return (
    <div className="loket-page antrean-page">
      {/* PAGE INTRO */}
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">
            <Stethoscope size={15} />
            PANEL POLIKLINIK
          </div>

          <h1 className="page-intro__title">
            Kelola Antrean Dokter
          </h1>

          <p className="page-intro__subtitle">
            Pilih dokter dan perbarui nomor antrean pasien poliklinik secara langsung ke Layar TV Poli.
          </p>
        </div>

        <div className="page-intro__status">
          <span />
          {doctor ? 'Dokter Aktif' : 'Siap Melayani'}
        </div>
      </div>

      <Toast toast={toast} onClose={() => { setError(''); setSuccess('') }} />

      {!doctor ? (
        /* ================= TAMPILAN LOGIN DOKTER ================= */
        <div className="antrean-login-container">
          <div className="card antrean-login-card">
            <div className="antrean-login-header">
              <div className="antrean-login-header-icon">
                <LockKeyhole size={22} />
              </div>
              <div className="antrean-login-header-text">
                <h3>Pilih & Login Dokter</h3>
                <p>Pilih nama dokter dan masukkan password untuk mengontrol antrean.</p>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              {/* Field Dokter */}
              <div className="antrean-field-group">
                <label className="antrean-label">
                  Nama Dokter / Poli Tujuan
                </label>
                <select
                  value={aid}
                  onChange={(e) => setAid(e.target.value)}
                  disabled={loadingDoctors || processing}
                  required
                  className="antrean-select"
                >
                  <option value="">
                    {loadingDoctors ? 'Memuat data dokter...' : '-- Pilih Dokter / Poliklinik --'}
                  </option>
                  {doctors.map((item) => (
                    <option key={item.AID} value={item.AID}>
                      {item.Nama} — {item.NamaPoli} {item.Ruang ? `(Ruang ${item.Ruang})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview Dokter yang dipilih */}
              {selectedDoctor && (
                <div className="antrean-selected-preview">
                  <div className="antrean-selected-avatar">
                    {selectedDoctor.foto ? (
                      <img
                        src={api.getDoctorPhotoUrl(selectedDoctor.foto)}
                        alt={selectedDoctor.Nama}
                        className="antrean-selected-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Stethoscope size={22} className="antrean-selected-icon" />
                    )}
                  </div>
                  <div className="antrean-selected-info">
                    <strong className="antrean-selected-name">
                      {selectedDoctor.Nama}
                    </strong>
                    <span className="antrean-selected-meta">
                      {selectedDoctor.NamaPoli} • Ruang {selectedDoctor.Ruang || '-'} • Display {selectedDoctor.Display || '1'}
                    </span>
                  </div>
                </div>
              )}

              {/* Field Password */}
              <div className="antrean-field-group antrean-password-group">
                <label className="antrean-label">
                  Password Dokter
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password dokter"
                  autoComplete="current-password"
                  disabled={processing}
                  required
                  className="antrean-input"
                />
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="btn btn-primary antrean-login-submit"
                disabled={processing || loadingDoctors}
              >
                <LogIn size={18} />
                <span>{processing ? 'Memverifikasi...' : 'Login & Buka Antrean'}</span>
              </button>
            </form>

            <div className="antrean-reload-wrap">
              <button
                type="button"
                onClick={loadDoctors}
                disabled={loadingDoctors || processing}
                className="antrean-reload-btn"
              >
                <RefreshCw size={14} className={loadingDoctors ? 'loading-spin' : ''} />
                <span>Muat Ulang Daftar Dokter</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= WORKSPACE DOKTER AKTIF ================= */
        <div className="antrean-workspace-grid">
          {/* SISI KIRI: Profil Dokter & Status Display */}
          <div className="antrean-profile-col">
            <div className="card antrean-profile-card">
              <div className="antrean-profile-center">
                <div className="antrean-profile-avatar">
                  {doctor.Foto || doctor.foto ? (
                    <img
                      src={api.getDoctorPhotoUrl(doctor.Foto || doctor.foto)}
                      alt={doctor.Nama}
                      className="antrean-profile-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Stethoscope size={36} className="antrean-profile-icon" />
                  )}
                </div>

                <div className="antrean-profile-badge">
                  DOKTER AKTIF
                </div>

                <h3 className="antrean-profile-name">
                  {doctor.Nama}
                </h3>
                <span className="antrean-profile-poli">
                  {doctor.NamaPoli}
                </span>
                <span className="antrean-profile-room">
                  Ruang {doctor.Ruang || '-'} • Display TV {doctor.Display || '1'}
                </span>
              </div>

              <hr className="antrean-divider" />

              <div className="antrean-profile-actions">
                <a
                  href={`/poli/display`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline antrean-tv-link"
                >
                  <Tv size={16} />
                  <span>Buka Layar TV Poli</span>
                  <span className="antrean-tv-link-arrow">↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={processing}
                  className="btn btn-danger-outline antrean-logout-btn"
                >
                  Ganti Dokter / Selesai
                </button>
              </div>
            </div>

            {/* Atur Nomor Manual */}
            <div className="antrean-manual-box">
              <div className="antrean-manual-header">
                <div className="antrean-manual-icon">
                  <ArrowDown size={16} />
                </div>
                <div>
                  <h4 className="antrean-manual-title">
                    Atur Nomor Antrean Manual
                  </h4>
                  <span className="antrean-manual-sub">
                    Gunakan jika ingin melompati atau mereset nomor antrean secara langsung.
                  </span>
                </div>
              </div>

              <form onSubmit={handleManual} className="antrean-manual-form">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={nomorManual}
                  onChange={(e) => setNomorManual(e.target.value)}
                  placeholder="Contoh: 5"
                  disabled={processing}
                  required
                  className="antrean-manual-input"
                />
                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn-secondary antrean-manual-submit"
                >
                  {processing ? 'Menyimpan...' : 'Set Nomor'}
                </button>
              </form>
            </div>
          </div>

          {/* SISI KANAN: Panel Kontrol Nomor Antrean */}
          <div className="card antrean-control-card">
            <div className="antrean-control-top">
              <div>
                <span className="antrean-control-title">
                  NOMOR ANTREAN SAAT INI
                </span>
                <p className="antrean-control-sub">
                  Nomor ini tampil secara langsung di Layar TV Poli {doctor.Display || '1'}.
                </p>
              </div>

              <div className="antrean-tv-badge">
                <span className="antrean-tv-badge-dot" />
                <span>Terhubung TV</span>
              </div>
            </div>

            {/* Kotak Nomor Antrean Besar */}
            <div className="antrean-number-box">
              <span className="antrean-number-label">
                Nomor Antrean
              </span>
              <div className="antrean-number-digit">
                {nomor}
              </div>
              <span className="antrean-number-sub">
                {doctor.NamaPoli} • Ruang {doctor.Ruang || '-'}
              </span>
            </div>

            {/* Tombol Pemanggilan Pasien (Next & Prev) */}
            <div className="antrean-actions-grid">
              <button
                type="button"
                onClick={() => handleChangeNomor(-1)}
                disabled={processing || Number(nomor) <= 0}
                className="btn btn-outline antrean-btn-prev"
              >
                <ArrowLeft size={20} />
                <span className="antrean-btn-prev-text">Prev (-1)</span>
                <small className="antrean-btn-prev-sub">Nomor sebelumnya</small>
              </button>

              <button
                type="button"
                onClick={() => handleChangeNomor(1)}
                disabled={processing}
                className="btn antrean-btn-next"
              >
                <div className="antrean-btn-next-main">
                  <span>Panggil Pasien Berikutnya (+1)</span>
                  <ArrowRight size={20} />
                </div>
                <small className="antrean-btn-next-sub">
                  Update ke nomor {formatNomor(Number(nomor) + 1)} & bunyikan bel TV
                </small>
              </button>
            </div>


          </div>
        </div>
      )}
    </div>
  )
}