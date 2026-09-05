<?php
require __DIR__ . '/config.php';

// Daftar jenis pasien (tombol) yang aktif, dipakai layar "ambil nomor" dan layar "loket"
$sql = "SELECT TombolID, Nama, Prefix FROM tombol WHERE NA = 'N' ORDER BY Nama";
$res = mysqli_query($conn, $sql);
if (!$res) json_error(mysqli_error($conn), 500);

$list = [];
while ($row = mysqli_fetch_assoc($res)) {
  $list[] = $row;
}

json_ok(["tombol" => $list]);
