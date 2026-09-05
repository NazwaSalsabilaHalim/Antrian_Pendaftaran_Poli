import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Overview from './pages/Overview'
import AmbilNomor from './pages/AmbilNomor'
import Loket from './pages/Loket'
import TVDisplay from './pages/TVDisplay'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/loket" element={<Loket />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Halaman Ambil Nomor, layar penuh, tanpa sidebar - dibuka di tab/monitor terpisah */}
      <Route path="/ambil-nomor" element={<AmbilNomor />} />
      
      {/* TV Display berdiri sendiri, layar penuh, tanpa sidebar - dibuka di tab/monitor terpisah */}
      <Route path="/display" element={<TVDisplay />} />
    </Routes>
  )
}
