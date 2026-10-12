import { useSearchParams } from 'react-router-dom'
import { Tabs } from '../../components/it/ITComponents'
import KelolaAntrean from '../poli/dokter/KelolaAntrean'
import DataDokter from '../poli/DataDokter'

// =========================
// Konfigurasi
// =========================
const TABS = [
  { key: 'antrean', label: 'Antrean Dokter' },
  { key: 'dokter', label: 'Data Dokter' },
]

// IT = Super Admin -> izin penuh
const IZIN_IT = { tambah: true, edit: true, hapus: true, kosongkan: true }

// =========================
// Halaman (tab disimpan di URL: ?tab=dokter)
// =========================
export default function AntreanPoliPage() {
  const [params, setParams] = useSearchParams()

  const requested = params.get('tab')
  const tab = TABS.some((t) => t.key === requested) ? requested : 'antrean'

  return (
    <>
      <Tabs
        tabs={TABS}
        active={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
      />

      <div className="poli-tab-embed">
        {tab === 'antrean' ? (
          <KelolaAntrean />
        ) : (
          <DataDokter izin={IZIN_IT} />
        )}
      </div>
    </>
  )
}
