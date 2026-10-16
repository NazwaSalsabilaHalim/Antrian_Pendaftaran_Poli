// Dokter dianggap tidak aktif kalau statusnya terisi dan bukan "aktif"
export function isDokterNonaktif(doctor) {
  const label = String(doctor.NamaStatus ?? doctor.Status ?? '')
    .trim()
    .toLowerCase()

  return label !== '' && label !== 'aktif'
}

export function formatNomor(nomor) {
  return String(nomor ?? '').padStart(3, '0')
}