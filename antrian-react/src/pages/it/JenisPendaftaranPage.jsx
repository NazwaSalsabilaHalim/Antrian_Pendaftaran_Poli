import { useEffect, useState } from 'react'
import {
  Tag,
  Hash,
  FileText,
  ToggleLeft,
} from 'lucide-react'
import { api } from '../../api/client'
import {
  StatusBadge,
  RowActions,
  Modal,
  FieldWrap,
} from '../../components/it/ITComponents'

const EMPTY_FORM = {
  tombol_id: '',
  nama: '',
  prefix: '',
  status: 'Aktif',
}

export default function JenisPendaftaranPage() {
  const [jenis, setJenis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalMode, setModalMode] = useState(null) // null | create | edit
  const [form, setForm] = useState(EMPTY_FORM)

  // =========================
  // Load Data
  // =========================
  function load() {
    setLoading(true)

    api.getJenisPendaftaran()
      .then((res) => {
        setJenis(res.jenis || [])
        setError('')
      })
      .catch((e) => {
        setError(e.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  // =========================
  // Modal
  // =========================
  function openCreate() {
    setForm(EMPTY_FORM)
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

  // =========================
  // Submit
  // =========================
  function handleSubmit(e) {
    e.preventDefault()

    if (!form.tombol_id || !form.nama) {
      setError(
        'Kode dan nama jenis pendaftaran wajib diisi.'
      )
      return
    }

    api.saveJenisPendaftaran({
      action: modalMode,
      ...form,
    })
      .then(() => {
        closeModal()
        load()
      })
      .catch((e) => {
        setError(e.message)
      })
  }

  // =========================
  // Delete
  // =========================
  function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus jenis pendaftaran "${item.nama}"? ` +
      'Data riwayat lama tidak akan ikut terhapus.'
    )

    if (!confirmed) {
      return
    }

    api.saveJenisPendaftaran({
      action: 'delete',
      tombol_id: item.tombol_id,
    })
      .then(load)
      .catch((e) => {
        setError(e.message)
      })
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">
            JENIS PENDAFTARAN
          </div>

          <h1 className="page-intro__title">
            Jenis Pendaftaran
          </h1>

          <p className="page-intro__subtitle">
            Mengelola jenis pendaftaran dan prefix antrian
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            Daftar Jenis Pendaftaran
          </p>

          <button
            className="btn"
            onClick={openCreate}
          >
            + Tambah Jenis
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            Memuat data...
          </div>
        ) : (
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
                {jenis.map((item, index) => (
                  <tr key={item.tombol_id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{item.tombol_id}</strong>
                    </td>

                    <td>
                      {item.nama}
                    </td>

                    <td>
                      {item.prefix || '-'}
                    </td>

                    <td>
                      <StatusBadge
                        status={item.status}
                      />
                    </td>

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
                    <td
                      colSpan={6}
                      className="empty-state"
                    >
                      Belum ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
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
            {/* Kode */}
            <div className="it-form-group">
              <label className="it-form-label">
                Kode
              </label>

              <FieldWrap icon={Hash}>
                <input
                  value={form.tombol_id}
                  disabled={modalMode === 'edit'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tombol_id:
                        e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Mis. B5"
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>

              {modalMode === 'edit' && (
                <span className="muted it-form-hint">
                  Kode tidak bisa diubah setelah dibuat.
                </span>
              )}
            </div>

            {/* Nama */}
            <div className="it-form-group">
              <label className="it-form-label">
                Nama Jenis Pendaftaran
              </label>

              <FieldWrap icon={FileText}>
                <input
                  value={form.nama}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nama: e.target.value,
                    })
                  }
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            {/* Prefix */}
            <div className="it-form-group">
              <label className="it-form-label">
                Prefix Nomor
              </label>

              <FieldWrap icon={Tag}>
                <input
                  value={form.prefix}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      prefix: e.target.value,
                    })
                  }
                  placeholder="Mis. A (boleh kosong)"
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            {/* Status */}
            <div className="it-form-group it-form-group--last">
              <label className="it-form-label">
                Status
              </label>

              <FieldWrap icon={ToggleLeft}>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="it-form-field it-form-field--icon"
                >
                  <option value="Aktif">
                    Aktif
                  </option>

                  <option value="Tidak Aktif">
                    Tidak Aktif
                  </option>
                </select>
              </FieldWrap>
            </div>

            {/* Form Actions */}
            <div className="it-form-actions">
              <button
                type="submit"
                className="btn it-form-actions__submit"
              >
                {modalMode === 'create'
                  ? 'Tambah Jenis'
                  : 'Simpan Perubahan'}
              </button>

              <button
                type="button"
                className="btn btn-outline it-form-actions__cancel"
                onClick={closeModal}
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}