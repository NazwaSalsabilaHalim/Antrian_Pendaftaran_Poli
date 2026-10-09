import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  Building2,
  Tag,
  Settings,
  History,
  Activity,
  Clock3,
  ShieldCheck,
  LogOut,
  UserCog,
  KeyRound,
} from 'lucide-react'

const NAV = [
  {
    to: 'overview',
    label: 'Dashboard',
    description: 'Ringkasan sistem',
    icon: LayoutGrid,
  },
  {
    to: 'petugas',
    label: 'Kelola Petugas',
    description: 'Akun petugas',
    icon: Users,
  },
  {
    to: 'nurse',
    label: 'Kelola Nurse',
    description: 'Akun nurse',
    icon: UserCog,
  },
  {
    to: 'hak-akses',
    label: 'Hak Akses',
    description: 'Izin fitur nurse',
    icon: KeyRound,
  },
  {
    to: 'loket',
    label: 'Kelola Loket',
    description: 'Loket pelayanan',
    icon: Building2,
  },
  {
    to: 'jenis',
    label: 'Jenis Pendaftaran',
    description: 'Kategori & prefix',
    icon: Tag,
  },
  {
    to: 'konfigurasi',
    label: 'Konfigurasi Antrian',
    description: 'Aturan nomor',
    icon: Settings,
  },
  {
    to: 'antrian',
    label: 'Data Antrian',
    description: 'Seluruh antrian',
    icon: History,
  },
  {
    to: 'aktivitas',
    label: 'Aktivitas Sistem',
    description: 'Log aktivitas',
    icon: Activity,
  },
]

const PAGE_INFO = {
  overview: ['Dashboard', 'Ringkasan dan monitoring sistem antrian'],
  petugas: ['Kelola Petugas', 'Mengelola akun dan status petugas'],
  loket: ['Kelola Loket', 'Mengelola loket pelayanan pendaftaran'],
  jenis: ['Jenis Pendaftaran', 'Mengelola jenis pendaftaran dan prefix antrian'],
  konfigurasi: ['Konfigurasi Antrian', 'Atur aturan pembentukan nomor antrian'],
  antrian: ['Data Antrian', 'Melihat seluruh data antrian'],
  aktivitas: ['Aktivitas Sistem', 'Riwayat aktivitas pengguna pada sistem'],
  nurse: ['Kelola Nurse', 'Mengelola akun dan status nurse'],
  'hak-akses': ['Hak Akses', 'Atur fitur yang boleh dipakai nurse'],
}

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return now
}

export default function ITAppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const now = useClock()

  const segment = location.pathname.split('/').filter(Boolean).pop()
  const [title, subtitle] = PAGE_INFO[segment] || ['Panel Admin IT', '']

  function handleLogout() {
    localStorage.removeItem('admin_auth_user')
    navigate('/it-login', { replace: true })
  }

  return (
    <div className="shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <ShieldCheck size={19} strokeWidth={2} />
          </div>

          <div className="sidebar__brand-text">
            <strong>Antrian</strong>
            <span>Panel Admin IT</span>
          </div>
        </div>

        {/* STATUS LOGIN */}
        <div className="sidebar__status">
          <span className="sidebar__status-dot">
            <span />
          </span>

          <div>
            <strong>Administrator IT</strong>
            <span>Super Admin</span>
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

          <button
            onClick={handleLogout}
            className="sidebar__display-link"
            style={{ width: '100%', border: 'none' }}
          >
            <span className="sidebar__display-icon">
              <LogOut size={18} strokeWidth={2} />
            </span>

            <span>
              <strong>Logout</strong>
              <small>Keluar dari panel IT</small>
            </span>
          </button>

          <div className="sidebar__copyright">
            Panel Admin — Sistem Antrian
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
              PANEL ADMIN
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
