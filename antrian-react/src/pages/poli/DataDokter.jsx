import { useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  Stethoscope,
  Plus,
  X,
  ImagePlus,
  CheckCircle2,
  UserCog,
  RotateCcw,
  User,
  Hash,
  Lock,
  Building2,
  MapPin,
  Tv,
  ToggleLeft,
} from 'lucide-react'
import { api } from '../../api/client'
import { formatNomor, isDokterNonaktif } from '../../utils/dokter'
import {
  FIELD,
  FormActions,
  FormField,
  Modal,
  RowActions,
  Toast,
} from '../../components/it/ITComponents'
import Pagination, { usePagination } from '../../components/Pagination'

const EMPTY_FORM = {
  AID: '',
  Nama: '',
  DokterID: '',
  Pwd: '',
  NamaPoli: '',
  Ruang: '',
  Display: '1',
  Status: '',
}

const FORM_KEYS = Object.keys(EMPTY_FORM)
const DISPLAY_NUMBERS = Array.from({ length: 10 }, (_, i) => String(i + 1))
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const PHOTO_MAX_BYTES = 5 * 1024 * 1024

const IZIN_PENUH = { tambah: true, edit: true, hapus: true, kosongkan: true }

function DisplayOptions() {
  return DISPLAY_NUMBERS.map((n) => (
    <option key={n} value={n}>
      Display {n}
    </option>
  ))
}

