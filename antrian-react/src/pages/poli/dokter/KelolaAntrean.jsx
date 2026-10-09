import { useEffect, useState } from 'react'
import {
  Stethoscope,
  LockKeyhole,
  LogIn,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Tv,
} from 'lucide-react'
import { api } from '../../../api/client'

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

  return (
    <div className="loket-page">
      {/* PAGE INTRO — Desain & Warna Selaras dengan Pendaftaran */}
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

      {/* ERROR & SUCCESS NOTIFICATIONS */}
      {error && (
        <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            background: 'var(--success-bg)',
            color: 'var(--success)',
            border: '1px solid rgba(47, 155, 108, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {!doctor ? (
        /* ================= TAMPILAN LOGIN DOKTER ================= */
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '32px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockKeyhole size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                  Pilih & Login Dokter
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-soft)' }}>
                  Pilih nama dokter dan masukkan password untuk mengontrol antrean.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              {/* Field Dokter */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                  Nama Dokter / Poli Tujuan
                </label>
                <select
                  value={aid}
                  onChange={(e) => setAid(e.target.value)}
                  disabled={loadingDoctors || processing}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    fontSize: '14px',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: '12px',
                    marginBottom: '18px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: 'var(--primary-soft)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedDoctor.foto ? (
                      <img
                        src={api.getDoctorPhotoUrl(selectedDoctor.foto)}
                        alt={selectedDoctor.Nama}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Stethoscope size={22} style={{ color: 'var(--primary)' }} />
                    )}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text)' }}>
                      {selectedDoctor.Nama}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                      {selectedDoctor.NamaPoli} • Ruang {selectedDoctor.Ruang || '-'} • Display {selectedDoctor.Display || '1'}
                    </span>
                  </div>
                </div>
              )}

              {/* Field Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
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
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    fontSize: '14px',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="primary-button"
                disabled={processing || loadingDoctors}
                style={{
                  width: '100%',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '12px',
                }}
              >
                <LogIn size={18} />
                <span>{processing ? 'Memverifikasi...' : 'Login & Buka Antrean'}</span>
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={loadDoctors}
                disabled={loadingDoctors || processing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} className={loadingDoctors ? 'loading-spin' : ''} />
                <span>Muat Ulang Daftar Dokter</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= WORKSPACE DOKTER AKTIF ================= */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '24px', alignItems: 'start' }}>
          {/* SISI KIRI: Profil Dokter & Status Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: 'var(--primary-soft)',
                    border: '3px solid var(--border-soft)',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {doctor.Foto || doctor.foto ? (
                    <img
                      src={api.getDoctorPhotoUrl(doctor.Foto || doctor.foto)}
                      alt={doctor.Nama}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Stethoscope size={36} style={{ color: 'var(--primary)' }} />
                  )}
                </div>

                <div
                  style={{
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                  }}
                >
                  DOKTER AKTIF
                </div>

                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
                  {doctor.Nama}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-soft)', marginTop: '4px' }}>
                  {doctor.NamaPoli}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Ruang {doctor.Ruang || '-'} • Display TV {doctor.Display || '1'}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-soft)', margin: '18px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={`/poli/display`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Tv size={16} />
                  <span>Buka Layar TV Poli</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={processing}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--danger)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Ganti Dokter / Selesai
                </button>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Panel Kontrol Nomor Antrean */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  NOMOR ANTREAN SAAT INI
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--text-soft)' }}>
                  Nomor ini tampil secara langsung di Layar TV Poli {doctor.Display || '1'}.
                </p>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                <span>Terhubung TV</span>
              </div>
            </div>

            {/* Kotak Nomor Antrean Besar (Tema Selaras Pendaftaran) */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-soft) 0%, #d8eee5 100%)',
                border: '2px solid var(--border)',
                borderRadius: '20px',
                padding: '36px 20px',
                textAlign: 'center',
                marginBottom: '28px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--primary-dark)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Nomor Antrean
              </span>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 900,
                  color: 'var(--primary-dark)',
                  lineHeight: 1,
                  margin: '10px 0',
                  letterSpacing: '-0.03em',
                  fontFamily: 'monospace, var(--font-body)',
                }}
              >
                {nomor}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
                {doctor.NamaPoli} • Ruang {doctor.Ruang || '-'}
              </span>
            </div>

            {/* Tombol Pemanggilan Pasien (Next & Prev) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '32px' }}>
              <button
                type="button"
                onClick={() => handleChangeNomor(-1)}
                disabled={processing || Number(nomor) <= 0}
                style={{
                  padding: '16px',
                  background: 'var(--surface-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  color: 'var(--text)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 700,
                  cursor: Number(nomor) <= 0 ? 'not-allowed' : 'pointer',
                  opacity: Number(nomor) <= 0 ? 0.5 : 1,
                }}
              >
                <ArrowLeft size={20} />
                <span style={{ fontSize: '14px' }}>Prev (-1)</span>
                <small style={{ fontSize: '11px', color: 'var(--text-soft)', fontWeight: 400 }}>Nomor sebelumnya</small>
              </button>

              <button
                type="button"
                onClick={() => handleChangeNomor(1)}
                disabled={processing}
                className="primary-button"
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '16px',
                  fontWeight: 800,
                  boxShadow: '0 8px 20px rgba(38, 142, 103, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Panggil Pasien Berikutnya (+1)</span>
                  <ArrowRight size={20} />
                </div>
                <small style={{ fontSize: '12px', opacity: 0.85, fontWeight: 400 }}>
                  Update ke nomor {formatNomor(Number(nomor) + 1)} & bunyikan bel TV
                </small>
              </button>
            </div>

            {/* Atur Nomor Manual */}
            <div
              style={{
                background: 'var(--surface-soft)',
                border: '1px solid var(--border-soft)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowDown size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                    Atur Nomor Antrean Manual
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                    Gunakan jika ingin melompati atau mereset nomor antrean secara langsung.
                  </span>
                </div>
              </div>

              <form onSubmit={handleManual} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={nomorManual}
                  onChange={(e) => setNomorManual(e.target.value)}
                  placeholder="Contoh: 5"
                  disabled={processing}
                  required
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    fontSize: '14px',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--secondary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {processing ? 'Menyimpan...' : 'Set Nomor'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}