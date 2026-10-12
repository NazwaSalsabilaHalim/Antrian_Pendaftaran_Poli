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
import logoAwalBros from '../../pages/LOGOAWALBROS.png'

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
        <div className="tv-brand">
          <img src={logoAwalBros} alt="Logo" />
        </div>
      </div>

      {/* LIVE STATUS */}
      <div className="sidebar__status">
        <span className="sidebar__status-dot">
          <span />
        </span>

        <div>
          <strong className="sidebar__user-name">
            {user?.nama || user?.username || 'Petugas'}
          </strong>
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
        <div className="sidebar__user-box">
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger-outline sidebar__logout"
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>

        <div className="sidebar__copyright">
          Sistem Antrian RS Awal Bros
        </div>
      </div>
    </aside>
  )
}