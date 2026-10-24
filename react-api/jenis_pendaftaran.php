<?php
require __DIR__ . '/config.php';
require __DIR__ . '/activity_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $sql = "SELECT TombolID, Nama, Prefix, NA FROM tombol ORDER BY TombolID";
  $res = mysqli_query($conn, $sql);

  $data = [];
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = [
      "tombol_id" => $row['TombolID'],
      "nama"      => $row['Nama'],
      "prefix"    => $row['Prefix'],
      "status"    => $row['NA'] === 'Y' ? 'Tidak Aktif' : 'Aktif',
    ];
  }

  json_ok(["jenis" => $data]);
}

if ($method === 'POST') {
  $action = input('action');

  if ($action === 'create') {
    $tombol_id = trim((string) input('tombol_id', ''));
    $nama      = trim((string) input('nama', ''));
    $prefix    = trim((string) input('prefix', ''));
    $status    = input('status', 'Aktif');

    if ($tombol_id === '' || $nama === '') {
      json_error("Kode dan nama jenis pendaftaran wajib diisi.");
    }

    $na = ($status === 'Tidak Aktif') ? 'Y' : 'N';

    $sql  = "INSERT INTO tombol (TombolID, Nama, Prefix, NA) VALUES (?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssss", $tombol_id, $nama, $prefix, $na);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal menambah jenis pendaftaran: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Menambah jenis pendaftaran: $nama ($tombol_id)");
    json_ok();
  }

  if ($action === 'update' || $action === 'edit') {
    $tombol_id = trim((string) input('tombol_id', ''));
    $nama      = trim((string) input('nama', ''));
    $prefix    = trim((string) input('prefix', ''));
    $status    = input('status', 'Aktif');

    if ($tombol_id === '' || $nama === '') {
      json_error("Kode dan nama jenis pendaftaran wajib diisi.");
    }

    $na = ($status === 'Tidak Aktif') ? 'Y' : 'N';

    $sql  = "UPDATE tombol SET Nama = ?, Prefix = ?, NA = ? WHERE TombolID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssss", $nama, $prefix, $na, $tombol_id);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal mengubah jenis pendaftaran: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Mengubah jenis pendaftaran: $nama ($tombol_id)");
    json_ok();
  }

  if ($action === 'delete') {
    $tombol_id = trim((string) input('tombol_id', ''));
    if ($tombol_id === '') json_error("Kode jenis pendaftaran tidak valid.");

    $sql  = "DELETE FROM tombol WHERE TombolID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $tombol_id);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal menghapus jenis pendaftaran: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Menghapus jenis pendaftaran: $tombol_id");
    json_ok();
  }

  json_error("Action tidak dikenali.");
}

json_error("Method tidak didukung.", 405);
