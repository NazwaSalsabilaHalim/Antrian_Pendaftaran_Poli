<?php
require __DIR__ . '/config.php';

// // --- DEBUG TIMER (hapus nanti) ---
// $laps = [];
// $__t = microtime(true);
// function lap($label) {
//   global $laps, $__t;
//   $laps[$label] = round((microtime(true) - $__t) * 1000) . ' ms';
//   $__t = microtime(true);
// }
// // ---------------------------------

function format_tanggal_indo($datetime) {
  $bulan = [
    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
    5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
    9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
  ];
  $ts = strtotime($datetime);
  return date('j', $ts) . ' ' . $bulan[(int) date('n', $ts)] . ' ' . date('Y', $ts);
}

$tgl = date('Y-m-d');
// lap('Setup');

// Antrian menunggu hari ini = total (Nomer - Progress) semua jenis pendaftaran
$stmt = mysqli_prepare($conn, "SELECT COALESCE(SUM(GREATEST(Nomer - Progress, 0)), 0) AS total FROM log_daftar WHERE TGL = ?");
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$menunggu = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['total'];
// lap('Q1_menunggu');

// Sedang dilayani (perkiraan) = jumlah loket yang sudah memanggil nomor hari ini
$stmt = mysqli_prepare($conn, "SELECT COUNT(DISTINCT CounterID) AS total FROM panggil WHERE Tgl = ?");
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$dilayani = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['total'];
// lap('Q2_dilayani');

// Petugas aktif
$petugasAktif = (int) mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM users WHERE role = 'petugas' AND status = 'aktif'"))['total'];
// lap('Q3_petugas');

// Loket aktif
$loketAktif = (int) mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM counter WHERE NA = 'N'"))['total'];
// lap('Q4_loket');

// Status tiap loket = semua loket aktif + petugas yang sedang memakainya + panggilan terakhir hari ini
require_once __DIR__ . '/loket_helper.php';
$sqlDipakai = sql_loket_dipakai('s');

$sql = "SELECT c.CounterID, c.Nama AS counter_nama, u.nama AS petugas_nama,
               $sqlDipakai AS dipakai,
               (SELECT CONCAT(p.Prefix, p.Nomor)
                FROM panggil p
                WHERE p.Tgl = ? AND p.CounterID = c.CounterID
                ORDER BY p.TanggalPanggil DESC
                LIMIT 1) AS antrian
        FROM counter c
        LEFT JOIN sesi_loket s ON s.counter_id = c.CounterID
        LEFT JOIN users u ON u.id = s.user_id
        WHERE c.NA = 'N'
        ORDER BY c.ID";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$statusLoket = [];
while ($r = mysqli_fetch_assoc($res)) {
  $dipakai = (int) $r['dipakai'] === 1;

  $statusLoket[] = [
    "loket"   => $r['counter_nama'],
    "petugas" => $dipakai ? $r['petugas_nama'] : '-',
    "status"  => $dipakai ? 'Aktif' : 'Tidak Aktif',
    "antrian" => $r['antrian'] ?: '-',
  ];
}
// lap('Q5_status_loket');

// Aktivitas terbaru dari panggilan (5 terakhir, semua tanggal)
$sql = "SELECT p.CounterID, c.Nama AS counter_nama, p.Prefix, p.Nomor, p.TanggalPanggil
        FROM (
          SELECT CounterID, Prefix, Nomor, TanggalPanggil
          FROM panggil
          ORDER BY TanggalPanggil DESC
          LIMIT 5
        ) p
        LEFT JOIN counter c ON c.CounterID = p.CounterID
        ORDER BY p.TanggalPanggil DESC";
$res = mysqli_query($conn, $sql);

$aktivitas = [];
while ($r = mysqli_fetch_assoc($res)) {
  $aktivitas[] = [
    "text" => ($r['counter_nama'] ?? $r['CounterID']) . " memanggil " . $r['Prefix'] . $r['Nomor'],
    "time" => date('H:i', strtotime($r['TanggalPanggil'])),
    "date" => format_tanggal_indo($r['TanggalPanggil']),
  ];
}
// lap('Q6_aktivitas');

json_ok([
  "stat" => [
    "menunggu"      => $menunggu,
    "dilayani"      => $dilayani,
    "petugas_aktif" => $petugasAktif,
    "loket_aktif"   => $loketAktif,
  ],
  "status_loket" => $statusLoket,
  "aktivitas"    => $aktivitas,
  // "debug"        => $laps,
]);