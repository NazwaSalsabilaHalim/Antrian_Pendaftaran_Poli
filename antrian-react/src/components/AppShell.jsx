import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Ticket,
  Users,
  History,
  Tv,
  Activity,
  Clock3,
} from 'lucide-react'

const NAV = [
  {
    to: '/overview',
    label: 'Overview',
    description: 'Monitoring',
    icon: LayoutGrid,
  },
  {
    to: '/ambil-nomor',
    label: 'Ambil Nomor',
    description: 'Pendaftaran',
    icon: Ticket,
  },
  {
    to: '/loket',
    label: 'Loket',
    description: 'Pelayanan',
    icon: Users,
  },
  {
    to: '/dashboard',
    label: 'Riwayat',
    description: 'Statistik',
    icon: History,
  },
]

const PAGE_INFO = {
  '/overview': ['Overview', 'Status seluruh loket secara real-time'],
  '/ambil-nomor': ['Ambil Nomor', 'Pengambilan nomor antrian pasien'],
  '/loket': ['Loket', 'Panggil nomor antrian dari loket'],
  '/dashboard': ['Riwayat & Statistik', 'Rekap antrian harian'],
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

export default function AppShell() {
  const location = useLocation()
  const now = useClock()

  const [title, subtitle] =
    PAGE_INFO[location.pathname] || ['Antrian Pendaftaran', '']

  return (
    <div className="shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <span>AP</span>
          </div>

          <div className="sidebar__brand-text">
            <strong>Antrian</strong>
            <span>Pendaftaran</span>
          </div>
        </div>

        {/* LIVE STATUS */}
        <div className="sidebar__status">
          <span className="sidebar__status-dot">
            <span />
          </span>

          <div>
            <strong>Sistem Aktif</strong>
            <span>Monitoring real-time</span>
          </div>
        </div>

        {/* MENU */}
        <div className="sidebar__section">
          <div className="sidebar__section-label">
            MENU UTAMA
          </div>

          <nav className="sidebar__nav">
            {NAV.map(({ to, label, description, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  'sidebar__link' + (isActive ? ' is-active' : '')
                }
              >
                <span className="sidebar__link-icon">
                  <Icon size={19} strokeWidth={2} />
                </span>

                <span className="sidebar__link-content">
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar__footer">

          <a
            href="/display"
            target="_blank"
            rel="noreferrer"
            className="sidebar__display-link"
          >
            <span className="sidebar__display-icon">
              <Tv size={18} strokeWidth={2} />
            </span>

            <span>
              <strong>TV Display</strong>
              <small>Buka layar antrian</small>
            </span>

            <span className="sidebar__display-arrow">↗</span>
          </a>

          <div className="sidebar__copyright">
            Sistem Antrian Pendaftaran
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="shell__main">

        {/* TOPBAR */}
        <header className="topbar">

          <div className="topbar__left">

            <div className="topbar__eyebrow">
              <Activity size={14} strokeWidth={2.5} />
              LIVE MONITOR
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