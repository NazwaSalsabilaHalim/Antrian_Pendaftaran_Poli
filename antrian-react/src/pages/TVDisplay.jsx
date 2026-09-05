import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'
import { buildAntrianSounds, playQueue } from '../utils/audioQueue'

const POLL_MS = 10000

function FlapRow({ value }) {
  return (
    <div className="tv-flap-row">
      {String(value)
        .split('')
        .map((char, index) => (
          <span key={index} className="tv-flap-char">
            {char}
          </span>
        ))}
    </div>
  )
}

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(id)
  }, [])

  return now
}

export default function TVDisplay() {
  const [current, setCurrent] = useState(null)
  const [audioReady, setAudioReady] = useState(false)

  const audioRef = useRef(null)
  const lastPanggilId = useRef(0)

  const now = useClock()

  const poll = useCallback(async () => {
    try {
      const d = await api.getDisplayQueue()

      const panggilId = d.panggil_id || 0

      const isBaru =
        panggilId > 0 &&
        panggilId !== lastPanggilId.current

      const isUlang =
        panggilId === lastPanggilId.current &&
        d.panggil_ulang

      if (isBaru || isUlang) {
        lastPanggilId.current = panggilId

        setCurrent(d)

        const konfirmasi = await api.panggilKonfirmasi(panggilId)

        if (
          konfirmasi.found &&
          audioReady &&
          audioRef.current
        ) {
          const sounds = buildAntrianSounds(api.base, {
            nomor: konfirmasi.nomor,
            prefix: konfirmasi.prefix,
            loket: konfirmasi.counter_id,
          })

          playQueue(audioRef.current, sounds)
        }
      }
    } catch (e) {
      console.warn('Gagal polling antrian:', e.message)
    }
  }, [audioReady])

  useInterval(poll, POLL_MS)

  function enableAudio() {
    const el = audioRef.current

    if (!el) return

    // Gunakan file audio yang benar-benar ada untuk
    // mendapatkan izin autoplay dari browser.
    el.src = `${api.base}/display/sounds_jelek/tingtong.mp3`

    el.play()
      .then(() => {
        el.pause()
        el.currentTime = 0
        setAudioReady(true)
      })
      .catch((e) => {
        console.warn('Audio belum bisa diaktifkan', e)
      })
  }

  const time = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const date = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="tv-screen">

      <audio ref={audioRef} />

      {/* Decorative background */}
      <div className="tv-bg-shape tv-bg-shape--one" />
      <div className="tv-bg-shape tv-bg-shape--two" />
      <div className="tv-bg-grid" />

      {/* Header */}
      <header className="tv-header">

        <div className="tv-brand">
          <div className="tv-brand__logo">
            AP
          </div>

          <div>
            <div className="tv-brand__name">
              Antrian Pendaftaran
            </div>

            <div className="tv-brand__subtitle">
              Sistem Informasi Antrian Pasien
            </div>
          </div>
        </div>

        <div className="tv-header__right">

          <div className="tv-live">
            <span className="tv-live__dot" />
            <span>LIVE MONITOR</span>
          </div>

          <div className="tv-clock">
            <div className="tv-clock__time">
              {time}
            </div>

            <div className="tv-clock__date">
              {date}
            </div>
          </div>

        </div>
      </header>

      {/* Audio */}
      {!audioReady && (
        <button
          className="tv-audio-gate"
          onClick={enableAudio}
        >
          <span className="tv-audio-icon">🔊</span>
          Aktifkan Audio
        </button>
      )}

      {/* Main display */}
      <main className="tv-main">

        <div className="tv-main__label">
          NOMOR ANTRIAN
        </div>

        {current?.nomor ? (
          <>
            <div className="tv-number-wrap">
              <FlapRow value={current.nomor} />
            </div>

            <div className="tv-counter">
              <div>
                <div className="tv-counter__label">
                  SILAKAN MENUJU
                </div>

                <div className="tv-counter__name">
                  {current.counter_nama || 'LOKET'}
                </div>
              </div>
            </div>

            <div className="tv-status">
              <span className="tv-status__dot" />
              Nomor Anda sedang dipanggil
            </div>
          </>
        ) : (
          <div className="tv-empty">
            <div className="tv-empty__icon">
              —
            </div>

            <div className="tv-empty__title">
              MENUNGGU PANGGILAN
            </div>

            <div className="tv-empty__subtitle">
              Mohon menunggu, nomor antrian berikutnya akan segera dipanggil
            </div>
          </div>
        )}

      </main>

      {/* Bottom information */}
      <footer className="tv-footer">

        <div className="tv-footer__icon">
          ℹ
        </div>

        <div className="tv-footer__text">
          <span className="tv-footer__label">
            INFORMASI
          </span>

          <marquee>
            Selamat datang di Rumah Sakit Awal Bros Yasmine Dumai,
            Konfirmasi ke Admission apabila anda mengalami keterlambatan.
          </marquee>
        </div>

      </footer>

    </div>
  )
}