import { useEffect, useState } from 'react'
import { UserPlus, UserCog, User, AtSign, Lock, ToggleLeft } from 'lucide-react'
import { api } from '../../api/client'
import { StatusBadge, RowActions, Modal, FieldWrap } from '../../components/it/ITComponents'

const EMPTY_FORM = { nama: '', username: '', password: '', status: 'Aktif' }

export default function PetugasPage() {
  const [petugas, setPetugas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalMode, setModalMode] = useState(null) // null | 'create' | 'edit'
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function load() {
    setLoading(true)
    api.getPetugas()
      .then((res) => {
        setPetugas(res.petugas || [])
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setModalMode('create')
  }

  function openEdit(item) {
    setForm({ nama: item.nama, username: item.username, password: '', status: item.status })
    setEditId(item.id)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.nama || !form.username || (modalMode === 'create' && !form.password)) {
      setError('Nama, username, dan password wajib diisi.')
      return
    }

    const payload =
      modalMode === 'create'
        ? { action: 'create', ...form }
        : { action: 'update', id: editId, ...form }

    api.savePetugas(payload)
      .then(() => {
        closeModal()
        load()
      })
      .catch((e) => setError(e.message))
  }

  function handleDelete(item) {
    if (!window.confirm(`Hapus petugas "${item.nama}"?`)) return

    api.savePetugas({ action: 'delete', id: item.id })
      .then(load)
      .catch((e) => setError(e.message))
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">MANAJEMEN PETUGAS</div>
          <h1 className="page-intro__title">Kelola Petugas</h1>
          <p className="page-intro__subtitle">
            Mengelola akun dan status petugas
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            Daftar Petugas
          </p>

          <button className="btn" onClick={openCreate}>
            + Tambah Petugas
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Petugas</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {petugas.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.username}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <RowActions onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
                    </td>
                  </tr>
                ))}

                {petugas.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">Belum ada data petugas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalMode && (
        <Modal
          title={modalMode === 'create' ? 'Tambah Petugas' : 'Edit Petugas'}
          subtitle={modalMode === 'create' ? 'Isi data akun petugas baru' : 'Perbarui data akun petugas'}
          icon={modalMode === 'create' ? UserPlus : UserCog}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="it-form-group">
              <label className="it-form-label">
                Nama Petugas
              </label>

              <FieldWrap icon={User}>
                <input
                  value={form.nama}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nama: e.target.value
                    })
                  }
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            <div className="it-form-group">
              <label className="it-form-label">
                Username
              </label>

              <FieldWrap icon={AtSign}>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value
                    })
                  }
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            <div className="it-form-group">
              <label className="it-form-label">
                Password{' '}
                {modalMode === 'edit' && (
                  <span className="muted it-form-hint-normal">
                    (kosongkan jika tidak diubah)
                  </span>
                )}
              </label>

              <FieldWrap icon={Lock}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value
                    })
                  }
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

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
                      status: e.target.value
                    })
                  }
                  className="it-form-field it-form-field--icon"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </FieldWrap>
            </div>

            <div className="it-form-actions">
              <button
                type="submit"
                className="btn it-form-actions__submit"
              >
                {modalMode === 'create'
                  ? 'Tambah Petugas'
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