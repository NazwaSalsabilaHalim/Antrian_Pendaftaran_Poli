<?php
require __DIR__ . '/config.php';
require __DIR__ . '/activity_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $res = mysqli_query($conn, "SELECT * FROM konfigurasi_antrian ORDER BY id DESC LIMIT 1");
  $row = mysqli_fetch_assoc($res);

  if (!$row) {
    json_ok(["konfigurasi" => [
      "nomor_awal"     => 1,
      "nomor_maksimal" => 999,
      "reset_nomor"    => "daily",
      "aktif"          => "yes",
    ]]);
  }

  json_ok(["konfigurasi" => [
    "nomor_awal"     => (int) $row['nomor_awal'],
    "nomor_maksimal" => (int) $row['nomor_maksimal'],
    "reset_nomor"    => $row['reset_nomor'],
    "aktif"          => $row['aktif'],
  ]]);
}

if ($method === 'POST') {
  $nomor_awal     = (int) input('nomor_awal', 1);
  $nomor_maksimal = (int) input('nomor_maksimal', 999);
  $reset_nomor    = input('reset_nomor', 'daily');
  $aktif          = input('aktif', 'yes');

  $existing = mysqli_fetch_assoc(mysqli_query($conn, "SELECT id FROM konfigurasi_antrian ORDER BY id DESC LIMIT 1"));

  if ($existing) {
    $sql  = "UPDATE konfigurasi_antrian SET nomor_awal=?, nomor_maksimal=?, reset_nomor=?, aktif=? WHERE id=?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iissi", $nomor_awal, $nomor_maksimal, $reset_nomor, $aktif, $existing['id']);
  } else {
    $sql  = "INSERT INTO konfigurasi_antrian (nomor_awal, nomor_maksimal, reset_nomor, aktif) VALUES (?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iiss", $nomor_awal, $nomor_maksimal, $reset_nomor, $aktif);
  }

  if (!mysqli_stmt_execute($stmt)) {
    json_error("Gagal menyimpan konfigurasi: " . mysqli_error($conn));
  }

  catat_aktivitas($conn, "Admin IT", "Mengubah konfigurasi antrian");
  json_ok();
}

json_error("Method tidak didukung.", 405);
