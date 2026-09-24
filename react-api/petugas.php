<?php
require __DIR__ . '/config.php';
require __DIR__ . '/activity_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $sql = "SELECT id, nama, username, status FROM petugas ORDER BY nama";
  $res = mysqli_query($conn, $sql);

  $data = [];
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = [
      "id"       => (int) $row['id'],
      "nama"     => $row['nama'],
      "username" => $row['username'],
      "status"   => $row['status'],
    ];
  }

  json_ok(["petugas" => $data]);
}

if ($method === 'POST') {
  $action = input('action');

  if ($action === 'create') {
    $nama     = trim((string) input('nama', ''));
    $username = trim((string) input('username', ''));
    $password = (string) input('password', '');
    $status   = input('status', 'Aktif');

    if ($nama === '' || $username === '' || $password === '') {
      json_error("Nama, username, dan password wajib diisi.");
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $sql  = "INSERT INTO petugas (nama, username, password, status) VALUES (?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssss", $nama, $username, $hash, $status);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal menambah petugas: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Menambah petugas: $nama");
    json_ok(["id" => mysqli_insert_id($conn)]);
  }

  if ($action === 'update') {
    $id       = (int) input('id');
    $nama     = trim((string) input('nama', ''));
    $username = trim((string) input('username', ''));
    $password = (string) input('password', '');
    $status   = input('status', 'Aktif');

    if (!$id || $nama === '' || $username === '') {
      json_error("Data petugas tidak lengkap.");
    }

    if ($password !== '') {
      $hash = password_hash($password, PASSWORD_DEFAULT);
      $sql  = "UPDATE petugas SET nama=?, username=?, password=?, status=? WHERE id=?";
      $stmt = mysqli_prepare($conn, $sql);
      mysqli_stmt_bind_param($stmt, "ssssi", $nama, $username, $hash, $status, $id);
    } else {
      $sql  = "UPDATE petugas SET nama=?, username=?, status=? WHERE id=?";
      $stmt = mysqli_prepare($conn, $sql);
      mysqli_stmt_bind_param($stmt, "sssi", $nama, $username, $status, $id);
    }

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal mengubah petugas: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Mengubah data petugas: $nama");
    json_ok();
  }

  if ($action === 'delete') {
    $id = (int) input('id');
    if (!$id) json_error("ID petugas tidak valid.");

    $stmt = mysqli_prepare($conn, "SELECT nama FROM petugas WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $row  = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    $nama = $row['nama'] ?? "ID $id";

    $stmt = mysqli_prepare($conn, "DELETE FROM petugas WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal menghapus petugas: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Menghapus petugas: $nama");
    json_ok();
  }

  json_error("Action tidak dikenali.");
}

json_error("Method tidak didukung.", 405);