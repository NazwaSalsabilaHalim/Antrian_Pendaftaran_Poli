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

$limit = (int) ($_GET['limit'] ?? 50);
if ($limit <= 0 || $limit > 200) $limit = 50;

$sql  = "SELECT waktu, pengguna, aktivitas FROM log_aktivitas ORDER BY waktu DESC LIMIT ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $limit);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$data = [];
while ($row = mysqli_fetch_assoc($res)) {
  $data[] = [
    "waktu"     => date('H:i', strtotime($row['waktu'])),
    "tanggal"   => format_tanggal_indo($row['waktu']),
    "pengguna"  => $row['pengguna'],
    "aktivitas" => $row['aktivitas'],
  ];
}

json_ok(["aktivitas" => $data]);