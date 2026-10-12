import { useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  Stethoscope,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ImagePlus,
  CheckCircle2,
  UserCog,
  RotateCcw,
} from 'lucide-react'
import { api } from '../../api/client'
import { Toast } from '../../components/it/ITComponents'

const EMPTY_FORM = {
  AID: '',
  Nama: '',
  DokterID: '',
  Pwd: '',
  foto: '',
  NamaPoli: '',
  Ruang: '',
  Display: '1',
  Status: '',
}

const IZIN_PENUH = { tambah: true, edit: true, hapus: true, kosongkan: true }

export default function DataDokter({ izin = IZIN_PENUH, aksiTambahan = null }) {
  const [doctors, setDoctors] = useState([])
  const [statuses, setStatuses] = useState([])
  const [search, setSearch] = useState('')
  const [display, setDisplay] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  async function fetchDoctors(searchTerm = search, displayFilter = display) {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim())
      }
      if (displayFilter) {
        params.set('display', displayFilter)
      }

      const result = await api.getDoctors(params.toString())
      setDoctors(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err.message || 'Gagal memuat data dokter.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchStatuses() {
    try {
      const result = await api.getDoctorOptions()
      setStatuses(result.data?.statuses ?? [])
    } catch (err) {
      setError(err.message || 'Gagal memuat pilihan status.')
    }
  }

  useEffect(() => {
    fetchDoctors('', '')
    fetchStatuses()
  }, [])

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  function resetPhoto() {
    setPhotoFile(null)
    setPhotoPreview('')
  }

  function openAddForm() {
    setEditing(false)
    setForm({
      ...EMPTY_FORM,
      Status: statuses.length ? String(statuses[0].Status) : '',
    })
    resetPhoto()
    setMessage('')
    setError('')
    setModalOpen(true)
  }

  function openEditForm(doctor) {
    setEditing(true)
    setForm({
      AID: String(doctor.AID),
      Nama: doctor.Nama ?? '',
      DokterID: doctor.DokterID ?? '',
      Pwd: '',
      foto: doctor.foto ?? '',
      NamaPoli: doctor.NamaPoli ?? '',
      Ruang: doctor.Ruang ?? '',
      Display: String(doctor.Display ?? '1'),
      Status: String(doctor.Status ?? ''),
    })

    setPhotoFile(null)
    if (doctor.foto) {
      setPhotoPreview(api.getDoctorPhotoUrl(doctor.foto))
    } else {
      setPhotoPreview('')
    }

    setMessage('')
    setError('')
    setModalOpen(true)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Format foto harus JPG, PNG, GIF, atau WEBP.')
      event.target.value = ''
      setPhotoFile(null)
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Ukuran foto maksimal 5 MB.')
      event.target.value = ''
      setPhotoFile(null)
      return
    }

    setError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function submitForm(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const body = new FormData()
      body.append('action', editing ? 'update' : 'create')
      body.append('AID', String(form.AID ?? ''))
      body.append('Nama', String(form.Nama ?? ''))
      body.append('DokterID', String(form.DokterID ?? ''))
      body.append('Pwd', String(form.Pwd ?? ''))
      body.append('NamaPoli', String(form.NamaPoli ?? ''))
      body.append('Ruang', String(form.Ruang ?? ''))
      body.append('Display', String(form.Display ?? ''))
      body.append('Status', String(form.Status ?? ''))

      if (photoFile) {
        body.append('foto', photoFile)
      }

      const result = await api.saveDoctor(body)

      setModalOpen(false)
      resetPhoto()
      setMessage(result.message || 'Data dokter berhasil disimpan.')
      await fetchDoctors(search, display)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data dokter.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteDoctor(doctor) {
    const confirmed = window.confirm(
      `Hapus data dokter "${doctor.Nama}"? Tindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      const result = await api.deleteDoctor(doctor.AID)
      setMessage(result.message || 'Dokter berhasil dihapus.')
      await fetchDoctors(search, display)
    } catch (err) {
      setError(err.message || 'Gagal menghapus dokter.')
    }
  }

  async function handleResetQueue() {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin mengosongkan/mereset seluruh nomor antrean pada Display 1–10?'
    )
    if (!confirmed) return

    setError('')
    setMessage('')
    setSaving(true)

    try {
      const result = await api.resetQueuePoli()
      setMessage(result.message || 'Seluruh nomor antrean berhasil dikosongkan.')
      await fetchDoctors(search, display)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengosongkan antrean.')
    } finally {
      setSaving(false)
    }
  }

  const toast = error
    ? { type: 'error', text: error }
    : message
      ? { type: 'success', text: message }
      : null

  return (
    <div className="doctors-page">
      {/* PAGE INTRO — Selaras dengan Pendaftaran */}
      <div className="page-intro">
        <div>
          <div className="page-intro__eyebrow">
            <UserCog size={15} />
            MASTER POLIKLINIK
          </div>

          <h1 className="page-intro__title">
            Master Data Dokter
          </h1>

          <p className="page-intro__subtitle">
            Kelola data dokter, spesialisasi poli, foto profil, dan status kehadiran dokter.
          </p>
        </div>

        <div className="doctor-page-actions">
          {aksiTambahan}

          <div className="page-intro__status">
            <span />
            {doctors.length} Dokter Terdaftar
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="doctor-summary">
        <div className="doctor-summary-card">
          <div className="doctor-summary-icon">
            <Stethoscope size={22} />
          </div>
          <div>
            <span>Jumlah Dokter</span>
            <strong>{doctors.length}</strong>
            <small>Dokter aktif sesuai filter</small>
          </div>
        </div>

        <div className="doctor-summary-card">
          <div className="doctor-summary-icon doctor-summary-icon-blue">
            <Users size={22} />
          </div>
          <div>
            <span>Filter Display</span>
            <strong>{display ? `Display ${display}` : 'Semua Display'}</strong>
            <small>Layar TV Antrean</small>
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => { setError(''); setMessage('') }} />

      {/* TABLE PANEL */}
      <div className="doctor-table-panel">
        <div className="doctor-table-heading">
          <div>
            <h3>Daftar Dokter & Spesialisasi</h3>
            <p>Kelola data dokter, poli, nomor ruang, dan display antrean.</p>
          </div>

          <div className="doctor-heading-actions">
            <button
              type="button"
              className="doctor-refresh-button"
              onClick={() => fetchDoctors(search, display)}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'loading-spin' : ''} />
              <span>Refresh</span>
            </button>

            {izin.tambah && (
              <button type="button" className="doctor-add-button" onClick={openAddForm}>
                <Plus size={17} />
                <span>Tambah Dokter</span>
              </button>
            )}

            {izin.kosongkan && (
              <button type="button" className="btn-danger" onClick={handleResetQueue} disabled={saving}>
                <RotateCcw size={15} />
                <span>{saving ? 'Memproses...' : 'Reset Antrean 1-10'}</span>
              </button>
            )}
          </div>
        </div>

        {/* TOOLBAR */}
        <form
          className="doctor-toolbar"
          onSubmit={(e) => {
            e.preventDefault()
            fetchDoctors(search, display)
          }}
        >
          <label className="doctor-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Cari nama dokter atau poli..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <select
            className="doctor-display-filter"
            aria-label="Filter display"
            value={display}
            onChange={(e) => {
              setDisplay(e.target.value)
              fetchDoctors(search, e.target.value)
            }}
          >
            <option value="">Semua Display</option>
            {Array.from({ length: 10 }, (_, index) => (
              <option key={index + 1} value={String(index + 1)}>
                Display {index + 1}
              </option>
            ))}
          </select>

          <button type="submit" className="doctor-refresh-button">
            <Search size={16} />
            <span>Cari</span>
          </button>
        </form>

        {/* TABLE */}
        <div className="doctor-table-scroll">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Dokter</th>
                <th>Poli</th>
                <th>Ruang</th>
                <th>Display</th>
                <th>Status</th>
                <th>Antrean</th>
                {(izin.edit || izin.hapus) && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="doctor-table-message">
                    Memuat data dokter...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="doctor-table-message">
                    Tidak ada data dokter yang sesuai.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor, index) => (
                  <tr key={doctor.AID}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="doctor-name-cell">
                        {doctor.foto ? (
                          <img
                            className="doctor-photo"
                            src={api.getDoctorPhotoUrl(doctor.foto)}
                            alt={doctor.Nama}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="doctor-photo-placeholder">
                            <Stethoscope size={18} />
                          </div>
                        )}

                        <div>
                          <strong>{doctor.Nama || '—'}</strong>
                          <small>ID: {doctor.DokterID || '—'}</small>
                        </div>
                      </div>
                    </td>

                    <td>{doctor.NamaPoli || '—'}</td>
                    <td>{doctor.Ruang ? `Ruang ${doctor.Ruang}` : '—'}</td>
                    <td>
                      <span className="doctor-display-badge">
                        Display {doctor.Display ?? '1'}
                      </span>
                    </td>

                    <td>
                      <span className="doctor-status-badge">
                        {doctor.NamaStatus || doctor.Status || '—'}
                      </span>
                    </td>

                    <td>
                      <strong className="doctor-queue-number">
                        {String(doctor.Antrian ?? 0).padStart(3, '0')}
                      </strong>
                    </td>

                    {(izin.edit || izin.hapus) && (
                      <td>
                        <div className="doctor-row-actions">
                          {izin.edit && (
                            <button type="button" className="doctor-edit-button" title="Edit dokter"
                              aria-label={`Edit ${doctor.Nama}`} onClick={() => openEditForm(doctor)}>
                              <Pencil size={16} />
                            </button>
                          )}
                          {izin.hapus && (
                            <button type="button" className="doctor-delete-button" title="Hapus dokter"
                              aria-label={`Hapus ${doctor.Nama}`} onClick={() => deleteDoctor(doctor)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="doctor-table-footer">
          {loading ? 'Memuat data...' : `Menampilkan total ${doctors.length} dokter`}
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT DOKTER */}
      {modalOpen && (
        <div
          className="doctor-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setModalOpen(false)
            }
          }}
        >
          <div
            className="doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
          >
            {/* MODAL HEADER */}
            <div className="doctor-modal-heading">
              <div>
                <h3 id="doctor-modal-title">
                  {editing ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
                </h3>
                <p>Lengkapi informasi dokter, poliklinik, dan foto di bawah ini.</p>
              </div>

              <button
                type="button"
                className="doctor-modal-close"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Tutup form"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={submitForm}>
              <div className="doctor-form-grid">
                <label>
                  Nama Dokter *
                  <input
                    name="Nama"
                    value={form.Nama}
                    onChange={updateField}
                    placeholder="Contoh: dr. Budi Santoso, Sp.A"
                    required
                  />
                </label>

                <label>
                  ID Dokter (SIP / Kode) *
                  <input
                    name="DokterID"
                    value={form.DokterID}
                    onChange={updateField}
                    placeholder="Contoh: DOK-001"
                    required
                  />
                </label>

                <label>
                  {editing ? 'Password Baru (opsional)' : 'Password *'}
                  <input
                    name="Pwd"
                    type="password"
                    value={form.Pwd}
                    onChange={updateField}
                    autoComplete="new-password"
                    required={!editing}
                    placeholder={editing ? 'Kosongkan jika tidak diubah' : 'Password login antrean'}
                  />
                </label>

                <label>
                  Nama Poli *
                  <input
                    name="NamaPoli"
                    value={form.NamaPoli}
                    onChange={updateField}
                    placeholder="Contoh: Poli Anak"
                    required
                  />
                </label>

                <label>
                  Ruang Praktek *
                  <input
                    name="Ruang"
                    value={form.Ruang}
                    onChange={updateField}
                    placeholder="Contoh: 101"
                    required
                  />
                </label>

                <label>
                  Display TV *
                  <select
                    name="Display"
                    value={form.Display}
                    onChange={updateField}
                    required
                  >
                    {Array.from({ length: 10 }, (_, index) => (
                      <option key={index + 1} value={String(index + 1)}>
                        Display {index + 1}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Status Dokter *
                  <select
                    name="Status"
                    value={form.Status}
                    onChange={updateField}
                    required
                  >
                    <option value="">Pilih status</option>
                    {statuses.map((status) => (
                      <option key={status.Status} value={String(status.Status)}>
                        {status.Nama}
                      </option>
                    ))}
                  </select>
                </label>

                {/* UPLOAD FOTO */}
                <div className="doctor-photo-field doctor-photo-full">
                  <span className="doctor-photo-label">Foto Dokter</span>

                  <label className={`doctor-photo-dropzone ${photoPreview ? 'has-photo' : ''}`}>
                    {photoPreview ? (
                      <>
                        <img
                          src={photoPreview}
                          alt="Preview foto dokter"
                          className="doctor-photo-preview-image"
                        />
                        <div className="doctor-photo-overlay">
                          <ImagePlus size={20} />
                          <span>Ganti Foto</span>
                        </div>
                      </>
                    ) : (
                      <div className="doctor-photo-empty">
                        <div className="doctor-photo-upload-icon">
                          <ImagePlus size={25} />
                        </div>
                        <strong>Pilih Foto Dokter</strong>
                        <span>Klik untuk memilih foto dari komputer</span>
                        <small>JPG, PNG, GIF, atau WEBP • Maks. 5 MB</small>
                      </div>
                    )}

                    <input
                      type="file"
                      name="foto"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handlePhotoChange}
                    />
                  </label>

                  {photoFile && (
                    <div className="doctor-selected-file">
                      <div className="doctor-selected-file-icon">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <strong>{photoFile.name}</strong>
                        <small>{(photoFile.size / 1024 / 1024).toFixed(2)} MB</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="doctor-modal-actions">
                <button
                  type="button"
                  className="doctor-cancel-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="doctor-add-button"
                  disabled={saving}
                >
                  <Save size={16} />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}