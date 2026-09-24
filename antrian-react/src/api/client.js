const BASE = import.meta.env.VITE_API_BASE || 'http://192.168.2.250/KP/antrian_pendaftaran'
const API = `${BASE}/react-api`

async function req(path, options = {}) {
  const res = await fetch(`${API}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data || data.ok === false) {
    throw new Error(data?.error || `Gagal memanggil ${path}`)
  }
  return data
}

const post = (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) })
const get = (path) => req(path)

export const api = {
  base: BASE,

  // ===== Sistem antrian pendaftaran (sudah ada sebelumnya) =====
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

  // ===== Panel Admin IT =====
  getRingkasanIT: () => get('ringkasan_it.php'),

  getPetugas: () => get('petugas.php'),
  savePetugas: (payload) => post('petugas.php', payload),

  getLoketIT: () => get('kelola_loket.php'),
  saveLoketIT: (payload) => post('kelola_loket.php', payload),

  getJenisPendaftaran: () => get('jenis_pendaftaran.php'),
  saveJenisPendaftaran: (payload) => post('jenis_pendaftaran.php', payload),

  getKonfigurasi: () => get('konfigurasi.php'),
  saveKonfigurasi: (payload) => post('konfigurasi.php', payload),

  getAktivitas: (limit) => get(`aktivitas.php${limit ? `?limit=${limit}` : ''}`),
}