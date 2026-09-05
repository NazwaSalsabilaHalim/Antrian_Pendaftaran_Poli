<?php
require __DIR__ . '/config.php';

$tgl = date('Y-m-d');

// "Sedang dilayani" = panggilan TERAKHIR hari ini per counter (yang sudah diumumkan)
$sql = "SELECT p.CounterID, c.Nama AS counter_nama, p.Prefix, p.Nomor, p.Nama AS tombol_nama, p.TanggalPanggil
        FROM panggil p
        INNER JOIN (
          SELECT CounterID, MAX(TanggalPanggil) AS terakhir
          FROM panggil
          WHERE Tgl = ? AND Panggil = 'Y'
          GROUP BY CounterID
        ) terbaru ON terbaru.CounterID = p.CounterID AND terbaru.terakhir = p.TanggalPanggil
        LEFT JOIN counter c ON c.CounterID = p.CounterID
        WHERE p.Tgl = ?
        ORDER BY p.TanggalPanggil DESC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ss", $tgl, $tgl);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$serving = [];
while ($row = mysqli_fetch_assoc($res)) {
  $serving[] = [
    "counter_id"      => $row['CounterID'],
    "counter_nama"    => $row['counter_nama'] ?? $row['CounterID'],
    "tombol_nama"     => $row['tombol_nama'],
    "nomor_display"   => $row['Prefix'] . $row['Nomor'],
    "dipanggil_pukul" => date('H:i', strtotime($row['TanggalPanggil'])),
  ];
}

// "Menunggu" = sisa nomor yang belum dipanggil per jenis pasien, ambil beberapa nomor berikutnya
$sql = "SELECT ld.TombolID, t.Nama, t.Prefix, ld.Nomer, ld.Progress
        FROM log_daftar ld
        LEFT JOIN tombol t ON t.TombolID = ld.TombolID
        WHERE ld.TGL = ?
        ORDER BY t.Nama";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $tgl);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$waiting = [];
while ($row = mysqli_fetch_assoc($res)) {
  $sisa = max(0, $row['Nomer'] - $row['Progress']);
  $nextNumbers = [];
  for ($i = $row['Progress'] + 1; $i <= $row['Nomer'] && count($nextNumbers) < 5; $i++) {
    $nextNumbers[] = $row['Prefix'] . $i;
  }
  $waiting[] = [
    "tombol_id"    => $row['TombolID'],
    "nama"         => $row['Nama'] ?? $row['TombolID'],
    "total_tunggu" => $sisa,
    "nomor_berikut" => $nextNumbers,
  ];
}

json_ok(["serving" => $serving, "waiting" => $waiting]);
