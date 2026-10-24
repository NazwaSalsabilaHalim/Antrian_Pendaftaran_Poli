import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Users,
  Building2,
  Briefcase,
  HeartPulse,
  Megaphone,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { api } from '../../api/client'
import { COUNTER_KEY, LAST_PANGGIL_KEY, getAdmin, getPetugas } from '../../utils/auth'
import { Toast } from '../../components/it/ITComponents'

const PING_MS = 15000     // tandai loket "masih dipakai" tiap 15 detik
const REFRESH_MS = 3000   // segarkan daftar loket tiap 3 detik

function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

function loadLastPanggil(counterId) {
  if (!counterId) return {}
  try {
    const raw = localStorage.getItem(LAST_PANGGIL_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed.tgl === getTodayStr() && String(parsed.counterId) === String(counterId)) {
      return parsed.data || {}
    }
  } catch {}
  return {}
}

function saveLastPanggil(counterId, data) {
  if (!counterId) {
    localStorage.removeItem(LAST_PANGGIL_KEY)
    return
  }
  localStorage.setItem(
    LAST_PANGGIL_KEY,
    JSON.stringify({
      tgl: getTodayStr(),
      counterId,
      data,
    })
  )
}

export default function Loket() {
  // Halaman ini juga bisa dibuka admin dari panel IT
  const { pathname } = useLocation()
  const user = pathname.startsWith('/it-dashboard') ? getAdmin() : getPetugas()
  const userId = user?.id

  // ================= STATE =================

  const [counterList, setCounterList] = useState([])
  const [tombolList, setTombolList] = useState([])

  // Loket yang sudah berhasil dipilih (disimpan, jadi tidak hilang saat refresh)
  const [counterId, setCounterId] = useState(
    () => localStorage.getItem(COUNTER_KEY) || ''
  )

  // ID panggilan terakhir per jenis antrian: { TombolID: panggil_id }
  const [lastPanggil, setLastPanggil] = useState(() =>
    loadLastPanggil(localStorage.getItem(COUNTER_KEY) || '')
  )

  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', text }

  // ================= AMBIL DATA =================

  const loadCounters = useCallback(async () => {
    const res = await api.getCounter()
    setCounterList(res.counter)
    return res.counter
  }, [])

  useEffect(() => {
    let batal = false

    async function init() {
      let list

      try {
        const [c, t] = await Promise.all([loadCounters(), api.getTombol()])
        if (batal) return
        list = c
        setTombolList(t.tombol)
      } catch (e) {
        if (!batal) showError(e.message)
        return
      }

      // Klaim ulang loket yang tersimpan (mis. setelah refresh halaman)
      const saved = localStorage.getItem(COUNTER_KEY)
      if (!saved) return

      if (!list.some((x) => String(x.CounterID) === saved)) {
        lepasLokal()
        return
      }

      try {
        await api.pilihLoket(saved, userId)
      } catch (e) {
        if (batal) return
        lepasLokal()
        showError(e.message)
        loadCounters().catch(() => {})
      }
    }

    init()

    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Segarkan status loket secara berkala dan otomatis saat tab browser aktif / difokuskan
  useEffect(() => {
    function segarkan() {
      if (!document.hidden) {
        loadCounters().catch(() => {})
      }
    }

    const t = setInterval(segarkan, REFRESH_MS)
    window.addEventListener('focus', segarkan)
    document.addEventListener('visibilitychange', segarkan)

    return () => {
      clearInterval(t)
      window.removeEventListener('focus', segarkan)
      document.removeEventListener('visibilitychange', segarkan)
    }
  }, [loadCounters])

  // Heartbeat: selama halaman terbuka, loket tetap dianggap dipakai
  useEffect(() => {
    if (!counterId || !userId) return

    const t = setInterval(() => {
      api.pingLoket(counterId, userId).catch((e) => {
        // Gangguan jaringan sesaat jangan sampai melepas loket
        if (e.name === 'TypeError') return

        lepasLokal()
        showError(e.message || 'Loket sudah tidak kamu pakai.')
        loadCounters().catch(() => {})
      })
    }, PING_MS)

    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterId, userId])

  // ================= AKSI =================

  function showToast(pesan) {
    setToast({ type: 'success', text: pesan })
  }

  function showError(pesan) {
    setToast({ type: 'error', text: pesan })
  }

  // Hapus pilihan loket di browser saja (tanpa panggil server)
  function lepasLokal() {
    setCounterId('')
    localStorage.removeItem(COUNTER_KEY)
    localStorage.removeItem(LAST_PANGGIL_KEY)
    setLastPanggil({})
  }

  async function pilihCounter(value) {
    setToast(null)

    // Pilihan dikosongkan -> lepas loket lama
    if (!value) {
      const lama = counterId
      lepasLokal()
      if (lama) await api.lepasLoket(lama, userId).catch(() => {})
      loadCounters().catch(() => {})
      return
    }

    // Klaim loket di server dulu; kalau gagal, pilihan lama tetap
    try {
      await api.pilihLoket(value, userId)
      setCounterId(value)
      localStorage.setItem(COUNTER_KEY, value)
      setLastPanggil(loadLastPanggil(value))
    } catch (e) {
      showError(e.message)
    } finally {
      loadCounters().catch(() => {})
    }
  }

  async function handlePanggil(tombol) {
    if (!counterId) {
      showError('Pilih loket terlebih dahulu.')
      return
    }

    setBusyId(tombol.TombolID)

    try {
      // 1. Ambil nomor antrean berikutnya
      const hasil = await api.tekanCounter(counterId, tombol.TombolID, userId)

      // Tidak ada nomor baru yang bisa dipanggil
      if (!hasil.panggil_id) {
        showError(hasil.text || 'Tidak ada antrean berikutnya.')
        return
      }

      // 2. Simpan ID panggilan terakhir untuk tombol Ulangi
      setLastPanggil((prev) => {
        const next = {
          ...prev,
          [tombol.TombolID]: hasil.panggil_id,
        }
        saveLastPanggil(counterId, next)
        return next
      })

      // 4. Tampilkan notifikasi berhasil
      showToast(hasil.text || 'Nomor berhasil dipanggil.')
    } catch (e) {
      showError(e.message || 'Gagal memanggil nomor antrean.')

      // Loket sudah bukan milik akun ini -> minta pilih ulang
      if (String(e.message).includes('tidak sedang kamu pakai')) {
        lepasLokal()
        loadCounters().catch(() => {})
      }
    } finally {
      setBusyId(null)
    }
  }

  async function handlePanggilUlang(tombolId) {
    const panggilId = lastPanggil[tombolId]

    if (!panggilId) return

    try {
      await api.panggilUlang(panggilId)
      showToast('Nomor dipanggil ulang.')
    } catch (e) {
      showError(e.message)
    }
  }

  const selectedCounter = counterList.find(
    (c) => String(c.CounterID) === String(counterId)
  )

  // ================= TAMPILAN =================

  return (
    <div>
      {/* PILIH COUNTER */}
      <section className="loket-counter-card">
        <div className="loket-counter-card__icon">
          <Building2 size={23} />
        </div>

        <div className="loket-counter-card__info">
          <span className="loket-counter-card__label">LOKET PELAYANAN</span>

          <strong>
            {selectedCounter ? selectedCounter.Nama : 'Pilih loket yang digunakan'}
          </strong>

          <small>Pilih counter sebelum mulai memanggil antrian.</small>
        </div>

        <div className="loket-counter-card__select">
          <label htmlFor="counter">Counter</label>

          <select
            id="counter"
            value={counterId}
            onFocus={() => loadCounters().catch(() => {})}
            onChange={(e) => pilihCounter(e.target.value)}
          >
            <option value="">Pilih Counter</option>

            {counterList.map((c) => {
              const dipakaiLain =
                c.dipakai && String(c.petugas_id) !== String(userId)

              return (
                <option
                  key={c.CounterID}
                  value={c.CounterID}
                  disabled={dipakaiLain}
                >
                  {dipakaiLain ? `${c.Nama} (dipakai ${c.petugas_nama})` : c.Nama}
                </option>
              )
            })}
          </select>
        </div>
      </section>

      {/* JUDUL BAGIAN */}
      <div className="loket-section-heading">
        <div>
          <span className="loket-section-heading__eyebrow">PELAYANAN</span>
          <h2>Jenis Antrian</h2>
        </div>

        <span className="loket-section-heading__count">
          {tombolList.length} layanan
        </span>
      </div>

      {/* KARTU JENIS ANTRIAN */}
      <div className="loket-queue-grid">
        {tombolList.map((t, index) => {
          const isBusy = busyId === t.TombolID
          const hasLastCall = Boolean(lastPanggil[t.TombolID])

          return (
            <div
              key={t.TombolID}
              className={`loket-queue-card loket-queue-card--${index % 4}`}
            >
              {/* HEADER KARTU */}
              <div className="loket-queue-card__header">
                <div className="loket-queue-card__category">
                  <span className="loket-queue-card__category-icon">
                    {(() => {
                      const n = (t.Nama || '').toLowerCase()
                      if (n.includes('asuransi')) return <Building2 size={17} />
                      if (n.includes('perusahaan')) return <Briefcase size={17} />
                      if (n.includes('saraf') || n.includes('dalam')) return <HeartPulse size={17} />
                      return <Users size={17} />
                    })()}
                  </span>

                  <span>Jenis Antrian</span>
                </div>

                <span className="loket-queue-card__number">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* ISI KARTU */}
              <div className="loket-queue-card__body">
                <h3>{t.Nama}</h3>
                <p>Antrian pasien</p>

                {/* STATUS PANGGILAN */}
                <div
                  className={
                    'loket-current-status' +
                    (hasLastCall ? ' loket-current-status--active' : '')
                  }
                >
                  <div className="loket-current-status__icon">
                    {hasLastCall ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <Megaphone size={19} />
                    )}
                  </div>

                  <div>
                    <span>Status panggilan</span>

                    <strong>
                      {hasLastCall
                        ? 'Nomor terakhir sudah dipanggil'
                        : 'Siap memanggil'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="loket-queue-card__actions">
                <button
                  className="loket-btn loket-btn--primary"
                  disabled={isBusy}
                  onClick={() => handlePanggil(t)}
                >
                  <span>{isBusy ? 'Memanggil...' : 'Panggil Berikutnya'}</span>

                  {!isBusy && <ArrowRight size={18} />}
                </button>

                <button
                  className="loket-btn loket-btn--secondary"
                  disabled={!hasLastCall}
                  onClick={() => handlePanggilUlang(t.TombolID)}
                  title="Panggil nomor terakhir kembali"
                >
                  <RotateCcw size={17} />
                  <span>Ulangi</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* KOSONG */}
      {tombolList.length === 0 && (
        <div className="loket-empty">
          <Users size={30} />
          <strong>Belum ada jenis antrian</strong>
          <span>Data jenis antrian belum tersedia.</span>
        </div>
      )}

      {/* NOTIFIKASI */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}