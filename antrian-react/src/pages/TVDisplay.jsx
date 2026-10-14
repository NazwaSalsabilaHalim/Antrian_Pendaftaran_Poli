import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'
import { buildAntrianSounds, playQueue } from '../utils/audioQueue'
import logoAwalBros from './LOGOAWALBROS.png'

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

/*
 * Memecah "A3" -> { prefix: "A", nomor: 3 }
 * atau "12" -> { prefix: "", nomor: 12 }
 */
function parseNomorDisplay(nomorDisplay) {
  const match = String(nomorDisplay || '').match(/^([A-Za-z]*)(\d+)$/)

  if (!match) {
    return { prefix: '', nomor: 0 }
  }

  return {
    prefix: match[1] || '',
    nomor: parseInt(match[2], 10),
  }
}

function CounterCard({ counterNama, serving }) {
  const hasNomor = Boolean(serving?.nomor_display)

  return (
    <div className={`tv-counter-card${hasNomor ? ' tv-counter-card--active' : ''}`}>
      <div className="tv-counter-card__label">
        {counterNama}
      </div>

      {hasNomor ? (
        <>
          <div className="tv-number-wrap">
            <FlapRow value={serving.nomor_display} />
          </div>

          <div className="tv-counter-card__meta">
            {serving.tombol_nama}
          </div>
        </>
      ) : (
        <div className="tv-counter-card__empty">
          MENUNGGU PANGGILAN
        </div>
      )}
    </div>
  )
}

export default function TVDisplay() {
  const [counterList, setCounterList] = useState([])
  const [servingByCounter, setServingByCounter] = useState({})
  const [audioReady, setAudioReady] = useState(false)

  const audioRef = useRef(null)
  const prevServingRef = useRef({})
  const isFirstPoll = useRef(true)

  const now = useClock()

  /*
   * ================================
   * AMBIL DAFTAR LOKET (sekali di awal)
   * ================================
   */
  useEffect(() => {
    api
      .getCounter()
      .then((d) => setCounterList(d.counter || []))
      .catch((e) => console.warn('Gagal ambil daftar counter:', e.message))
  }, [])

  /*
   * ================================
   * AUDIO
   * ================================
   *
   * Autoplay diaktifkan langsung saat halaman dibuka.
   * Butuh browser/device yang dijalankan dengan flag
   * --autoplay-policy=no-user-gesture-required
   * (lihat shortcut TV Display).
   */
  useEffect(() => {
    console.log('🎯 TVDisplay AUDIO EFFECT DIJALANKAN')
    const el = audioRef.current
    if (!el) return

    el.preload = 'auto'
    el.volume = 1

    let retryId = null

    const stopRetry = () => clearInterval(retryId)

    const unlockAudio = async () => {
      try {
        const audioUrl = '/sounds_jelek/tingtong.mp3'
        el.src = audioUrl
        el.load()
        await el.play()
        console.log('🔊 Audio berhasil diaktifkan')
        el.pause()
        el.currentTime = 0
        setAudioReady(true)
        stopRetry()
        window.removeEventListener('click', unlockAudio)
        window.removeEventListener('keydown', unlockAudio)
        window.removeEventListener('touchstart', unlockAudio)
      } catch (e) {
        setAudioReady(false)
      }
    }

    unlockAudio()
    retryId = setInterval(unlockAudio, 3000)

    window.addEventListener('click', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    window.addEventListener('touchstart', unlockAudio)

    return () => {
      stopRetry()
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [])

  /*
   * ================================
   * POLLING LIVE MONITOR (per-loket)
   * ================================
   */
  const poll = useCallback(async () => {
    try {
      const d = await api.getLiveMonitor()
      const serving = d.serving || []

      const nextMap = {}
      serving.forEach((s) => {
        nextMap[s.counter_id] = s
      })

      // Deteksi loket mana yang punya panggilan BARU dibanding poll sebelumnya
      if (!isFirstPoll.current) {
        serving.forEach((s) => {
          const prev = prevServingRef.current[s.counter_id]

          const isBaru =
            !prev ||
            prev.dipanggil_pukul !== s.dipanggil_pukul ||
            prev.nomor_display !== s.nomor_display

          if (isBaru && audioReady && audioRef.current) {
            const { prefix, nomor } = parseNomorDisplay(s.nomor_display)

            const sounds = buildAntrianSounds(null, {
              nomor,
              prefix,
              loket: s.counter_id,
            })

            playQueue(audioRef.current, sounds)
          }
        })
      }

      prevServingRef.current = nextMap
      isFirstPoll.current = false

      setServingByCounter(nextMap)
    } catch (e) {
      console.warn('Gagal polling live monitor:', e.message)
    }
  }, [audioReady])

  // Poll langsung sekali saat mount, lalu ulangi tiap POLL_MS
  useEffect(() => {
    poll()
  }, [poll])

  useInterval(poll, POLL_MS)

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

      {/* Audio tidak lagi memiliki tombol kontrol */}
      <audio
        ref={audioRef}
        preload="auto"
      />

      {/* Decorative background */}
      <div className="tv-bg-shape tv-bg-shape--one" />
      <div className="tv-bg-shape tv-bg-shape--two" />
      <div className="tv-bg-grid" />

      {/* Header */}
      <header className="tv-header">

        <div className="tv-brand">
          <img src={logoAwalBros} alt="Logo" />
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

      {/* Main display — satu kartu per loket */}
      <main className="tv-main">

        <div className="tv-main__label">
          NOMOR ANTRIAN
        </div>

        <div className="tv-counters-grid">
          {counterList.map((c) => (
            <CounterCard
              key={c.CounterID}
              counterNama={c.Nama}
              serving={servingByCounter[c.CounterID]}
            />
          ))}
        </div>

        {counterList.length === 0 && (
          <div className="tv-empty">
            <div className="tv-empty__icon">—</div>
            <div className="tv-empty__title">MEMUAT DATA LOKET...</div>
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