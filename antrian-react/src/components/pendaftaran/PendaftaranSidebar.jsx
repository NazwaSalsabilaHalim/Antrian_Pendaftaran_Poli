import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  History,
  Tv,
  LogOut,
} from 'lucide-react'
import { getPetugas, logoutPetugas } from '../../utils/auth'

const NAV_PENDAFTARAN = [
  {
    to: '/pendaftaran/overview',
    label: 'Overview',
    description: 'Monitoring loket',
    icon: LayoutGrid,
  },
  {
    to: '/pendaftaran/loket',
    label: 'Loket',
    description: 'Pelayanan pendaftaran',
    icon: Users,
  },
  {
    to: '/pendaftaran/dashboard',
    label: 'Riwayat & Rekap',
    description: 'Statistik antrian',
    icon: History,
  },
]

export default function PendaftaranSidebar() {
  const navigate = useNavigate()
  const user = getPetugas()

  function handleLogout() {
    logoutPetugas()
    navigate('/login-petugas', { replace: true })
  }

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <span>RS</span>
        </div>

        <div className="sidebar__brand-text">
          <strong>Antrian RS</strong>
          <span>Pendaftaran & Poli</span>
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

      {/* MENU PENDAFTARAN */}
      <div className="sidebar__section">
        <div className="sidebar__section-label">
          PENDAFTARAN
        </div>

        <nav className="sidebar__nav">
          {NAV_PENDAFTARAN.map(({ to, label, description, icon: Icon }) => (
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
            <Tv size={17} strokeWidth={2} />
          </span>

          <span>
            <strong>TV Pendaftaran</strong>
            <small>Layar loket pendaftaran</small>
          </span>

          <span className="sidebar__display-arrow">↗</span>
        </a>

        {/* USER + LOGOUT */}
        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          <span>{user?.nama || user?.username || 'Petugas'}</span>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'transparent',
              color: '#dc2626',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>

        <div className="sidebar__copyright" style={{ marginTop: '14px' }}>
          Sistem Antrian RS Awal Bros
        </div>
      </div>
    </aside>
  )
}