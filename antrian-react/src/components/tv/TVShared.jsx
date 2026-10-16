import { useEffect, useState } from 'react'
import logoAwalBros from '../../pages/LOGOAWALBROS.png'

const UNLOCK_EVENTS = ['click', 'keydown', 'touchstart']

// Deretan ubin angka/huruf ala papan flip
export function FlapRow({ value }) {
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

// Jam TV. State-nya di sini, jadi hanya jam yang re-render tiap detik.
export function TVClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="tv-clock">
      <div className="tv-clock__time">
        {now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>

      <div className="tv-clock__date">
        {now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </div>
  )
}

export function TVBackground() {
  return (
    <>
      <div className="tv-bg-shape tv-bg-shape--one" />
      <div className="tv-bg-shape tv-bg-shape--two" />
      <div className="tv-bg-grid" />
    </>
  )
}

// children = kontrol tambahan di sisi kanan (mis. pilihan nurse station)
export function TVHeader({ liveLabel, children }) {
  return (
    <header className="tv-header">
      <div className="tv-brand">
        <img src={logoAwalBros} alt="RS Awal Bros" />
      </div>

      <div className="tv-header__right">
        {children}

        <div className="tv-live">
          <span className="tv-live__dot" />
          <span>{liveLabel}</span>
        </div>

        <TVClock />
      </div>
    </header>
  )
}

export function TVFooter({ children }) {
  return (
    <footer className="tv-footer">
      <div className="tv-footer__icon">ℹ</div>

      <div className="tv-footer__text">
        <span className="tv-footer__label">INFORMASI</span>
        <marquee>{children}</marquee>
      </div>
    </footer>
  )
}

/*
  Membuka kunci audio browser: coba langsung, ulangi tiap 3 detik,
  dan juga saat ada klik / tombol / sentuhan.
  Mengembalikan [audioReady, setAudioReady].
*/
export function useAudioUnlock(audioRef, src) {
  const [audioReady, setAudioReady] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    el.preload = 'auto'
    el.volume = 1

    let timer = null
    let stopped = false

    const stop = () => {
      stopped = true
      clearInterval(timer)
      UNLOCK_EVENTS.forEach((ev) => window.removeEventListener(ev, unlock))
    }

    async function unlock() {
      if (stopped) return

      try {
        el.src = src
        el.load()
        await el.play()
        el.pause()
        el.currentTime = 0
        setAudioReady(true)
        stop()
      } catch {
        setAudioReady(false)
      }
    }

    unlock()
    timer = setInterval(unlock, 3000)
    UNLOCK_EVENTS.forEach((ev) => window.addEventListener(ev, unlock))

    return () => {
      stop()
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [audioRef, src])

  return [audioReady, setAudioReady]
}
