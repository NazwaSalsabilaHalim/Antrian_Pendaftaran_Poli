<?php
// Helper bersama untuk fitur "petugas memilih loket sendiri".
// Dipakai oleh: loket_pakai.php, counter.php, kelola_loket.php,
//               tekan_counter.php, ringkasan_it.php
//
// Data loket (nama, aktif/nonaktif)     -> tabel counter
// Siapa yang sedang memakai loket mana  -> tabel sesi_loket

// Sesi dianggap masih hidup kalau last_ping (dikirim Loket.jsx tiap 30 detik)
// belum lewat batas ini.
const LOKET_TIMEOUT_DETIK = 45;

// Potongan SQL: 1 kalau sesi masih hidup, 0 kalau tidak ada / sudah kedaluwarsa.
// $alias = alias tabel sesi_loket di query.
function sql_loket_dipakai($alias = 's') {
  $t = LOKET_TIMEOUT_DETIK;
  return "IFNULL($alias.last_ping >= NOW() - INTERVAL $t SECOND, 0)";
}

// Akun yang boleh memakai loket: petugas atau admin, status aktif.
// Mengembalikan baris user, atau null kalau tidak boleh.
function user_loket_valid($conn, $userId) {
  $userId = (int) $userId;
  if ($userId <= 0) return null;

  $stmt = mysqli_prepare($conn, "SELECT id, nama FROM users WHERE id = ? AND role IN ('petugas','admin') AND status = 'aktif' LIMIT 1");
  mysqli_stmt_bind_param($stmt, "i", $userId);
  mysqli_stmt_execute($stmt);
  return mysqli_fetch_assoc(mysqli_stmt_get_result($stmt)) ?: null;
}

// Data satu loket + pemegang sesinya.
// petugas_id / petugas_nama = pemegang sesi terakhir (bisa sudah kedaluwarsa),
// dipakai = 1 kalau sesinya masih hidup.
function ambil_loket($conn, $counterId) {
  $sqlDipakai = sql_loket_dipakai('s');

  $stmt = mysqli_prepare(
    $conn,
    "SELECT c.CounterID, c.Nama, c.Display, c.NA,
            s.user_id AS petugas_id,
            u.nama AS petugas_nama,
            $sqlDipakai AS dipakai
     FROM counter c
     LEFT JOIN sesi_loket s ON s.counter_id = c.CounterID
     LEFT JOIN users u ON u.id = s.user_id
     WHERE c.CounterID = ?
     LIMIT 1"
  );
  mysqli_stmt_bind_param($stmt, "s", $counterId);
  mysqli_stmt_execute($stmt);
  return mysqli_fetch_assoc(mysqli_stmt_get_result($stmt)) ?: null;
}
