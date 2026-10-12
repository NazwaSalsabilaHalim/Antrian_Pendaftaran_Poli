import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  UserPlus,
  UserCog,
  User,
  AtSign,
  Lock,
  ToggleLeft,
} from 'lucide-react'
import { api } from '../../api/client'
import {
  StatusBadge,
  RowActions,
  Modal,
  FieldWrap,
  Tabs,
  Toast,
} from '../../components/it/ITComponents'

// =========================
// Konfigurasi
// =========================
const TABS = [
  { key: 'petugas', label: 'Petugas' },
  { key: 'nurse', label: 'Nurse' },
  { key: 'hak-akses', label: 'Hak Akses Nurse' },
]

// Perbedaan Petugas vs Nurse hanya di sini
const ROLE = {
  petugas: {
    nama: 'Petugas',
    load: () => api.getPetugas(),
    createExtra: {},
  },
  nurse: {
    nama: 'Nurse',
    load: () => api.getNurse(),
    createExtra: { role: 'nurse' },
  },
}

const IZIN = [
  ['dokter_tambah', 'Tambah dokter'],
  ['dokter_edit', 'Edit dokter'],
  ['dokter_hapus', 'Hapus dokter'],
  ['antrean_kosongkan', 'Kosongkan antrean'],
]

const EMPTY_FORM = {
  nama: '',
  username: '',
  password: '',
  status: 'Aktif',
}

// =========================
// Halaman (tab disimpan di URL: ?tab=nurse)
// =========================
export default function AkunPenggunaPage() {
  const [params, setParams] = useSearchParams()

  const requested = params.get('tab')
  const tab = TABS.some((t) => t.key === requested)
    ? requested
    : 'petugas'

  return (
    <>
      <Tabs
        tabs={TABS}
        active={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
      />

      {tab === 'hak-akses'
        ? <HakAksesTab />
        : <AkunTab key={tab} role={tab} />}
    </>
  )
}

// =========================
// Tab Petugas / Nurse (satu komponen untuk keduanya)
// =========================
function AkunTab({ role }) {
  const cfg = ROLE[role]
  const label = cfg.nama.toLowerCase()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [modalMode, setModalMode] = useState(null) // null | create | edit
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function notify(type, text) {
    setToast({ type, text })
  }

  function load() {
    setLoading(true)

    cfg.load()
      .then((res) => {
        setItems(res.petugas || [])
      })
      .catch((e) => notify('error', e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setModalMode('create')
  }

  function openEdit(item) {
    setForm({
      nama: item.nama,
      username: item.username,
      password: '',
      status: item.status,
    })
    setEditId(item.id)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (
      !form.nama ||
      !form.username ||
      (modalMode === 'create' && !form.password)
    ) {
      notify('error', 'Nama, username, dan password wajib diisi.')
      return
    }

    const payload =
      modalMode === 'create'
        ? { action: 'create', ...cfg.createExtra, ...form }
        : { action: 'update', id: editId, ...form }

    api.savePetugas(payload)
      .then(() => {
        closeModal()
        notify(
          'success',
          modalMode === 'create'
            ? `${cfg.nama} berhasil ditambahkan.`
            : 'Perubahan berhasil disimpan.'
        )
        load()
      })
      .catch((e) => notify('error', e.message))
  }

  function handleDelete(item) {
    if (!window.confirm(`Hapus ${label} "${item.nama}"?`)) return

    api.savePetugas({ action: 'delete', id: item.id })
      .then(() => {
        notify('success', `${cfg.nama} "${item.nama}" berhasil dihapus.`)
        load()
      })
      .catch((e) => notify('error', e.message))
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card">
        <div className="section-header">
          <p className="section-title management-section-title">
            {loading ? 'Memuat data...' : `${items.length} akun ${label}`}
          </p>

          <button className="btn" onClick={openCreate}>
            + Tambah {cfg.nama}
          </button>
        </div>

        {!loading && (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama {cfg.nama}</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.username}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <RowActions
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item)}
                      />
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      Belum ada data {label}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalMode && (
        <Modal
          title={`${modalMode === 'create' ? 'Tambah' : 'Edit'} ${cfg.nama}`}
          subtitle={
            modalMode === 'create'
              ? `Isi data akun ${label} baru`
              : `Perbarui data akun ${label}`
          }
          icon={modalMode === 'create' ? UserPlus : UserCog}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="it-form-group">
              <label className="it-form-label">Nama {cfg.nama}</label>
              <FieldWrap icon={User}>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            <div className="it-form-group">
              <label className="it-form-label">Username</label>
              <FieldWrap icon={AtSign}>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            <div className="it-form-group">
              <label className="it-form-label">
                Password
                {modalMode === 'edit' && (
                  <span className="muted it-form-hint-normal">
                    {' '}(kosongkan jika tidak diubah)
                  </span>
                )}
              </label>
              <FieldWrap icon={Lock}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="it-form-field it-form-field--icon"
                />
              </FieldWrap>
            </div>

            <div className="it-form-group it-form-group--last">
              <label className="it-form-label">Status</label>
              <FieldWrap icon={ToggleLeft}>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="it-form-field it-form-field--icon"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </FieldWrap>
            </div>

            <div className="it-form-actions">
              <button type="submit" className="btn it-form-actions__submit">
                {modalMode === 'create' ? `Tambah ${cfg.nama}` : 'Simpan Perubahan'}
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

// =========================
// Tab Hak Akses Nurse
// =========================
function HakAksesTab() {
  const [nurses, setNurses] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  function notify(type, text) {
    setToast({ type, text })
  }

  function load() {
    setLoading(true)

    api.getNurse()
      .then((res) => {
        setNurses(
          (res.petugas || []).map((n) => ({
            ...n,
            hak_akses: n.hak_akses || {},
          }))
        )
      })
      .catch((e) => notify('error', e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function toggle(id, key) {
    setNurses((list) =>
      list.map((n) =>
        n.id === id
          ? { ...n, hak_akses: { ...n.hak_akses, [key]: !n.hak_akses[key] } }
          : n
      )
    )
  }

  function simpan(nurse) {
    api.saveHakAkses({ id: nurse.id, hak_akses: nurse.hak_akses })
      .then(() => {
        notify(
          'success',
          `Hak akses ${nurse.nama} disimpan. Berlaku setelah nurse login ulang.`
        )
      })
      .catch((e) => notify('error', e.message))
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : (
          <div className="management-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nurse</th>
                  {IZIN.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {nurses.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <strong>{n.nama}</strong>
                      <div className="muted">{n.username}</div>
                    </td>

                    {IZIN.map(([key]) => (
                      <td key={key}>
                        <input
                          type="checkbox"
                          checked={!!n.hak_akses[key]}
                          onChange={() => toggle(n.id, key)}
                        />
                      </td>
                    ))}

                    <td>
                      <button className="btn" onClick={() => simpan(n)}>
                        Simpan
                      </button>
                    </td>
                  </tr>
                ))}

                {nurses.length === 0 && (
                  <tr>
                    <td colSpan={IZIN.length + 2} className="empty-state">
                      Belum ada akun nurse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}