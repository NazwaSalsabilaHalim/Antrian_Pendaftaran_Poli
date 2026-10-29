import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize, Minimize, Volume2, VolumeX, Stethoscope } from 'lucide-react'
import { api } from '../../api/client'
import { formatNomor } from '../../utils/dokter'
import {
  FlapRow,
  TVBackground,
  TVFooter,
  TVHeader,
  useAudioUnlock,
} from '../../components/tv/TVShared'

const POLL_MS = 3000

/* ============================================================
   DOCTOR CARD
   ============================================================ */

function DoctorCard({ doctor, isCalling }) {
  const nomorFormatted = formatNomor(doctor.Antrian)
  const isZero = Number(doctor.Antrian) === 0

  return (
    <div className={`tv-poli-card${!isZero ? ' tv-poli-card--active' : ''}${isCalling ? ' tv-poli-card--calling' : ''}`}>

      {/* Badge dipanggil */}
      {isCalling && (
        <span className="tv-poli-card__badge">DIPANGGIL</span>
      )}

      {/* Foto Dokter */}
      <div className="tv-poli-card__photo">
        {doctor.foto ? (
          <img
            src={api.getDoctorPhotoUrl(doctor.foto)}
            alt={doctor.Nama}
            className="tv-poli-card__photo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={`tv-poli-card__photo-fallback${doctor.foto ? ' tv-poli-card__photo-fallback--hidden' : ''}`}>
          <Stethoscope size={48} />
        </div>
      </div>

      {/* Info Dokter */}
      <div className="tv-poli-card__info">
        <strong className="tv-poli-card__name" title={doctor.Nama}>
          {doctor.Nama}
        </strong>
        <span className="tv-poli-card__specialty">
          {doctor.NamaPoli || 'Spesialis'}
        </span>
        <span className="tv-poli-card__room">
          {doctor.Ruang ? `Ruang ${doctor.Ruang}` : 'Ruang —'}
        </span>
      </div>

      {/* Divider */}
      <div className="tv-poli-card__divider" />

      {/* Nomor Antrian */}
      <div className="tv-poli-card__queue">

        <div className="tv-poli-card__regpas">
          <span className="tv-poli-card__regpas-label">NO. REG</span>
          <strong className="tv-poli-card__regpas-value">
            {isZero ? '—' : (doctor.RegPasID || '—')}
          </strong>
        </div>

        <span className="tv-poli-card__queue-label">NOMOR ANTREAN</span>
        <div className="tv-number-wrap">
          <FlapRow value={nomorFormatted} />
        </div>
      </div>

    </div>
  )
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function DisplayAntrean() {
  const [doctors, setDoctors] = useState([])
  const [display, setDisplay] = useState('1')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [recentlyChangedAid, setRecentlyChangedAid] = useState(null)

  const audioRef = useRef(null)
  const prevQueuesRef = useRef({})
  const isFirstPollRef = useRef(true)

  const [audioReady, setAudioReady] = useAudioUnlock(audioRef, api.getBellUrl())

  /* ---- Polling ---- */
  const poll = useCallback(async () => {
    try {
      const params = `display=${encodeURIComponent(display)}`
      const result = await api.getDoctors(params)

      const activeDoctors = Array.isArray(result.data)
        ? result.data.filter((doc) => Number(doc.Status) === 1)
        : []

      let changedAid = null

      activeDoctors.forEach((doc) => {
        const aid = String(doc.AID)
        const currentQueue = Number(doc.Antrian) || 0
        const prevQueue = prevQueuesRef.current[aid]

        // Dianggap "dipanggil" hanya kalau nomor NAIK.
        // Nomor dimundurkan atau di-reset ke 0 cukup memperbarui tampilan, tanpa bel dan badge.
        if (!isFirstPollRef.current && prevQueue !== undefined && currentQueue > prevQueue) {
          changedAid = aid
        }
        prevQueuesRef.current[aid] = currentQueue
      })

      if (changedAid) {
        setRecentlyChangedAid(changedAid)
        setTimeout(() => setRecentlyChangedAid(null), 8000)

        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(() => { })
        }
      }

      isFirstPollRef.current = false
      setDoctors(activeDoctors)
    } catch (e) {
      console.warn('Gagal polling antrean poli:', e.message)
    }
  }, [display])

  useEffect(() => {
    isFirstPollRef.current = true
    prevQueuesRef.current = {}
    poll()

    const interval = setInterval(poll, POLL_MS)
    return () => clearInterval(interval)
  }, [poll])

  /* ---- Fullscreen ---- */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => { })
      setIsFullscreen(false)
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="tv-screen">
      <audio ref={audioRef} preload="auto" />

      <TVBackground />

      <TVHeader liveLabel="LIVE MONITOR POLIKLINIK">
        <div className="tv-poli-controls">
          {/* Tombol Audio */}
          <button
            type="button"
            className={`tv-poli-btn-audio${audioReady ? ' tv-poli-btn-audio--active' : ''}`}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.play().then(() => setAudioReady(true)).catch(() => { })
              }
            }}
            title={audioReady ? 'Audio Bell Aktif' : 'Klik untuk Aktifkan Audio'}
          >
            {audioReady ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{audioReady ? 'Audio Aktif' : 'Aktifkan Audio'}</span>
          </button>

          {/* Selector Nurse Station */}
          <select
            className="tv-poli-select"
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)} className="tv-poli-select__option">
                Nurse Station {i + 1}
              </option>
            ))}
          </select>

          {/* Tombol Fullscreen */}
          <button
            type="button"
            className="tv-poli-btn-fs"
            onClick={toggleFullscreen}
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </TVHeader>

      {/* Main Content */}
      <main className="tv-main">
        <div className="tv-main__label">
          ANTRIAN POLI SPESIALIS NURSE STATION {display}
        </div>

        {doctors.length > 0 ? (
          <div className="tv-poli-grid">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.AID}
                doctor={doc}
                isCalling={recentlyChangedAid === String(doc.AID)}
              />
            ))}
          </div>
        ) : (
          <div className="tv-empty">
            <div className="tv-empty__icon">
              <Stethoscope size={48} />
            </div>
            <div className="tv-empty__title">BELUM ADA DOKTER AKTIF</div>
            <p className="tv-empty__subtitle">
              Dokter yang sedang bertugas di Nurse Station {display} akan ditampilkan di layar ini.
            </p>
          </div>
        )}
      </main>

      <TVFooter>
        Selamat datang di Poliklinik Rumah Sakit Awal Bros. Pasien yang terlambat datang dari estimasi waktu, silahkan hubungi perawat kami. Pemanggilan antrian Umum / Asuransi / Perusahaan dan BPJS 1:1.
      </TVFooter>
    </div>
  )
}