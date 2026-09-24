<?php
require __DIR__ . '/config.php';

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

// Antrian menunggu hari ini = total (Nomer - Progress) semua jenis pendaftaran
$stmt = mysqli_prepare($conn, "SELECT COALESCE(SUM(GREATEST(Nomer - Progress, 0)), 0) AS total FROM log_daftar WHERE TGL = ?");
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$menunggu = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['total'];

// Sedang dilayani (perkiraan) = jumlah loket yang sudah memanggil nomor hari ini
$stmt = mysqli_prepare($conn, "SELECT COUNT(DISTINCT CounterID) AS total FROM panggil WHERE Tgl = ?");
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$dilayani = (int) mysqli_fetch_assoc(mysqli_stmt_get_result($stmt))['total'];

// Petugas aktif
$petugasAktif = (int) mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM petugas WHERE status = 'Aktif'"))['total'];

// Loket aktif
$loketAktif = (int) mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) AS total FROM counter WHERE NA = 'N'"))['total'];

// Status tiap loket = panggilan terakhir hari ini per counter
$sql = "SELECT p.CounterID, c.Nama AS counter_nama, c.petugas_nama, p.Prefix, p.Nomor
        FROM panggil p
        INNER JOIN (
          SELECT CounterID, MAX(TanggalPanggil) AS terakhir
          FROM panggil WHERE Tgl = ? GROUP BY CounterID
        ) t ON t.CounterID = p.CounterID AND t.terakhir = p.TanggalPanggil
        LEFT JOIN counter c ON c.CounterID = p.CounterID";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$statusLoket = [];
while ($r = mysqli_fetch_assoc($res)) {
  $statusLoket[] = [
    "loket"   => $r['counter_nama'] ?? $r['CounterID'],
    "petugas" => $r['petugas_nama'] ?: '-',
    "status"  => 'Aktif',
    "antrian" => $r['Prefix'] . $r['Nomor'],
  ];
}

// Aktivitas terbaru dari panggilan (5 terakhir, semua tanggal)
$sql = "SELECT p.CounterID, c.Nama AS counter_nama, p.Prefix, p.Nomor, p.TanggalPanggil
        FROM panggil p
        LEFT JOIN counter c ON c.CounterID = p.CounterID
        ORDER BY p.TanggalPanggil DESC
        LIMIT 5";
$res = mysqli_query($conn, $sql);

$aktivitas = [];
while ($r = mysqli_fetch_assoc($res)) {
  $aktivitas[] = [
    "text" => ($r['counter_nama'] ?? $r['CounterID']) . " memanggil " . $r['Prefix'] . $r['Nomor'],
    "time" => date('H:i', strtotime($r['TanggalPanggil'])),
    "date" => format_tanggal_indo($r['TanggalPanggil']),
  ];
}

json_ok([
  "stat" => [
    "menunggu"      => $menunggu,
    "dilayani"      => $dilayani,
    "petugas_aktif" => $petugasAktif,
    "loket_aktif"   => $loketAktif,
  ],
  "status_loket" => $statusLoket,
  "aktivitas"    => $aktivitas,
]);