import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Toast } from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'

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

  function load() {
    setLoading(true)

    api.getRiwayat(`tanggal=${tanggal}`)
      .then((res) => {
        setRiwayat(res.riwayat || [])
        setCurrentPage(1)
      })
      .catch((e) => setToast({ type: 'error', text: e.message }))
      .finally(() => setLoading(false))
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

          <button className="btn btn-outline" onClick={load}>
            Refresh
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