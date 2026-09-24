import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Overview from './pages/Overview'
import AmbilNomor from './pages/AmbilNomor'
import Loket from './pages/Loket'
import TVDisplay from './pages/TVDisplay'
import Dashboard from './pages/Dashboard'

import ITAppShell from './components/it/ITAppShell'
import RequireITAuth from './components/it/RequireITAuth'
import ITLogin from './pages/it/ITLogin'
import ITDashboardOverview from './pages/it/ITDashboardOverview'
import PetugasPage from './pages/it/PetugasPage'
import LoketITPage from './pages/it/LoketPage'
import JenisPendaftaranPage from './pages/it/JenisPendaftaranPage'
import KonfigurasiPage from './pages/it/KonfigurasiPage'
import AntrianPage from './pages/it/AntrianPage'
import AktivitasPage from './pages/it/AktivitasPage'

export default function App() {
  return (

    <Routes>
      {/* Halaman login IT, berdiri sendiri tanpa shell */}
      <Route path="/it-login" element={<ITLogin />} />

      {/* Panel Admin IT — dilindungi login, pakai shell terpisah (ITAppShell) */}
      <Route
        path="/it-dashboard"
        element={
          <RequireITAuth>
            <ITAppShell />
          </RequireITAuth>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ITDashboardOverview />} />
        <Route path="petugas" element={<PetugasPage />} />
        <Route path="loket" element={<LoketITPage />} />
        <Route path="jenis" element={<JenisPendaftaranPage />} />
        <Route path="konfigurasi" element={<KonfigurasiPage />} />
        <Route path="antrian" element={<AntrianPage />} />
        <Route path="aktivitas" element={<AktivitasPage />} />
      </Route>

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
