<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method harus POST', 405);

$tombolId = trim((string) input('tombol_id', ''));
if ($tombolId === '') json_error('tombol_id wajib diisi');

// Ambil data tombol (nama + prefix), sekaligus pastikan tombol memang aktif
$stmt = mysqli_prepare($conn, "SELECT TombolID, Nama, Prefix FROM tombol WHERE TombolID = ? AND NA = 'N' LIMIT 1");
mysqli_stmt_bind_param($stmt, "s", $tombolId);
mysqli_stmt_execute($stmt);
$tombol = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
if (!$tombol) json_error('Jenis pasien tidak ditemukan / tidak aktif', 404);

$tgl = date('Y-m-d');

// Pakai transaksi + lock baris supaya dua tekan bersamaan tidak dapat nomor sama
mysqli_begin_transaction($conn);
try {
  $stmt = mysqli_prepare($conn, "SELECT LogID, Nomer FROM log_daftar WHERE TGL = ? AND TombolID = ? FOR UPDATE");
  mysqli_stmt_bind_param($stmt, "ss", $tgl, $tombolId);
  mysqli_stmt_execute($stmt);
  $log = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

  if (!$log) {
    $nomorBaru = 1;
    $stmt = mysqli_prepare($conn, "INSERT INTO log_daftar (TGL, TombolID, Nomer) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "ssi", $tgl, $tombolId, $nomorBaru);
    mysqli_stmt_execute($stmt);
  } else {
    $nomorBaru = $log['Nomer'] + 1;
    $stmt = mysqli_prepare($conn, "UPDATE log_daftar SET Nomer = ? WHERE LogID = ?");
    mysqli_stmt_bind_param($stmt, "ii", $nomorBaru, $log['LogID']);
    mysqli_stmt_execute($stmt);
  }

  mysqli_commit($conn);
} catch (Throwable $e) {
  mysqli_rollback($conn);
  json_error('Gagal mengambil nomor antrian: ' . $e->getMessage(), 500);
}

$prefix = $tombol['Prefix'];

json_ok([
  "tombol_id"     => $tombol['TombolID'],
  "tombol_nama"   => $tombol['Nama'],
  "prefix"        => $prefix,
  "nomor"         => $nomorBaru,
  "nomor_display" => $prefix . $nomorBaru,
]);
