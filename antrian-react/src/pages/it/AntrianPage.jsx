import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Toast } from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'
import { RefreshCw } from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function AntrianPage() {
  const [tanggal, setTanggal] = useState(todayStr())
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    paginatedItems: paginatedRiwayat,
  } = usePagination(riwayat, 10)

  function load(tgl = tanggal, withToast = false) {
    setLoading(true)

    api.getRiwayat(`tanggal=${tgl}`)
      .then((res) => {
        setRiwayat(res.riwayat || [])
        setCurrentPage(1)
        if (withToast) {
          setToast({ type: 'success', text: 'Data antrian diperbarui.'})
        }
      })
      .catch((e) => setToast({ type: 'error', text: e.message }))
      .finally(() => setLoading(false))
  }

  function handleRefresh() {
    const today = todayStr()

    if (tanggal !== today) {
      setTanggal(today)
    } else {
      load(today, true)
    }
  }

  useEffect(() => {
    load()
  }, [tanggal])

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card">
        <div className="table-toolbar">
          <label htmlFor="tanggal" className="muted">Tanggal:</label>

          <input
            id="tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'loading-spin' : ''} />
            <span>Refresh</span>
          </button>

          {!loading && (
            <span className="muted table-toolbar__count">
              {riwayat.length} antrian
            </span>
          )}
        </div>

        {!loading && (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Antrian</th>
                  <th>Jenis Pendaftaran</th>
                  <th>Loket</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRiwayat.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td><strong>{item.nomor}</strong></td>
                    <td>{item.jenis_pasien}</td>
                    <td>{item.counter_nama || '-'}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}

                {riwayat.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      Belum ada antrian pada tanggal ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={riwayat.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemName="antrian"
          />
        )}
      </div>
    </>
  )
}