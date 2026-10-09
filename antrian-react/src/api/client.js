const BASE = import.meta.env.VITE_API_BASE || 'http://localhost/KP/antrian_pendaftaran'
const API = `${BASE}/react-api`

async function req(path, options = {}) {
  const res = await fetch(`${API}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data || (data.ok === false && data.success === false && data.OK === 0)) {
    throw new Error(data?.error || data?.message || data?.MSG || `Gagal memanggil ${path}`)
  }
  return data
}

const post = (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) })

const postAuth = async (file, action, body, defaultError) => {
  const res = await fetch(`${API}/${file}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data || data.ok === false) {
    throw new Error(data?.error || defaultError)
  }

  return data
}

const postPetugas = (action, body) =>
  postAuth('petugas_auth.php', action, body, 'Login petugas gagal.')

const postNurse = (action, body) =>
  postAuth('nurse_auth.php', action, body, 'Login nurse gagal.')

const get = (path) => req(path)

export const api = {
  base: BASE,
  apiBase: API,

  login: (payload) => post('auth.php', {
    action: 'login',
    ...payload,
  }),

  registerAdmin: (payload) => post('auth.php', {
    action: 'register_admin',
    ...payload,
  }),

  loginPetugas: (payload) =>
    postPetugas('login', payload),

  loginNurse: (payload) =>
    postNurse('login', payload),

  // ===== Sistem antrian pendaftaran (Front Office) =====
  getTombol: () => get('tombol.php'),
  getCounter: () => get('counter.php'),
  ambilNomor: (tombolId) => post('ambil_nomor.php', { tombol_id: tombolId }),
  tekanCounter: (counterId, tombolId) => post('tekan_counter.php', { counter_id: counterId, tombol_id: tombolId }),
  panggilUlang: (panggilId) => post('panggil_ulang.php', { panggil_id: panggilId }),
  getDisplayQueue: () => get('display_queue.php'),
  getLiveMonitor: () => get('live_monitor.php'),
  panggilKonfirmasi: (panggilId) => post('panggil_konfirmasi.php', { panggil_id: panggilId }),
  getStatistik: (tanggal) => get(`statistik.php${tanggal ? `?tanggal=${tanggal}` : ''}`),
  getRiwayat: (params = '') => get(`riwayat.php${params ? `?${params}` : ''}`),
  // struk cetak masih pakai file lama karena berisi logika format printer thermal (ESC/POS)
  cetakStrukUrl: (tid, tombolNama, nomor, prefix) =>
    `${BASE}/index_btn.php?exe=cetak_struk&tid=${encodeURIComponent(tid)}&tombol=${encodeURIComponent(tombolNama)}&no=${encodeURIComponent(nomor)}&prefix=${encodeURIComponent(prefix)}`,

  // ===== Modul Dokter & Antrean Poli =====
  getDoctors: async (params = '') => {
    const res = await fetch(`${API}/doctors.php${params ? `?${params}` : ''}`)
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat data dokter')
    }
    return data
  },

  getDoctorOptions: async () => {
    const res = await fetch(`${API}/doctors.php?options=1`)
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memuat pilihan status')
    }
    return data
  },

  saveDoctor: async (formData) => {
    const res = await fetch(`${API}/doctors.php`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan data dokter')
    }
    return data
  },

  deleteDoctor: async (aid) => {
    const body = new URLSearchParams({ AID: String(aid) })
    const res = await fetch(`${API}/doctors.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus dokter')
    }
    return data
  },

  loginDoctor: (aid, pwd) => post('antrian.php', { x: 'login', AID: aid, Pwd: pwd }),
  getDoctorQueueData: (aid, pwd) => post('antrian.php', { x: 'data_tombol', AID: aid, Pwd: pwd }),
  updateDoctorQueue: (aid, pwd, dir) => post('antrian.php', { x: 'tekan_tombol', AID: aid, Pwd: pwd, dir }),
  setDoctorQueueManual: (aid, pwd, nomor) => post('antrian.php', { x: 'nomor_manual', AID: aid, Pwd: pwd, nomor }),
  resetQueuePoli: () => post('reset_queue.php', {}),

  getDoctorPhotoUrl: (photo) => {
    if (!photo) return ''
    if (/^https?:\/\//i.test(photo)) return photo
    if (photo.startsWith('/')) return photo
    const cleaned = photo.replace(/^foto\//i, '')
    return `${BASE}/foto/${cleaned}`
  },

  getBellUrl: () => '/Bells.mp3',

  // ===== Panel Admin IT =====
  getRingkasanIT: () => get('ringkasan_it.php'),

  getPetugas: () => get('petugas.php'),
  savePetugas: (payload) => post('petugas.php', payload),

  getNurse: () => get('petugas.php?role=nurse'),
  saveHakAkses: (payload) => post('petugas.php', { action: 'set_hak_akses', ...payload }),

  getLoketIT: () => get('kelola_loket.php'),
  saveLoketIT: (payload) => post('kelola_loket.php', payload),

  getJenisPendaftaran: () => get('jenis_pendaftaran.php'),
  saveJenisPendaftaran: (payload) => post('jenis_pendaftaran.php', payload),

  getKonfigurasi: () => get('konfigurasi.php'),
  saveKonfigurasi: (payload) => post('konfigurasi.php', payload),

  getAktivitas: (limit) => get(`aktivitas.php${limit ? `?limit=${limit}` : ''}`),
}