import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { StatusBadge, RowActions, Modal } from '../../components/it/ITComponents'

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
          <p className="section-title" style={{ margin: 0 }}>
            Daftar Petugas
          </p>

          <button className="btn" onClick={openCreate}>
            + Tambah Petugas
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
        <Modal title={modalMode === 'create' ? 'Tambah Petugas' : 'Edit Petugas'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Nama Petugas
              </label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Username
              </label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Password {modalMode === 'edit' && <span className="muted">(kosongkan jika tidak diubah)</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>
                {modalMode === 'create' ? 'Tambah Petugas' : 'Simpan Perubahan'}
              </button>

              <button type="button" className="btn btn-outline" onClick={closeModal}>
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}