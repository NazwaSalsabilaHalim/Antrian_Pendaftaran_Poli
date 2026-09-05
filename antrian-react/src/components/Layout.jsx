import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/ambil-nomor', label: 'Ambil Nomor' },
  { to: '/loket', label: 'Loket' },
  { to: '/display', label: 'TV Display' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="app-nav__brand">Antrian Pendaftaran</div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => 'app-nav__link' + (isActive ? ' is-active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
