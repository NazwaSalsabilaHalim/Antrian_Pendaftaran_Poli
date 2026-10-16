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
import { formatNomor } from '../../../utils/dokter'
import { Toast } from '../../../components/it/ITComponents'

// Backend antrean membalas { OK: 0, MSG } kalau gagal
function ensureOk(result, fallback) {
  if (Number(result.OK) === 0) throw new Error(result.MSG || fallback)
  return result
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
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', text }

  const notify = (type, text) => setToast({ type, text })

  // Jalankan satu aksi: kunci tombol, bersihkan notifikasi, tangkap error
  async function run(action, failMessage) {
    setToast(null)
    setProcessing(true)

    try {
      await action()
    } catch (err) {
      notify('error', err.message || failMessage)
    } finally {
      setProcessing(false)
    }
  }

  // ================= DAFTAR DOKTER =================

  async function loadDoctors(manual = false) {
    setLoadingDoctors(true)
    setToast(null)

    try {
      // kalau diklik manual, tahan sebentar supaya spinner terlihat
      const [result] = await Promise.all([
        api.getDoctors(),
        manual ? new Promise((resolve) => setTimeout(resolve, 600)) : null,
      ])

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : []

      setDoctors(rows)

      if (manual) {
        setAid('')
        setPassword('')
        notify('success', 'Daftar dokter berhasil dimuat ulang.')
      } else if (aid && !rows.some((item) => String(item.AID) === aid)) {
        setAid('')
      }
    } catch (err) {
      notify('error', err.message || 'Gagal mengambil data dokter.')
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  // ================= AKSI =================

  function handleLogin(event) {
    event.preventDefault()

    if (!aid || !password) {
      notify('error', 'Pilih dokter dan masukkan password terlebih dahulu.')
      return
    }

    run(async () => {
      ensureOk(
        await api.loginDoctor(aid, password),
        'Login dokter gagal. Periksa password Anda.'
      )

      const data = await api.getDoctorQueueData(aid, password)

      setDoctor(data)
      setNomor(formatNomor(data.Antrian))
      setNomorManual(String(Number(data.Antrian) || 0))
      notify('success', 'Login berhasil! Panel antrean dokter siap digunakan.')
    }, 'Tidak dapat menghubungi server database.')
  }

  function handleChangeNomor(direction) {
    if (!doctor || processing) return

    run(async () => {
      const result = ensureOk(
        await api.updateDoctorQueue(aid, password, direction),
        'Nomor antrean gagal diubah.'
      )

      setNomor(formatNomor(result.Antrian))
      setNomorManual(String(Number(result.Antrian)))
      notify(
        'success',
        direction > 0
          ? `Nomor antrean bertambah ke ${formatNomor(result.Antrian)} (Tampil di TV Poli).`
          : `Nomor antrean diubah ke ${formatNomor(result.Antrian)}.`
      )
    }, 'Gagal mengubah nomor antrean.')
  }

  function handleManual(event) {
    event.preventDefault()

    if (!doctor || processing) return

    const angka = Number(nomorManual)

    if (nomorManual.trim() === '' || !Number.isInteger(angka) || angka < 0) {
      notify('error', 'Masukkan nomor antrean berupa bilangan bulat minimal 0.')
      return
    }

    run(async () => {
      const result = ensureOk(
        await api.setDoctorQueueManual(aid, password, angka),
        'Nomor manual gagal disimpan.'
      )

      setNomor(formatNomor(result.Antrian))
      notify('success', `Nomor antrean manual berhasil disimpan: ${formatNomor(result.Antrian)}.`)
    }, 'Gagal menyimpan nomor antrean.')
  }

  function handleLogout() {
    setDoctor(null)
    setPassword('')
    setNomor('000')
    setNomorManual('')
    setToast(null)
  }

  const selectedDoctor = doctors.find((item) => String(item.AID) === aid)

  // ================= TAMPILAN =================

  return (
    <div className="loket-page antrean-page">
      {/* HERO */}
      <section className="ambil-hero">
        <div className="ambil-hero__icon">
          <Stethoscope size={25} strokeWidth={1.9} />
        </div>

        <div className="ambil-hero__content">
          <span className="ambil-hero__eyebrow">PANEL POLIKLINIK</span>
          <h1>Kelola Antrean Dokter</h1>
          <p>
            Pilih dokter dan perbarui nomor antrean pasien poliklinik secara langsung ke Layar TV Poli.
          </p>
        </div>
      </section>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {!doctor ? (
        /* ================= LOGIN DOKTER ================= */
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
              <div className="antrean-field-group">
                <label className="antrean-label">Nama Dokter / Poli Tujuan</label>
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

              {/* Preview dokter yang dipilih */}
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
                    <strong className="antrean-selected-name">{selectedDoctor.Nama}</strong>
                    <span className="antrean-selected-meta">
                      {selectedDoctor.NamaPoli} • Ruang {selectedDoctor.Ruang || '-'} • Display {selectedDoctor.Display || '1'}
                    </span>
                  </div>
                </div>
              )}

              <div className="antrean-field-group antrean-password-group">
                <label className="antrean-label">Password Dokter</label>
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
                onClick={() => loadDoctors(true)}
                disabled={loadingDoctors || processing}
                className="antrean-reload-btn"
              >
                <RefreshCw size={14} className={loadingDoctors ? 'loading-spin' : ''} />
                <span>{loadingDoctors ? 'Memuat...' : 'Muat Ulang Daftar Dokter'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= WORKSPACE DOKTER AKTIF ================= */
        <div className="antrean-workspace-grid">
          {/* KIRI: profil dokter & nomor manual */}
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

                <div className="antrean-profile-badge">DOKTER AKTIF</div>

                <h3 className="antrean-profile-name">{doctor.Nama}</h3>
                <span className="antrean-profile-poli">{doctor.NamaPoli}</span>
                <span className="antrean-profile-room">
                  Ruang {doctor.Ruang || '-'} • Display TV {doctor.Display || '1'}
                </span>
              </div>

              <hr className="antrean-divider" />

              <div className="antrean-profile-actions">
                <a
                  href="/poli/display"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary antrean-tv-link"
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

            {/* Atur nomor manual */}
            <div className="antrean-manual-box">
              <div className="antrean-manual-header">
                <div className="antrean-manual-icon">
                  <ArrowDown size={16} />
                </div>
                <div>
                  <h4 className="antrean-manual-title">Atur Nomor Antrean Manual</h4>
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

          {/* KANAN: panel kontrol nomor */}
          <div className="card antrean-control-card">
            <div className="antrean-control-top">
              <span className="antrean-control-title">NOMOR ANTREAN SAAT INI</span>

              <div className="antrean-tv-badge">
                <span className="antrean-tv-badge-dot" />
                <span>Terhubung TV</span>
              </div>
            </div>

            <div className="antrean-number-box">
              <span className="antrean-number-label">Nomor Antrean</span>
              <div className="antrean-number-digit">{nomor}</div>
              <span className="antrean-number-sub">
                {doctor.NamaPoli} • Ruang {doctor.Ruang || '-'}
              </span>
            </div>

            <div className="antrean-actions-grid">
              <button
                type="button"
                onClick={() => handleChangeNomor(-1)}
                disabled={processing || Number(nomor) <= 0}
                className="btn btn-outline"
              >
                <ArrowLeft size={18} />
                <span>Sebelumnya (-1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleChangeNomor(1)}
                disabled={processing}
                className="btn"
              >
                <span>Panggil Berikutnya (+1)</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <p className="muted antrean-actions-hint">
              Panggil berikutnya memperbarui ke nomor {formatNomor(Number(nomor) + 1)} dan membunyikan bel TV.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}