<?php
require __DIR__ . '/config.php';

$panggilId = (int) input('panggil_id', 0);
if ($panggilId <= 0) json_error('panggil_id wajib diisi');

$stmt = mysqli_prepare($conn, "SELECT ID, Nomor, Prefix, CounterID FROM panggil WHERE ID = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "i", $panggilId);
mysqli_stmt_execute($stmt);
$row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

if (!$row) json_ok(["found" => false]);

$stmt = mysqli_prepare($conn, "UPDATE panggil SET Panggil = 'Y', TanggalPanggil = NOW(), PanggilUlang = 'N' WHERE ID = ?");
mysqli_stmt_bind_param($stmt, "i", $panggilId);
mysqli_stmt_execute($stmt);

json_ok([
  "found"      => true,
  "nomor"      => (int) $row['Nomor'],
  "prefix"     => $row['Prefix'],
  "counter_id" => $row['CounterID'],
]);
