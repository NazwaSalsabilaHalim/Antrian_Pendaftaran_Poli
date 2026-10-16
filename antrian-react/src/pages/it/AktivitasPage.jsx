import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { CardHeading, Toast } from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'

export default function AktivitasPage() {
  const [aktivitas, setAktivitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedAktivitas,
  } = usePagination(aktivitas, 10)

  useEffect(() => {
    api.getAktivitas(50)
      .then((res) => {
        setAktivitas(res.aktivitas || [])
        setCurrentPage(1)
      })
      .catch((e) => setToast({ type: 'error', text: e.message }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card card--table-narrow">
        <CardHeading
          title="Aktivitas Terbaru"
          description="Perubahan akun, loket, dan hak akses yang tercatat di sistem."
        />

        {!loading && (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aktivitas</th>
                </tr>
              </thead>

              <tbody>
                {paginatedAktivitas.map((item, index) => (
                  <tr key={index}>
                    <td>{item.tanggal}</td>
                    <td>{item.waktu}</td>
                    <td>{item.pengguna}</td>
                    <td>{item.aktivitas}</td>
                  </tr>
                ))}

                {aktivitas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Belum ada aktivitas tercatat.
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
            totalItems={aktivitas.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemName="aktivitas"
          />
        )}
      </div>
    </>
  )
}