import { Navigate, useLocation } from 'react-router-dom'

export default function RequireRole({
  allowedRoles,
  loginPath = '/it-login',
  storageKey = 'auth_user',
  children,
}) {
  const location = useLocation()
  const raw = localStorage.getItem(storageKey)

  const toLogin = (
    <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  )

  if (!raw) return toLogin

  let user
  try {
    user = JSON.parse(raw)
  } catch {
    localStorage.removeItem(storageKey)
    return toLogin
  }

  const role = String(user?.role || '').toLowerCase()
  if (!allowedRoles.includes(role)) return toLogin

  return children
}