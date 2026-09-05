import { useEffect, useState } from 'react'
import { api } from '../api/client'
import {
  Ticket,
  Users,
  Building2,
  ArrowRight,
  Printer,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'

export default function AmbilNomor() {
  const [tombolList, setTombolList] = useState([])
  const [tiket, setTiket] = useState(null)
  const [error, setError] = useState('')
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    api.getTombol().then((d) => setTombolList(d.tombol)).catch((e) => setError(e.message))
  }, [])

  async function handleAmbil(tombol) {
    setError('')
    setLoadingId(tombol.TombolID)
    try {
      const hasil = await api.ambilNomor(tombol.TombolID)
      setTiket(hasil)
      // buka struk cetak di tab baru, sama seperti perilaku aplikasi lama
      window.open(
        api.cetakStrukUrl(tombol.TombolID, hasil.tombol_nama, hasil.nomor, hasil.prefix),
        '_blank'
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  function getIcon(index) {
    if (index === 0) {
      return <Building2 size={28} strokeWidth={1.8} />
    }

    return <Users size={28} strokeWidth={1.8} />
  }

  return (
    <div className="ambil-page">

      {/* HERO */}
      <section className="ambil-hero">

        <div className="ambil-hero__icon">
          <Ticket size={25} strokeWidth={1.9} />
        </div>

        <div className="ambil-hero__content">
          <span className="ambil-hero__eyebrow">
            PENDAFTARAN PASIEN
          </span>

          <h1>
            Ambil Nomor Antrian
          </h1>

          <p>
            Silakan pilih jenis pendaftaran sesuai kebutuhan Anda.
          </p>
        </div>

        <div className="ambil-hero__step">
          <span>01</span>
          <small>
            Pilih jenis
            <br />
            pendaftaran
          </small>
        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="ambil-error">
          <span>!</span>
          <div>
            <strong>Terjadi kesalahan</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* SUCCESS TICKET */}
      {tiket && (
        <section className="ambil-ticket">

          <div className="ambil-ticket__top">

            <div className="ambil-ticket__success">
              <CheckCircle2 size={18} />
              Nomor berhasil diambil
            </div>

            <span className="ambil-ticket__category">
              {tiket.tombol_nama}
            </span>

          </div>

          <div className="ambil-ticket__content">

            <div className="ambil-ticket__left">
              <span>Nomor Antrian Anda</span>

              <strong>
                {tiket.nomor_display}
              </strong>

              <p>
                Silakan ambil struk yang tercetak dan
                tunggu nomor Anda dipanggil.
              </p>
            </div>

            <div className="ambil-ticket__print">
              <Printer size={22} />
              <span>Struk sedang dicetak</span>
            </div>

          </div>

          <div className="ambil-ticket__bottom">
            <span>
              Mohon menunggu di ruang tunggu sampai nomor Anda dipanggil.
            </span>

            <button
              type="button"
              onClick={() => setTiket(null)}
            >
              <RotateCcw size={15} />
              Ambil nomor lagi
            </button>
          </div>

        </section>
      )}

      {/* CHOOSE REGISTRATION */}
      <section className="ambil-selection">

        <div className="ambil-selection__heading">
          <div>
            <span>LANGKAH 01</span>
            <h2>Pilih Jenis Pendaftaran</h2>
            <p>
              Ketuk salah satu pilihan di bawah untuk mendapatkan nomor antrian.
            </p>
          </div>

          <div className="ambil-selection__indicator">
            <span />
            Pilih salah satu
          </div>
        </div>

        <div className="ambil-options">

          {tombolList.map((t, index) => {
            const isLoading = loadingId === t.TombolID

            return (
              <button
                key={t.TombolID}
                type="button"
                className={`ambil-option ambil-option--${index % 3}`}
                disabled={loadingId !== null}
                onClick={() => handleAmbil(t)}
              >

                {/* ICON */}
                <div className="ambil-option__icon">
                  {getIcon(index)}
                </div>

                {/* NUMBER */}
                <span className="ambil-option__number">
                  0{index + 1}
                </span>

                {/* CONTENT */}
                <div className="ambil-option__content">

                  <span className="ambil-option__label">
                    JENIS PENDAFTARAN
                  </span>

                  <h3>
                    {t.Nama}
                  </h3>

                  <p>
                    {index === 0
                      ? 'Untuk pasien dengan asuransi atau perusahaan.'
                      : 'Untuk pasien umum tanpa asuransi perusahaan.'}
                  </p>

                </div>

                {/* ACTION */}
                <div className="ambil-option__action">

                  <span>
                    {isLoading
                      ? 'Memproses...'
                      : 'Ambil Nomor'}
                  </span>

                  {!isLoading && (
                    <ArrowRight size={19} />
                  )}

                </div>

              </button>
            )
          })}

          {tombolList.length === 0 && !error && (
            <div className="ambil-loading">
              <div className="ambil-loading__spinner" />
              <strong>Memuat jenis pendaftaran...</strong>
              <span>Mohon tunggu sebentar</span>
            </div>
          )}

        </div>

      </section>

      {/* INFO */}
      <section className="ambil-info">

        <div className="ambil-info__icon">
          <Ticket size={18} />
        </div>

        <div>
          <strong>Informasi pengambilan nomor</strong>
          <p>
            Setiap pasien hanya perlu mengambil satu nomor antrian.
            Simpan struk sampai proses pelayanan selesai.
          </p>
        </div>

      </section>

    </div>
  )
}