export default function DataDokter({ izin = IZIN_PENUH, aksiTambahan = null }) {
  const [doctors, setDoctors] = useState([])
  const [statuses, setStatuses] = useState([])
  const [search, setSearch] = useState('')
  const [display, setDisplay] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', text }

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    paginatedItems: paginatedDoctors,
  } = usePagination(doctors, 10)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  const notify = (type, text) => setToast({ type, text })

  // ================= DATA =================

  async function fetchDoctors(searchTerm = search, displayFilter = display) {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      if (displayFilter) params.set('display', displayFilter)

      const result = await api.getDoctors(params.toString())
      setDoctors(Array.isArray(result.data) ? result.data : [])
      setCurrentPage(1)
    } catch (err) {
      notify('error', err.message || 'Gagal memuat data dokter.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchStatuses() {
    try {
      const result = await api.getDoctorOptions()
      setStatuses(result.data?.statuses ?? [])
    } catch (err) {
      notify('error', err.message || 'Gagal memuat pilihan status.')
    }
  }

  function handleRefresh() {
    setSearch('')
    setDisplay('')
    fetchDoctors('', '')
  }

  useEffect(() => {
    fetchDoctors('', '')
    fetchStatuses()
  }, [])

  // Bebaskan memori preview foto yang dibuat dari file lokal
  useEffect(() => {
    return () => {
      if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  // ================= FORM =================

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
    setToast(null)
    setModalOpen(true)
  }

  function openEditForm(doctor) {
    setEditing(true)
    setForm({
      AID: String(doctor.AID),
      Nama: doctor.Nama ?? '',
      DokterID: doctor.DokterID ?? '',
      Pwd: '',
      NamaPoli: doctor.NamaPoli ?? '',
      Ruang: doctor.Ruang ?? '',
      Display: String(doctor.Display ?? '1'),
      Status: String(doctor.Status ?? ''),
    })

    setPhotoFile(null)
    setPhotoPreview(doctor.foto ? api.getDoctorPhotoUrl(doctor.foto) : '')
    setToast(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (!saving) setModalOpen(false)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const problem = !PHOTO_TYPES.includes(file.type)
      ? 'Format foto harus JPG, PNG, GIF, atau WEBP.'
      : file.size > PHOTO_MAX_BYTES
        ? 'Ukuran foto maksimal 5 MB.'
        : ''

    if (problem) {
      notify('error', problem)
      event.target.value = ''
      setPhotoFile(null)
      return
    }

    setToast(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function submitForm(event) {
    event.preventDefault()
    setSaving(true)
    setToast(null)

    try {
      const body = new FormData()
      body.append('action', editing ? 'update' : 'create')
      FORM_KEYS.forEach((key) => body.append(key, String(form[key] ?? '')))
      if (photoFile) body.append('foto', photoFile)

      const result = await api.saveDoctor(body)

      setModalOpen(false)
      resetPhoto()
      notify('success', result.message || 'Data dokter berhasil disimpan.')
      await fetchDoctors(search, display)
    } catch (err) {
      notify('error', err.message || 'Gagal menyimpan data dokter.')
    } finally {
      setSaving(false)
    }
  }

  // ================= AKSI =================

  async function deleteDoctor(doctor) {
    const confirmed = window.confirm(
      `Hapus data dokter "${doctor.Nama}"? Tindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmed) return

    setToast(null)

    try {
      const result = await api.deleteDoctor(doctor.AID)
      notify('success', result.message || 'Dokter berhasil dihapus.')
      await fetchDoctors(search, display)
    } catch (err) {
      notify('error', err.message || 'Gagal menghapus dokter.')
    }
  }

  async function handleResetQueue() {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin mengosongkan/mereset seluruh nomor antrean pada Display 1–10?'
    )
    if (!confirmed) return

    setToast(null)
    setSaving(true)

    try {
      const result = await api.resetQueuePoli()
      notify('success', result.message || 'Seluruh nomor antrean berhasil dikosongkan.')
      await fetchDoctors(search, display)
    } catch (err) {
      notify('error', err.message || 'Terjadi kesalahan saat mengosongkan antrean.')
    } finally {
      setSaving(false)
    }
  }

  // ================= TURUNAN =================

  const dokterNonaktif = doctors.filter(isDokterNonaktif).length
  const dokterAktif = doctors.length - dokterNonaktif

  const summary = [
    { label: 'Total Dokter', value: doctors.length, icon: Stethoscope },
    { label: 'Aktif', value: dokterAktif, icon: CheckCircle2 },
    { label: 'Tidak Aktif', value: dokterNonaktif, icon: X, off: true },
  ]

  const showAksi = izin.edit || izin.hapus
  const colCount = showAksi ? 8 : 7

  // Isian teks di form, urut sesuai tampilan
  const textFields = [
    { name: 'Nama', icon: User, label: 'Nama Dokter *', placeholder: 'Contoh: dr. Budi Santoso, Sp.A' },
    { name: 'DokterID', icon: Hash, label: 'ID Dokter (SIP / Kode) *', placeholder: 'Contoh: DOK-001' },
    {
      name: 'Pwd',
      icon: Lock,
      label: editing ? 'Password Baru (opsional)' : 'Password *',
      type: 'password',
      autoComplete: 'new-password',
      required: !editing,
      placeholder: editing ? 'Kosongkan jika tidak diubah' : 'Password login antrean',
    },
    { name: 'NamaPoli', icon: Building2, label: 'Nama Poli *', placeholder: 'Contoh: Poli Anak' },
    { name: 'Ruang', icon: MapPin, label: 'Ruang Praktek *', placeholder: 'Contoh: 101' },
  ]

  // ================= TAMPILAN =================

  return (
    <div className="doctors-page">

      {/* HERO */}
      <section className="ambil-hero doctor-hero">
        <div className="ambil-hero__icon">
          <UserCog size={25} strokeWidth={1.9} />
        </div>

        <div className="ambil-hero__content">
          <span className="ambil-hero__eyebrow">MASTER POLIKLINIK</span>
          <h1>Master Data Dokter</h1>
          <p>Kelola data dokter, spesialisasi poli, foto profil, dan status kehadiran dokter.</p>
        </div>
      </section>

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* TABLE PANEL */}
      <div className="card doctor-table-panel">
        <div className="doctor-table-heading">
          {/* Kiri: judul */}
          <div>
            <h3>Daftar Dokter & Spesialisasi</h3>
            <p>Kelola data dokter, poli, nomor ruang, dan display antrean.</p>
          </div>

          {/* Kanan: tombol aksi (+ Nurse1, TV Poli, Logout jika ada) */}
          <div className="doctor-heading-actions">
            {izin.tambah && (
              <button type="button" className="btn" onClick={openAddForm}>
                <Plus size={17} />
                <span>Tambah Dokter</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'loading-spin' : ''} />
              <span>Refresh</span>
            </button>

            {izin.kosongkan && (
              <button type="button" className="btn btn-danger-outline" onClick={handleResetQueue} disabled={saving}>
                <RotateCcw size={15} />
                <span>{saving ? 'Memproses...' : 'Reset Antrean 1-10'}</span>
              </button>
            )}

            {/* Pemisah: aksi data | TV Poli & akun (hanya di halaman Nurse) */}
            {aksiTambahan && <span className="topbar__divider" />}
            {aksiTambahan}
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
            <DisplayOptions />
          </select>

          <button type="submit" className="btn btn-outline">
            <Search size={16} />
            <span>Cari</span>
          </button>

          {/* Ringkasan: sejajar dengan pencarian, rata kanan */}
          <div className="doctor-summary table-toolbar__count">
            {summary.map(({ label, value, icon: Icon, off }) => (
              <div className="doctor-summary-card" key={label}>
                <div className={'doctor-summary-icon' + (off ? ' doctor-summary-icon-off' : '')}>
                  <Icon size={14} />
                </div>
                <div>
                  <span>{label}</span>
                  <strong>{loading ? '-' : value}</strong>
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* TABLE */}
        <div className="management-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Dokter</th>
                <th>Poli</th>
                <th>Ruang</th>
                <th>Display</th>
                <th>Status</th>
                <th>Antrean</th>
                {showAksi && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="empty-state">
                    Memuat data dokter...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="empty-state">
                    Tidak ada data dokter yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doctor, index) => (
                  <tr key={doctor.AID}>
                    <td>
                      <span className="doctor-row-number">
                        {startIndex + index + 1}
                      </span>
                    </td>
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

                    <td><span className="doctor-poli-chip">{doctor.NamaPoli || '—'}</span></td>
                    <td><span className="doctor-ruang-chip">{doctor.Ruang ? `Ruang ${doctor.Ruang}` : '—'}</span></td>
                    <td>
                      <span className="doctor-display-badge">
                        Display {doctor.Display ?? '1'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          'doctor-status-badge' +
                          (isDokterNonaktif(doctor) ? ' doctor-status-badge--off' : '')
                        }
                      >
                        {doctor.NamaStatus || doctor.Status || '—'}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={`doctor-queue-number${
                          !doctor.Antrian || formatNomor(doctor.Antrian) === '000'
                            ? ' queue-zero'
                            : ''
                        }`}
                      >
                        {formatNomor(doctor.Antrian)}
                      </strong>
                    </td>

                    {showAksi && (
                      <td>
                        <RowActions
                          onEdit={izin.edit ? () => openEditForm(doctor) : undefined}
                          onDelete={izin.hapus ? () => deleteDoctor(doctor) : undefined}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="doctor-table-footer">Memuat data...</div>
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={doctors.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemName="dokter"
          />
        )}
      </div>

      {/* MODAL TAMBAH / EDIT DOKTER */}
      {modalOpen && (
        <Modal
          size="lg"
          icon={UserCog}
          title={editing ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
          subtitle="Lengkapi informasi dokter, poliklinik, dan foto di bawah ini."
          onClose={closeModal}
        >
          <form onSubmit={submitForm}>
            <div className="it-form-grid">
              {textFields.map(({ label, icon, required = true, ...input }) => (
                <FormField key={input.name} label={label} icon={icon}>
                  <input
                    {...input}
                    value={form[input.name]}
                    onChange={updateField}
                    required={required}
                    className={FIELD}
                  />
                </FormField>
              ))}

              <FormField label="Display TV *" icon={Tv}>
                <select
                  name="Display"
                  value={form.Display}
                  onChange={updateField}
                  required
                  className={FIELD}
                >
                  <DisplayOptions />
                </select>
              </FormField>

              <FormField label="Status Dokter *" icon={ToggleLeft}>
                <select
                  name="Status"
                  value={form.Status}
                  onChange={updateField}
                  required
                  className={FIELD}
                >
                  <option value="">Pilih status</option>
                  {statuses.map((status) => (
                    <option key={status.Status} value={String(status.Status)}>
                      {status.Nama}
                    </option>
                  ))}
                </select>
              </FormField>

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
                    accept={PHOTO_TYPES.join(',')}
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

            <FormActions
              submitLabel={saving ? 'Menyimpan...' : 'Simpan Data'}
              onCancel={closeModal}
              busy={saving}
            />
          </form>
        </Modal>
      )}
    </div>
  )
}