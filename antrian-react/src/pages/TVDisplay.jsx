import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { useInterval } from '../hooks/useInterval'
import { buildAntrianSounds, playQueue } from '../utils/audioQueue'
import {
  FlapRow,
  TVBackground,
  TVFooter,
  TVHeader,
  useAudioUnlock,
} from '../components/tv/TVShared'

const POLL_MS = 10000

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

  const audioRef = useRef(null)
  // Autoplay butuh browser dengan flag --autoplay-policy=no-user-gesture-required
  const [audioReady] = useAudioUnlock(audioRef, '/sounds_jelek/tingtong.mp3')
  const prevServingRef = useRef({})
  const isFirstPoll = useRef(true)

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

  return (
    <div className="tv-screen">
      <audio ref={audioRef} preload="auto" />

      <TVBackground />
      <TVHeader liveLabel="LIVE MONITOR" />

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

      <TVFooter>
        Selamat datang di Rumah Sakit Awal Bros Yasmine Dumai,
        Konfirmasi ke Admission apabila anda mengalami keterlambatan.
      </TVFooter>
    </div>
  )
}