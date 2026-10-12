import { useNavigate } from 'react-router-dom'
import { getNurseIzin, logoutNurse } from '../../../utils/auth'
import DataDokter from '../DataDokter'

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
              className="btn btn-outline"
            >
              Layar TV Poli ↗
            </a>

            <button
              className="btn btn-outline"
              onClick={() => {
                logoutNurse()
                navigate('/login-nurse', { replace: true })
              }}
            >
              Logout
            </button>
          </>
        }
      />
    </div>
  )
}