<?php
require __DIR__ . '/config.php';

$tgl = date('Y-m-d');

// 1) Cari antrian hari ini yang BELUM diumumkan, paling lama dulu
$sql = "SELECT ID, CounterID, Nomor, Prefix, PanggilUlang
        FROM panggil
        WHERE Tgl = ? AND Display = 1 AND Panggil = 'N'
        ORDER BY TanggalInsert, Nomor LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$queue = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

if ($queue) {
  $stmt = mysqli_prepare($conn, "SELECT Nama FROM counter WHERE CounterID = ? AND NA = 'N' LIMIT 1");
  mysqli_stmt_bind_param($stmt, "s", $queue['CounterID']);
  mysqli_stmt_execute($stmt);
  $counter = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

  json_ok([
    "panggil_id"    => (int) $queue['ID'],
    "counter_id"    => $queue['CounterID'],
    "counter_nama"  => $counter['Nama'] ?? $queue['CounterID'],
    "nomor"         => $queue['Prefix'] . str_pad($queue['Nomor'], 3, '0', STR_PAD_LEFT),
    "panggil_ulang" => $queue['PanggilUlang'] === 'Y',
  ]);
}

// 2) Kalau tidak ada yang pending, tampilkan nomor terakhir yang sudah dipanggil (biar layar tidak kosong)
$sql = "SELECT p.ID, p.CounterID, p.Nomor, c.Nama, p.Prefix, p.PanggilUlang
        FROM panggil p
        LEFT JOIN counter c USING (CounterID)
        WHERE p.Tgl = ? AND p.Panggil = 'Y'
        ORDER BY p.TanggalPanggil DESC LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$last = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

if (!$last) {
  json_ok(["panggil_id" => null, "counter_id" => null, "counter_nama" => null, "nomor" => null, "panggil_ulang" => false]);
}

json_ok([
  "panggil_id"    => (int) $last['ID'],
  "counter_id"    => $last['CounterID'],
  "counter_nama"  => $last['Nama'],
  "nomor"         => $last['Prefix'] . str_pad($last['Nomor'], 3, '0', STR_PAD_LEFT),
  "panggil_ulang" => $last['PanggilUlang'] === 'Y',
]);
