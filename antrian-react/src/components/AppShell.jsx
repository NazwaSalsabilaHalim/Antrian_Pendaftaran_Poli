import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Users, Clock3 } from 'lucide-react'

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

/**
 * Layout bersama (topbar + area konten).
 * Sidebar TIDAK ada di sini. Sidebar dikirim lewat props `sidebar`,
 * jadi tiap bagian punya sidebar sendiri:
 *   - Pendaftaran -> components/pendaftaran/PendaftaranSidebar.jsx
 *   - Poliklinik  -> components/poli/...
 *   - IT          -> components/it/ITAppShell.jsx (shell sendiri)
 *
 * `pageInfo` = judul & subjudul topbar per path.
 */
export default function AppShell({ sidebar, pageInfo = {} }) {
  const location = useLocation()
  const now = useClock()

  const [title, subtitle] =
    pageInfo[location.pathname] || ['Antrian Rumah Sakit', 'Sistem Informasi Antrian']

  return (
    <div className="shell">

      {/* SIDEBAR (dari props) */}
      {sidebar}

      {/* MAIN */}
      <div className="shell__main">

        {/* TOPBAR */}
        <header className="topbar">

          <div className="topbar__left">

            <div className="topbar__eyebrow">
              <Users size={14} strokeWidth={2.5} />
              PANEL PETUGAS
            </div>

            <h1 className="topbar__title">
              {title}
            </h1>

            {subtitle && (
              <p className="topbar__subtitle">
                {subtitle}
              </p>
            )}

          </div>

          <div className="topbar__right">

            <div className="topbar__live">
              <span className="topbar__live-dot" />
              <span>Live</span>
            </div>

            <div className="topbar__divider" />

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

          </div>
        </header>

        {/* CONTENT */}
        <main className="shell__content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}