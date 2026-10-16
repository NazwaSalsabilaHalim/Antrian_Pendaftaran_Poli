import { Outlet, useLocation } from 'react-router-dom'
import { Users } from 'lucide-react'
import TopbarClock from './TopbarClock'

export default function AppShell({ sidebar, pageInfo = {} }) {
  const location = useLocation()

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

            <TopbarClock />
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