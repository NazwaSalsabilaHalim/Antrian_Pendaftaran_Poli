import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

// Jam topbar. State-nya di sini, jadi yang re-render tiap detik hanya jam ini.
export default function TopbarClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="topbar__clock">
      <div className="topbar__clock-icon">
        <Clock3 size={17} strokeWidth={2} />
      </div>

      <div className="topbar__clock-info">
        <span className="topbar__time">
          {now.toLocaleTimeString('id-ID')}
        </span>

        <span className="topbar__date">
          {now.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  )
}
