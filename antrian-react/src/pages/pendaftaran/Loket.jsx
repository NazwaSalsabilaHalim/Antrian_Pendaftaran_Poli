import { useEffect, useState } from 'react'
import {
  Users,
  Building2,
  Megaphone,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { api } from '../../api/client'
import { COUNTER_KEY } from '../../utils/auth'

export default function Loket() {
  const [counterList, setCounterList] = useState([])
  const [tombolList, setTombolList] = useState([])
  // loket yang dipilih disimpan, jadi tidak hilang saat refresh
  const [counterId, setCounterId] = useState(
    () => localStorage.getItem(COUNTER_KEY) || ''
  )
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [lastPanggil, setLastPanggil] = useState({})
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    Promise.all([api.getCounter(), api.getTombol()])
      .then(([c, t]) => {
        setCounterList(c.counter)
        setTombolList(t.tombol)

        // kalau loket tersimpan sudah tidak ada di daftar, reset
        const saved = localStorage.getItem(COUNTER_KEY)
        if (saved && !c.counter.some((x) => String(x.CounterID) === saved)) {
          localStorage.removeItem(COUNTER_KEY)
          setCounterId('')
        }
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!toast) return

    const id = setTimeout(() => setToast(''), 3000)

    return () => clearTimeout(id)
  }, [toast])


  async function handlePanggil(tombol) {
    if (!counterId) {
      setError('Pilih loket terlebih dahulu.')
      return
    }

    setError('')
    setBusyId(tombol.TombolID)

    try {
      // 1. Ambil nomor antrean berikutnya
      const hasil = await api.tekanCounter(
        counterId,
        tombol.TombolID
      )

      // Jika tidak ada nomor baru yang bisa dipanggil
      if (!hasil.panggil_id) {
        setToast(hasil.text || 'Tidak ada antrean berikutnya.')
        return
      }

      // 2. Konfirmasi panggilan agar Panggil menjadi Y
      await api.panggilKonfirmasi(hasil.panggil_id)

      // 3. Simpan ID panggilan terakhir untuk tombol Ulangi
      setLastPanggil((prev) => ({
        ...prev,
        [tombol.TombolID]: hasil.panggil_id,
      }))

      // 4. Tampilkan notifikasi berhasil
      setToast(hasil.text)

    } catch (e) {
      setError(e.message || 'Gagal memanggil nomor antrean.')
    } finally {
      setBusyId(null)
    }
  }

  async function handlePanggilUlang(tombolId) {
    const panggilId = lastPanggil[tombolId]

    if (!panggilId) return

    setError('')

    try {
      await api.panggilUlang(panggilId)
      setToast('Nomor dipanggil ulang.')
    } catch (e) {
      setError(e.message)
    }
  }

  const selectedCounter = counterList.find(
    (c) => String(c.CounterID) === String(counterId)
  )

  return (
    <div className="loket-page">

      {error && (
        <div className="loket-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* COUNTER SELECTOR */}
      <section className="loket-counter-card">

        <div className="loket-counter-card__icon">
          <Building2 size={23} />
        </div>

        <div className="loket-counter-card__info">
          <span className="loket-counter-card__label">
            LOKET PELAYANAN
          </span>

          <strong>
            {selectedCounter
              ? selectedCounter.Nama
              : 'Pilih loket yang digunakan'}
          </strong>

          <small>
            Pilih counter sebelum mulai memanggil antrian.
          </small>
        </div>

        <div className="loket-counter-card__select">
          <label htmlFor="counter">
            Counter
          </label>

          <select
            id="counter"
            value={counterId}
            onChange={(e) => {
              const value = e.target.value
              setCounterId(value)
              setError('')

              if (value) localStorage.setItem(COUNTER_KEY, value)
              else localStorage.removeItem(COUNTER_KEY)
            }}
          >
            <option value="">
              Pilih Counter
            </option>

            {counterList.map((c) => (
              <option
                key={c.CounterID}
                value={c.CounterID}
              >
                {c.Nama}
              </option>
            ))}
          </select>
        </div>

      </section>

      {/* SECTION TITLE */}
      <div className="loket-section-heading">
        <div>
          <span className="loket-section-heading__eyebrow">
            PELAYANAN
          </span>

          <h2>
            Jenis Antrian
          </h2>
        </div>

        <span className="loket-section-heading__count">
          {tombolList.length} layanan
        </span>
      </div>

      {/* QUEUE CARDS */}
      <div className="loket-queue-grid">

        {tombolList.map((t, index) => {
          const isBusy = busyId === t.TombolID
          const hasLastCall = Boolean(lastPanggil[t.TombolID])

          return (
            <div
              key={t.TombolID}
              className={`loket-queue-card loket-queue-card--${index % 3}`}
            >

              {/* CARD HEADER */}
              <div className="loket-queue-card__header">

                <div className="loket-queue-card__category">
                  <span className="loket-queue-card__category-icon">
                    {index === 0 ? (
                      <Users size={17} />
                    ) : (
                      <Building2 size={17} />
                    )}
                  </span>

                  <span>
                    Jenis Antrian
                  </span>
                </div>

                <span className="loket-queue-card__number">
                  0{index + 1}
                </span>

              </div>

              {/* TITLE */}
              <div className="loket-queue-card__body">

                <h3>
                  {t.Nama}
                </h3>

                <p>
                  Antrian pasien
                </p>

                {/* CURRENT STATUS */}
                <div
                  className={
                    'loket-current-status' +
                    (hasLastCall
                      ? ' loket-current-status--active'
                      : '')
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
                    <span>
                      Status panggilan
                    </span>

                    <strong>
                      {hasLastCall
                        ? 'Nomor terakhir sudah dipanggil'
                        : 'Siap memanggil'}
                    </strong>
                  </div>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="loket-queue-card__actions">

                <button
                  className="loket-btn loket-btn--primary"
                  disabled={isBusy}
                  onClick={() => handlePanggil(t)}
                >
                  <span>
                    {isBusy
                      ? 'Memanggil...'
                      : 'Panggil Berikutnya'}
                  </span>

                  {!isBusy && (
                    <ArrowRight size={18} />
                  )}
                </button>

                <button
                  className="loket-btn loket-btn--secondary"
                  disabled={!lastPanggil[t.TombolID]}
                  onClick={() =>
                    handlePanggilUlang(t.TombolID)
                  }
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

      {/* EMPTY STATE */}
      {tombolList.length === 0 && (
        <div className="loket-empty">
          <Users size={30} />
          <strong>Belum ada jenis antrian</strong>
          <span>
            Data jenis antrian belum tersedia.
          </span>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="loket-toast">
          <CheckCircle2 size={19} />

          <div>
            <strong>Berhasil</strong>
            <span>{toast}</span>
          </div>
        </div>
      )}

    </div>
  )
}