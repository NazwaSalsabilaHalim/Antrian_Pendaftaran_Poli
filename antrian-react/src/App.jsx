import { Navigate, Route, Routes } from 'react-router-dom'

import RequireRole from './components/RequireRole'
import {
  isAdminLoggedIn,
  isPetugasLoggedIn,
  isNurseLoggedIn,
  PETUGAS_KEY,
  NURSE_KEY,
} from './utils/auth'

// ================= SHELL & SIDEBAR =================
import AppShell from './components/AppShell'
import PendaftaranSidebar from './components/pendaftaran/PendaftaranSidebar'
import ITAppShell from './components/it/ITAppShell'

// ================= LOGIN =================
import Login from './pages/Login'
import RegisterAdmin from './pages/RegisterAdmin'
import LoginPetugas from './pages/LoginPetugas'
import LoginNurse from './pages/LoginNurse'

// ================= PASIEN (PUBLIK) =================
import AmbilNomor from './pages/AmbilNomor'
import TVDisplay from './pages/TVDisplay'
import DisplayAntrean from './pages/poli/DisplayAntrean'

// ================= PENDAFTARAN =================
import Overview from './pages/pendaftaran/Overview'
import Loket from './pages/pendaftaran/Loket'
import Dashboard from './pages/pendaftaran/Dashboard'

// ================= POLIKLINIK =================
import KelolaAntrean from './pages/poli/dokter/KelolaAntrean'
import NurseLayout from './pages/poli/nurse/NurseLayout'

// ================= ADMIN / IT =================
import ITDashboardOverview from './pages/it/ITDashboardOverview'
import AkunPenggunaPage from './pages/it/AkunPenggunaPage'
import PengaturanAntrianPage from './pages/it/PengaturanAntrianPage'
import AntrianPage from './pages/it/AntrianPage'
import AktivitasPage from './pages/it/AktivitasPage'
import AntreanPoliPage from './pages/it/AntreanPoliPage'

// Judul topbar untuk halaman pendaftaran (petugas)
const PENDAFTARAN_INFO = {
  '/pendaftaran/overview': ['Overview Pendaftaran', 'Status seluruh loket pendaftaran secara real-time'],
  '/pendaftaran/loket': ['Loket Pendaftaran', 'Panggil nomor antrian dari loket pendaftaran'],
  '/pendaftaran/dashboard': ['Dashboard Petugas', 'Rekap dan grafik antrian harian'],
}

// Buka localhost:5173 -> arahkan sesuai sesi yang masih tersimpan
function HomeRedirect() {
  if (isAdminLoggedIn()) return <Navigate to="/it-dashboard" replace />
  if (isPetugasLoggedIn()) return <Navigate to="/pendaftaran" replace />
  if (isNurseLoggedIn()) return <Navigate to="/poli/nurse/dokter" replace />
  return <Navigate to="/it-login" replace />
}

// /it-login: kalau admin masih login, langsung masuk dashboard
function ITLoginGate() {
  return isAdminLoggedIn()
    ? <Navigate to="/it-dashboard" replace />
    : <Login />
}

export default function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIK / LOGIN
          ===================================================== */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/it-login" element={<ITLoginGate />} />
      <Route path="/login" element={<Navigate to="/it-login" replace />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />
      <Route path="/login-petugas" element={<LoginPetugas />} />
      <Route path="/login-nurse" element={<LoginNurse />} />

      {/* =====================================================
          PUBLIK - PASIEN (tanpa login)
          ===================================================== */}
      <Route path="/ambil-nomor" element={<AmbilNomor />} />
      <Route path="/display" element={<TVDisplay />} />
      <Route path="/poli/display" element={<DisplayAntrean />} />

      {/* =====================================================
          1) ADMIN / IT  ->  localhost:5173/it-dashboard
          ===================================================== */}
      <Route
        path="/it-dashboard"
        element={
          <RequireRole
            allowedRoles={['admin']}
            loginPath="/it-login"
            storageKey="admin_auth_user"
          >
            <ITAppShell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ITDashboardOverview />} />

        {/* Akun Pengguna (tab: petugas, nurse, hak-akses) */}
        <Route path="akun" element={<AkunPenggunaPage />} />

        {/* URL lama -> diarahkan ke halaman Akun Pengguna */}
        <Route path="petugas" element={<Navigate to="/it-dashboard/akun?tab=petugas" replace />} />
        <Route path="nurse" element={<Navigate to="/it-dashboard/akun?tab=nurse" replace />} />
        <Route path="hak-akses" element={<Navigate to="/it-dashboard/akun?tab=hak-akses" replace />} />

        {/* Pengaturan Antrian (tab: loket, jenis) */}
        <Route path="pengaturan" element={<PengaturanAntrianPage />} />

        {/* URL lama -> diarahkan ke halaman Pengaturan Antrian */}
        <Route path="loket" element={<Navigate to="/it-dashboard/pengaturan?tab=loket" replace />} />
        <Route path="jenis" element={<Navigate to="/it-dashboard/pengaturan?tab=jenis" replace />} />
        <Route path="konfigurasi" element={<Navigate to="/it-dashboard/pengaturan" replace />} />

        <Route path="antrian" element={<AntrianPage />} />
        <Route path="aktivitas" element={<AktivitasPage />} />

        {/* Pendaftaran (dilihat dari admin) */}
        <Route path="pendaftaran/overview" element={<Overview />} />
        <Route path="pendaftaran/loket" element={<Loket />} />
        <Route path="pendaftaran/dashboard" element={<Dashboard />} />

        {/* Poliklinik (dilihat dari admin) - tab: antrean, dokter */}
        <Route path="poli/antrean" element={<AntreanPoliPage />} />

        {/* URL lama -> diarahkan ke tab Data Dokter */}
        <Route path="poli/dokter" element={<Navigate to="/it-dashboard/poli/antrean?tab=dokter" replace />} />
      </Route>

      {/* =====================================================
          2) PENDAFTARAN (PETUGAS)  ->  localhost:5173/pendaftaran
          ===================================================== */}
      <Route
        path="/pendaftaran"
        element={
          <RequireRole
            allowedRoles={['petugas']}
            loginPath="/login-petugas"
            storageKey={PETUGAS_KEY}
          >
            <AppShell
              sidebar={<PendaftaranSidebar />}
              pageInfo={PENDAFTARAN_INFO}
            />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="loket" element={<Loket />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* =====================================================
          3) POLIKLINIK (NURSE)  ->  localhost:5173/poli/nurse
          ===================================================== */}
      <Route
        path="/poli/nurse/*"
        element={
          <RequireRole
            allowedRoles={['nurse']}
            loginPath="/login-nurse"
            storageKey={NURSE_KEY}
          >
            <NurseLayout />
          </RequireRole>
        }
      />

      {/* =====================================================
          4) POLIKLINIK (DOKTER)  ->  localhost:5173/poli/dokter/antrean
          Login memakai AID + password dokter di dalam halamannya.
          ===================================================== */}
      <Route
        path="/poli/dokter/antrean"
        element={
          <div className="poli-page-wrapper">
            <KelolaAntrean />
          </div>
        }
      />

    </Routes>
  )
}