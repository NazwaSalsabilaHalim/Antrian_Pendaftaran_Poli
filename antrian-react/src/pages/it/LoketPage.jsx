import { useEffect, useState } from 'react'
import { Building2, User, ToggleLeft } from 'lucide-react'
import { api } from '../../api/client'
import {
  StatusBadge,
  RowActions,
  Modal,
  FieldWrap,
} from '../../components/it/ITComponents'

export default function LoketPage() {
  const [loket, setLoket] = useState([])
  const [petugasList, setPetugasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({
    petugas_nama: '',
    status: 'Aktif',
  })

  // =========================
  // Load Data
  // =========================
  function load() {
    setLoading(true)

    Promise.all([
      api.getLoketIT(),
      api.getPetugas(),
    ])
      .then(([loketResponse, petugasResponse]) => {
        setLoket(loketResponse.loket || [])
        setPetugasList(petugasResponse.petugas || [])
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
  function openEdit(item) {
    setForm({
      petugas_nama:
        item.petugas_nama === '-'
          ? ''
          : item.petugas_nama,
      status: item.status,
    })

    setEditItem(item)
  }

  function closeModal() {
    setEditItem(null)
  }

  // =========================
  // Submit
  // =========================
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
            MANAJEMEN LOKET
          </div>

          <h1 className="page-intro__title">
            Kelola Loket
          </h1>

          <p className="page-intro__subtitle">
            Mengelola loket pelayanan pendaftaran
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
            Daftar Loket
          </p>
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

                    <td>
                      <strong>{item.nama}</strong>
                    </td>

                    <td>
                      {item.petugas_nama}
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td>
                      <RowActions
                        onEdit={() => openEdit(item)}
                      />
                    </td>
                  </tr>
                ))}

                {loket.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="empty-state"
                    >
                      Belum ada data loket.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <Modal
          title={`Edit Loket — ${editItem.nama}`}
          subtitle="Atur petugas yang bertugas dan status loket"
          icon={Building2}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            {/* Petugas */}
            <div className="it-form-group">
              <label className="it-form-label">
                Petugas
              </label>

              <FieldWrap icon={User}>
                <select
                  value={form.petugas_nama}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      petugas_nama: e.target.value,
                    })
                  }
                  className="it-form-field it-form-field--icon"
                >
                  <option value="">
                    Belum ada petugas
                  </option>

                  {petugasList.map((p) => (
                    <option
                      key={p.id}
                      value={p.nama}
                    >
                      {p.nama}
                    </option>
                  ))}
                </select>
              </FieldWrap>

              {petugasList.length === 0 && (
                <span className="muted it-form-hint">
                  Belum ada data petugas — tambahkan
                  dulu di halaman Kelola Petugas.
                </span>
              )}
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
                Simpan Perubahan
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