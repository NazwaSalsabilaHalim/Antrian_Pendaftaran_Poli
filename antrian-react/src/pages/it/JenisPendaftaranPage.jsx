import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { StatusBadge, RowActions, Modal } from '../../components/it/ITComponents'

const EMPTY_FORM = { tombol_id: '', nama: '', prefix: '', status: 'Aktif' }

export default function JenisPendaftaranPage() {
  const [jenis, setJenis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalMode, setModalMode] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM)

  function load() {
    setLoading(true)
    api.getJenisPendaftaran()
      .then((res) => {
        setJenis(res.jenis || [])
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setModalMode('create')
  }

  function openEdit(item) {
    setForm({ tombol_id: item.tombol_id, nama: item.nama, prefix: item.prefix, status: item.status })
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.tombol_id || !form.nama) {
      setError('Kode dan nama jenis pendaftaran wajib diisi.')
      return
    }

    api.saveJenisPendaftaran({ action: modalMode, ...form })
      .then(() => {
        closeModal()
        load()
      })
      .catch((e) => setError(e.message))
  }

  function handleDelete(item) {
    if (!window.confirm(`Hapus jenis pendaftaran "${item.nama}"? Data riwayat lama tidak akan ikut terhapus.`)) return

    api.saveJenisPendaftaran({ action: 'delete', tombol_id: item.tombol_id })
      .then(load)
      .catch((e) => setError(e.message))
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">JENIS PENDAFTARAN</div>
          <h1 className="page-intro__title">Jenis Pendaftaran</h1>
          <p className="page-intro__subtitle">
            Mengelola jenis pendaftaran dan prefix antrian
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="section-header">
          <p className="section-title" style={{ margin: 0 }}>
            Daftar Jenis Pendaftaran
          </p>

          <button className="btn" onClick={openCreate}>
            + Tambah Jenis
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
                    <td><strong>{item.tombol_id}</strong></td>
                    <td>{item.nama}</td>
                    <td>{item.prefix || '-'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <RowActions onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
                    </td>
                  </tr>
                ))}

                {jenis.length === 0 && (
                  <tr><td colSpan={6} className="empty-state">Belum ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalMode && (
        <Modal title={modalMode === 'create' ? 'Tambah Jenis Pendaftaran' : 'Edit Jenis Pendaftaran'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Kode
              </label>
              <input
                value={form.tombol_id}
                disabled={modalMode === 'edit'}
                onChange={(e) => setForm({ ...form, tombol_id: e.target.value.toUpperCase() })}
                placeholder="Mis. B5"
                style={{ width: '100%' }}
              />
              {modalMode === 'edit' && (
                <span className="muted" style={{ fontSize: 11 }}>Kode tidak bisa diubah setelah dibuat.</span>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Nama Jenis Pendaftaran
              </label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Prefix Nomor
              </label>
              <input
                value={form.prefix}
                onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                placeholder="Mis. A (boleh kosong)"
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
                {modalMode === 'create' ? 'Tambah Jenis' : 'Simpan Perubahan'}
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