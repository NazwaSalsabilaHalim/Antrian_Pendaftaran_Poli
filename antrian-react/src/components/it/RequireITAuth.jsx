import { Navigate } from 'react-router-dom'

/*
  Pembungkus route Panel IT. Ganti pengecekan localStorage di bawah
  dengan pengecekan token/session dari API kamu kalau login IT sudah
  terhubung ke backend.
*/
export default function RequireITAuth({ children }) {
  const isLoggedIn = localStorage.getItem('it_auth') === 'true'

  if (!isLoggedIn) {
    return <Navigate to="/it-login" replace />
  }

  return children
}
