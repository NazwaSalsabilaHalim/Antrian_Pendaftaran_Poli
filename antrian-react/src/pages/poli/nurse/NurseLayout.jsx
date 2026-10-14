import { useNavigate } from 'react-router-dom'
import { getNurseIzin, logoutNurse } from '../../../utils/auth'
import DataDokter from '../DataDokter'
import { Tv, LogOut } from 'lucide-react'

export default function NurseLayout() {
  const navigate = useNavigate()
  const izin = getNurseIzin()

  return (
    <div className="nurse-layout-shell">
      <DataDokter
        izin={{
          tambah: !!izin.dokter_tambah,
          edit: !!izin.dokter_edit,
          hapus: !!izin.dokter_hapus,
          kosongkan: !!izin.antrean_kosongkan,
        }}
        aksiTambahan={
          <>
            <a
              href="/poli/display"
              target="_blank"
              rel="noreferrer"
              className="sidebar__display-link"
            >
              <span className="sidebar__display-icon">
                <Tv size={18} />
              </span>
              <span>
                <strong>TV Poli</strong>
                <small>Layar antrean poli</small>
              </span>
              <span className="sidebar__display-arrow">↗</span>
            </a>

            <button
              type="button"
              className="btn btn-danger-outline sidebar__logout"
              onClick={() => {
                logoutNurse()
                navigate('/login-nurse', { replace: true })
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        }
      />
    </div>
  )
}