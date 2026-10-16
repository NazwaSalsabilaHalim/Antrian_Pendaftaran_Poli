import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Settings,
  History,
  Activity,
  ShieldCheck,
  LogOut,
  UserCog,
  Stethoscope,
} from 'lucide-react'
import TopbarClock from '../TopbarClock'
import { getAdmin, logoutAdmin } from '../../utils/auth'
import logoAwalBros from '../../pages/LOGOAWALBROS.png'

// Menu dikelompokkan: ringkasan, monitoring (pendaftaran & poli),
// dan fitur khusus Admin IT.
const NAV_GROUPS = [
  {
    label: 'UTAMA',
    items: [
      {
        to: 'overview',
        label: 'Dashboard',
        description: 'Ringkasan sistem',
        icon: LayoutGrid,
      },
    ],
  },
  {
    label: 'MONITORING PENDAFTARAN',
    items: [
      {
        to: 'antrian',
        label: 'Data Antrian',
        description: 'Seluruh antrian',
        icon: History,
      },
      {
        to: 'pengaturan',
        label: 'Pengaturan Antrian',
        description: 'Loket & jenis pendaftaran',
        icon: Settings,
      },
    ],
  },
  {
    label: 'MONITORING POLIKLINIK',
    items: [
      {
        to: 'poli/antrean',
        label: 'Antrean Poli',
        description: 'Antrean poli dokter',
        icon: Stethoscope,
      },
    ],
  },
  {
    label: 'ADMIN IT',
    items: [
      {
        to: 'akun',
        label: 'Akun Pengguna',
        description: 'Petugas, nurse & hak akses',
        icon: UserCog,
      },
      {
        to: 'aktivitas',
        label: 'Aktivitas Sistem',
        description: 'Log aktivitas',
        icon: Activity,
      },
    ],
  },
]

const PAGE_INFO = {
  overview: ['Dashboard', 'Ringkasan dan monitoring sistem antrian'],
  antrian: ['Data Antrian', 'Melihat seluruh data antrian'],
  antrean: ['Antrean Poli', 'Atur nomor antrean poli dokter'],
  akun: ['Akun Pengguna', 'Kelola akun petugas, nurse, dan hak akses nurse'],
  pengaturan: ['Pengaturan Antrian', 'Kelola loket pelayanan dan jenis pendaftaran'],
  aktivitas: ['Aktivitas Sistem', 'Riwayat aktivitas pengguna pada sistem'],
}

export default function ITAppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getAdmin()

  const segment = location.pathname.split('/').filter(Boolean).pop()
  const [title, subtitle] = PAGE_INFO[segment] || ['Panel Admin IT', '']

  function handleLogout() {
    logoutAdmin()
    navigate('/it-login', { replace: true })
  }

  return (
    <div className="shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar__brand">
          <div className="tv-brand">
            <img src={logoAwalBros} alt="Logo" />
          </div>
        </div>

        {/* STATUS LOGIN */}
        <div className="sidebar__status">
          <span className="sidebar__status-dot">
            <span />
          </span>

          <div>
            <strong className="sidebar__user-name">
              {user?.nama || user?.username || 'Admin'}
            </strong>
            <span>Super Admin</span>
          </div>
        </div>

        {/* MENU (per grup) */}
        <div className="sidebar__section">
          {NAV_GROUPS.map(({ label, items }) => (
            <div className="sidebar__group" key={label}>
              <div className="sidebar__section-label">
                {label}
              </div>

              <nav className="sidebar__nav">
                {items.map(({ to, label: itemLabel, description, icon: Icon }) => (
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
                      <strong>{itemLabel}</strong>
                      <small>{description}</small>
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar__footer">

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger-outline sidebar__logout"
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
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