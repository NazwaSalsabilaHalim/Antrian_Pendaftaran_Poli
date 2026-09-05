<?php
require __DIR__ . '/config.php';

$tgl = input('tanggal', date('Y-m-d')); // boleh override ?tanggal=YYYY-MM-DD untuk lihat histori

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tgl)) json_error('Format tanggal harus YYYY-MM-DD');

// Ringkasan per jenis pasien: total nomor dicetak vs total sudah dipanggil vs sisa
$sql = "SELECT a.TombolID, b.Nama, b.Prefix, a.Nomer AS total_dicetak, a.Progress AS total_dipanggil
        FROM log_daftar a
        LEFT JOIN tombol b ON a.TombolID = b.TombolID
        WHERE a.TGL = ?
        ORDER BY b.Nama";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$perTombol = [];
$totalDicetak = 0;
$totalDipanggil = 0;
while ($row = mysqli_fetch_assoc($res)) {
  $sisa = $row['total_dicetak'] - $row['total_dipanggil'];
  $perTombol[] = [
    "tombol_id"       => $row['TombolID'],
    "nama"            => $row['Nama'] ?? $row['TombolID'],
    "prefix"          => $row['Prefix'],
    "total_dicetak"   => (int) $row['total_dicetak'],
    "total_dipanggil" => (int) $row['total_dipanggil'],
    "sisa"            => (int) $sisa,
  ];
  $totalDicetak   += (int) $row['total_dicetak'];
  $totalDipanggil += (int) $row['total_dipanggil'];
}

// Ringkasan per loket: berapa nomor yang sudah dilayani hari itu
$sql = "SELECT c.CounterID, c.Nama, COUNT(p.ID) AS total_dilayani
        FROM counter c
        LEFT JOIN panggil p ON p.CounterID = c.CounterID AND p.Tgl = ? AND p.Panggil = 'Y'
        WHERE c.NA = 'N'
        GROUP BY c.CounterID, c.Nama
        ORDER BY c.CounterID";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$perCounter = [];
while ($row = mysqli_fetch_assoc($res)) {
  $perCounter[] = [
    "counter_id"     => $row['CounterID'],
    "nama"           => $row['Nama'],
    "total_dilayani" => (int) $row['total_dilayani'],
  ];
}

json_ok([
  "tanggal"          => $tgl,
  "total_dicetak"    => $totalDicetak,
  "total_dipanggil"  => $totalDipanggil,
  "sisa"             => $totalDicetak - $totalDipanggil,
  "per_tombol"       => $perTombol,
  "per_counter"      => $perCounter,
]);
