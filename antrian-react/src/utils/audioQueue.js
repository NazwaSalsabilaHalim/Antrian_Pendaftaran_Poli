import { publicUrl } from './publicUrl'

/**
 * Menyusun daftar file suara:
 * ting-tong → nomor antrian → prefix → angka → ke loket → nomor loket
 */
export function buildAntrianSounds({ nomor, prefix, loket }) {
  const suara = []

  const url = (name) => publicUrl(`sounds_jelek/${name}`)

  suara.push(url('tingtong.mp3'))
  suara.push(url('nomorantrian.mp3'))

  if (prefix) {
    suara.push(url(`${prefix}.mp3`))
  }

  const n = parseInt(nomor, 10)

  if (n >= 0 && n <= 11) {
    suara.push(url(`${n}.mp3`))

  } else if (n >= 12 && n <= 19) {
    const satuan = n % 10

    if (satuan !== 0) {
      suara.push(url(`${satuan}.mp3`))
    }

    suara.push(url('belas.mp3'))

  } else if (n >= 20 && n <= 99) {
    const puluhan = Math.floor(n / 10)
    const satuan = n % 10

    suara.push(url(`${puluhan}.mp3`))
    suara.push(url('puluh.mp3'))

    if (satuan !== 0) {
      suara.push(url(`${satuan}.mp3`))
    }
  }

  suara.push(url('keloket.mp3'))

  if (loket) {
    const nomorLoket = String(loket).replace(/\D/g, '')

    if (nomorLoket) {
      suara.push(url(`${nomorLoket}.mp3`))
    }
  }

  return suara
}

export function playQueue(audioEl, sounds) {
  if (!audioEl || !sounds?.length) {
    return
  }

  let index = 0

  const playNext = async () => {
    if (index >= sounds.length) {
      audioEl.onended = null
      return
    }

    const currentSound = sounds[index]

    audioEl.pause()
    audioEl.currentTime = 0
    audioEl.src = currentSound
    audioEl.load()

    try {
      await audioEl.play()

      audioEl.onended = () => {
        index++
        playNext()
      }

    } catch (err) {
      console.error('Gagal memutar suara:', currentSound, err)
      audioEl.onended = null
    }
  }

  playNext()
}