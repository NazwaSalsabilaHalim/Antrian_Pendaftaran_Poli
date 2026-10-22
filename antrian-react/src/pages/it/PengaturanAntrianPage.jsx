import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Tag,
  Hash,
  FileText,
} from 'lucide-react'
import { api } from '../../api/client'
import {
  StatusBadge,
  RowActions,
  Modal,
  FormField,
  FormActions,
  StatusSelect,
  FIELD,
  Tabs,
  Toast,
  CardHeading,
  ringkasStatus,
} from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'
import LoketTab from './LoketTab'

// =========================
// Konfigurasi
// =========================
const TABS = [
  { key: 'loket', label: 'Loket' },
  { key: 'jenis', label: 'Jenis Pendaftaran' },
]

const EMPTY_JENIS = {
  tombol_id: '',
  nama: '',
  prefix: '',
  status: 'Aktif',
}

// =========================
// Halaman (tab disimpan di URL: ?tab=jenis)
// =========================
export default function PengaturanAntrianPage() {
  const [params, setParams] = useSearchParams()

  const requested = params.get('tab')
  const tab = TABS.some((t) => t.key === requested)
    ? requested
    : 'loket'

  return (
    <>
      <Tabs
        tabs={TABS}
        active={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
      />

      {tab === 'loket' ? <LoketTab /> : <JenisTab />}
    </>
  )
}

// =========================
// Tab Jenis Pendaftaran
// =========================
function JenisTab() {
  const [jenis, setJenis] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    paginatedItems: paginatedJenis,
  } = usePagination(jenis, 10)

  const [modalMode, setModalMode] = useState(null) // null | create | edit
  const [form, setForm] = useState(EMPTY_JENIS)

  // Pasangan value/onChange untuk input teks di form
  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  })

  function notify(type, text) {
    setToast({ type, text })
  }

  function load() {
    setLoading(true)

    api.getJenisPendaftaran()
      .then((res) => {
        setJenis(res.jenis || [])
        setCurrentPage(1)
      })
      .catch((e) => notify('error', e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setForm(EMPTY_JENIS)
    setModalMode('create')
  }

  function openEdit(item) {
    setForm({
      tombol_id: item.tombol_id,
      nama: item.nama,
      prefix: item.prefix,
      status: item.status,
    })
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.tombol_id || !form.nama) {
      notify('error', 'Kode dan nama jenis pendaftaran wajib diisi.')
      return
    }

    api.saveJenisPendaftaran({
      action: modalMode,
      ...form,
    })
      .then(() => {
        closeModal()
        notify(
          'success',
          modalMode === 'create'
            ? 'Jenis pendaftaran berhasil ditambahkan.'
            : 'Perubahan berhasil disimpan.'
        )
        load()
      })
      .catch((e) => notify('error', e.message))
  }

  function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus jenis pendaftaran "${item.nama}"? ` +
      'Data riwayat lama tidak akan ikut terhapus.'
    )

    if (!confirmed) return

    api.saveJenisPendaftaran({
      action: 'delete',
      tombol_id: item.tombol_id,
    })
      .then(() => {
        notify('success', `Jenis pendaftaran "${item.nama}" berhasil dihapus.`)
        load()
      })
      .catch((e) => notify('error', e.message))
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card card--table-narrow">
        <CardHeading
          title="Daftar Jenis Pendaftaran"
          description="Kategori yang muncul di layar Ambil Nomor."
          meta={loading ? 'Memuat data...' : ringkasStatus(jenis)}
          action={
            <button className="btn" onClick={openCreate}>
              + Tambah Jenis
            </button>
          }
        />

        {!loading && (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode</th>
                  <th>Jenis Pendaftaran</th>
                  <th>Prefix</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedJenis.map((item, index) => (
                  <tr key={item.tombol_id}>
                    <td>{startIndex + index + 1}</td>
                    <td><strong>{item.tombol_id}</strong></td>
                    <td>{item.nama}</td>
                    <td>{item.prefix || '-'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <RowActions
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item)}
                      />
                    </td>
                  </tr>
                ))}

                {jenis.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Belum ada data.
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
            totalItems={jenis.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemName="jenis pendaftaran"
          />
        )}
      </div>

      {modalMode && (
        <Modal
          title={
            modalMode === 'create'
              ? 'Tambah Jenis Pendaftaran'
              : 'Edit Jenis Pendaftaran'
          }
          subtitle={
            modalMode === 'create'
              ? 'Tambahkan kategori pendaftaran baru'
              : 'Perbarui kategori pendaftaran'
          }
          icon={Tag}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <FormField
              label="Kode"
              icon={Hash}
              hint={modalMode === 'edit' ? 'Kode tidak bisa diubah setelah dibuat.' : undefined}
            >
              <input
                value={form.tombol_id}
                disabled={modalMode === 'edit'}
                onChange={(e) =>
                  setForm({ ...form, tombol_id: e.target.value.toUpperCase() })
                }
                placeholder="Mis. B5"
                className={FIELD}
              />
            </FormField>

            <FormField label="Nama Jenis Pendaftaran" icon={FileText}>
              <input {...field('nama')} className={FIELD} />
            </FormField>

            <FormField label="Prefix Nomor" icon={Tag}>
              <input
                {...field('prefix')}
                placeholder="Mis. A (boleh kosong)"
                className={FIELD}
              />
            </FormField>

            <StatusSelect
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
            />

            <FormActions
              submitLabel={modalMode === 'create' ? 'Tambah Jenis' : 'Simpan Perubahan'}
              onCancel={closeModal}
            />
          </form>
        </Modal>
      )}
    </>
  )
}