import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { StatusBadge, Modal } from '../../components/it/ITComponents'

export default function LoketPage() {
  const [loket, setLoket] = useState([])
  const [petugasList, setPetugasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ petugas_nama: '', status: 'Aktif' })

  function load() {
    setLoading(true)
    Promise.all([api.getLoketIT(), api.getPetugas()])
      .then(([l, p]) => {
        setLoket(l.loket || [])
        setPetugasList(p.petugas || [])
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openEdit(item) {
    setForm({
      petugas_nama: item.petugas_nama === '-' ? '' : item.petugas_nama,
      status: item.status,
    })
    setEditItem(item)
  }

  function closeModal() {
    setEditItem(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    api.saveLoketIT({
      action: 'update',
      counter_id: editItem.counter_id,
      petugas_nama: form.petugas_nama,
      status: form.status,
    })
      .then(() => {
        closeModal()
        load()
      })
      .catch((e) => setError(e.message))
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">MANAJEMEN LOKET</div>
          <h1 className="page-intro__title">Kelola Loket</h1>
          <p className="page-intro__subtitle">
            Mengelola loket pelayanan pendaftaran
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <div className="section-header">
          <p className="section-title" style={{ margin: 0 }}>
            Daftar Loket
          </p>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Loket</th>
                  <th>Petugas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loket.map((item, index) => (
                  <tr key={item.counter_id}>
                    <td>{index + 1}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.petugas_nama}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <button
                        onClick={() => openEdit(item)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--secondary)',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {loket.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">Belum ada data loket.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        Loket fisik (mesin & printer) dikonfigurasi lewat sistem lama — halaman ini hanya mengatur petugas yang bertugas dan status aktif loket.
      </p>

      {editItem && (
        <Modal title={`Edit Loket — ${editItem.nama}`} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Petugas
              </label>
              <select
                value={form.petugas_nama}
                onChange={(e) => setForm({ ...form, petugas_nama: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">Belum ada petugas</option>
                {petugasList.map((p) => (
                  <option key={p.id} value={p.nama}>
                    {p.nama}
                  </option>
                ))}
              </select>

              {petugasList.length === 0 && (
                <span className="muted" style={{ fontSize: 11 }}>
                  Belum ada data petugas — tambahkan dulu di halaman Kelola Petugas.
                </span>
              )}
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
                Simpan Perubahan
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