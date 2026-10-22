import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { api } from '../../api/client'
import {
  StatusBadge,
  RowActions,
  Modal,
  FormField,
  FormActions,
  StatusSelect,
  FIELD,
  Toast,
  CardHeading,
  ringkasStatus,
} from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'

const EMPTY_FORM = {
  counter_id: '',
  nama: '',
  status: 'Aktif',
}

// =========================
// Tab Loket: tambah, ubah nama / status, hapus
// =========================
export default function LoketTab() {
  const [loket, setLoket] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    paginatedItems: paginatedLoket,
  } = usePagination(loket, 10)

  const [modalMode, setModalMode] = useState(null) // null | create | edit
  const [form, setForm] = useState(EMPTY_FORM)

  function notify(type, text) {
    setToast({ type, text })
  }

  function load() {
    setLoading(true)

    api.getLoketIT()
      .then((res) => {
        setLoket(res.loket || [])
        setCurrentPage(1)
      })
      .catch((e) => notify('error', e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setModalMode('create')
  }

  function openEdit(item) {
    setForm({
      counter_id: item.counter_id,
      nama: item.nama,
      status: item.status,
    })
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.nama.trim()) {
      notify('error', 'Nama loket wajib diisi.')
      return
    }

    api.saveLoketIT({
      action: modalMode,
      counter_id: form.counter_id,
      nama: form.nama.trim(),
      status: form.status,
    })
      .then(() => {
        closeModal()
        notify(
          'success',
          modalMode === 'create'
            ? 'Loket berhasil ditambahkan.'
            : 'Loket berhasil diperbarui.'
        )
        load()
      })
      .catch((e) => notify('error', e.message))
  }

  function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus loket "${item.nama}"? ` +
      'Data riwayat panggilan lama tidak akan ikut terhapus.'
    )

    if (!confirmed) return

    api.saveLoketIT({
      action: 'delete',
      counter_id: item.counter_id,
    })
      .then(() => {
        notify('success', `Loket "${item.nama}" berhasil dihapus.`)
        load()
      })
      .catch((e) => notify('error', e.message))
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card card--table-narrow">
        <CardHeading
          title="Daftar Loket"
          description="Tambah, ubah nama, atau hapus loket. Petugas memilih loket sendiri saat login."
          meta={loading ? 'Memuat data...' : ringkasStatus(loket)}
          action={
            <button className="btn" onClick={openCreate}>
              + Tambah Loket
            </button>
          }
        />

        {!loading && (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Loket</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedLoket.map((item, index) => (
                  <tr key={item.counter_id}>
                    <td>{startIndex + index + 1}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <RowActions
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item)}
                      />
                    </td>
                  </tr>
                ))}

                {loket.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Belum ada data loket.
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
            totalItems={loket.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemName="loket"
          />
        )}
      </div>

      {modalMode && (
        <Modal
          title={modalMode === 'create' ? 'Tambah Loket' : 'Edit Loket'}
          subtitle={
            modalMode === 'create'
              ? 'Loket baru otomatis muncul di pilihan counter petugas'
              : 'Ubah nama dan status loket'
          }
          icon={Building2}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <FormField label="Nama Loket" icon={Building2}>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis. COUNTER 3"
                className={FIELD}
              />
            </FormField>

            <StatusSelect
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
            />

            <FormActions
              submitLabel={modalMode === 'create' ? 'Tambah Loket' : 'Simpan Perubahan'}
              onCancel={closeModal}
            />
          </form>
        </Modal>
      )}
    </>
  )
}
