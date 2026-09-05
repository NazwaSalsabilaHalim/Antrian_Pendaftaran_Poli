/**
 * Menyusun daftar file suara (ting-tong, "nomor antrian", angka, "ke loket", nomor loket)
 * lalu memutarnya berurutan lewat satu <audio> element.
 * Path file suara diambil dari server PHP lama: {BASE}/display/sounds_jelek/xxx.mp3
 */
export function buildAntrianSounds(base, { nomor, prefix, loket }) {
  const suara = []
  const url = (name) => `${base}/display/sounds_jelek/${name}`

  suara.push(url('tingtong.mp3'))
  suara.push(url('nomorantrian.mp3'))

  if (prefix) suara.push(url(`${prefix}.mp3`))

  const n = parseInt(nomor, 10)

  if (n <= 9) {
    suara.push(url(`${n}.mp3`))
  } else if (n === 10) {
    suara.push(url('10.mp3'))
  } else if (n === 11) {
    suara.push(url('11.mp3'))
  } else if (n >= 12 && n <= 19) {
    const satuan = String(n).slice(1)
    suara.push(url(`${satuan}.mp3`))
    suara.push(url('belas.mp3'))
  } else if (n >= 20 && n <= 99) {
    const s = String(n)
    const puluhan = s.charAt(0)
    const satuan = s.charAt(1)
    suara.push(url(`${puluhan}.mp3`))
    suara.push(url('puluh.mp3'))
    if (satuan !== '0') suara.push(url(`${satuan}.mp3`))
  }

  suara.push(url('keloket.mp3'))

  if (loket) {
    const nomorLoket = String(loket).replace(/\D/g, '')
    if (nomorLoket) suara.push(url(`${nomorLoket}.mp3`))
  }

  return suara
}

/** Putar daftar file suara berurutan menggunakan satu elemen <audio> yang sudah ada di DOM. */
export function playQueue(audioEl, sounds) {
  let index = 0

  function playNext() {
    if (index >= sounds.length) return
    audioEl.pause()
    audioEl.currentTime = 0
    audioEl.src = sounds[index]
    audioEl.play().catch((err) => console.warn('Gagal memutar suara:', err))
    audioEl.onended = () => {
      index++
      playNext()
    }
  }

  playNext()
}
