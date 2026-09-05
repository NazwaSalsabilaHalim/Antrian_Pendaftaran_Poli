<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method harus POST', 405);

$panggilId = (int) input('panggil_id', 0);
if ($panggilId <= 0) json_error('panggil_id wajib diisi');

$stmt = mysqli_prepare($conn, "UPDATE panggil SET Panggil = 'N', PanggilUlang = 'Y', TanggalPanggil = NOW() WHERE ID = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "i", $panggilId);
$success = mysqli_stmt_execute($stmt);

if (!$success) json_error('Gagal memanggil ulang: ' . mysqli_error($conn), 500);

json_ok(["panggil_id" => $panggilId]);
