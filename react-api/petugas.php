<?php
require __DIR__ . '/config.php';
require __DIR__ . '/activity_helper.php';

mysqli_report(MYSQLI_REPORT_OFF);

const ROLE_BOLEH = ['petugas', 'nurse'];

// DB: aktif/nonaktif  <->  Frontend: Aktif/Tidak Aktif
function status_ke_db($s) {
  return strtolower(trim((string) $s)) === 'aktif' ? 'aktif' : 'nonaktif';
}
function status_ke_ui($s) {
  return $s === 'aktif' ? 'Aktif' : 'Tidak Aktif';
}
function role_valid($r) {
  return in_array($r, ROLE_BOLEH, true) ? $r : 'petugas';
}
function pesan_gagal($conn, $aksi) {
  if (mysqli_errno($conn) === 1062) {
    return "Username sudah dipakai akun lain.";
  }
  return "Gagal $aksi: " . mysqli_error($conn);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $role = role_valid($_GET['role'] ?? 'petugas');

  $stmt = mysqli_prepare($conn, "SELECT id, nama, username, role, status, hak_akses FROM users WHERE role = ? ORDER BY nama");
  mysqli_stmt_bind_param($stmt, "s", $role);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);

  $data = [];
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = [
      "id"        => (int) $row['id'],
      "nama"      => $row['nama'],
      "username"  => $row['username'],
      "role"      => $row['role'],
      "status"    => status_ke_ui($row['status']),
      "hak_akses" => json_decode($row['hak_akses'] ?? '', true) ?: new stdClass(),
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
    $status   = status_ke_db(input('status', 'Aktif'));
    $role     = role_valid(input('role', 'petugas'));

    if ($nama === '' || $username === '' || $password === '') {
      json_error("Nama, username, dan password wajib diisi.");
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = mysqli_prepare($conn, "INSERT INTO users (nama, username, password, role, status) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "sssss", $nama, $username, $hash, $role, $status);

    if (!mysqli_stmt_execute($stmt)) {
      json_error(pesan_gagal($conn, "menambah akun"));
    }

    catat_aktivitas($conn, "Admin IT", "Menambah $role: $nama");
    json_ok(["id" => mysqli_insert_id($conn)]);
  }

  if ($action === 'update' || $action === 'edit') {
    $id       = (int) input('id');
    $nama     = trim((string) input('nama', ''));
    $username = trim((string) input('username', ''));
    $password = (string) input('password', '');
    $status   = status_ke_db(input('status', 'Aktif'));

    if (!$id || $nama === '' || $username === '') {
      json_error("Data akun tidak lengkap.");
    }

    // Admin tidak boleh diubah lewat endpoint ini
    if ($password !== '') {
      $hash = password_hash($password, PASSWORD_DEFAULT);
      $stmt = mysqli_prepare($conn, "UPDATE users SET nama=?, username=?, password=?, status=? WHERE id=? AND role IN ('petugas','nurse')");
      mysqli_stmt_bind_param($stmt, "ssssi", $nama, $username, $hash, $status, $id);
    } else {
      $stmt = mysqli_prepare($conn, "UPDATE users SET nama=?, username=?, status=? WHERE id=? AND role IN ('petugas','nurse')");
      mysqli_stmt_bind_param($stmt, "sssi", $nama, $username, $status, $id);
    }

    if (!mysqli_stmt_execute($stmt)) {
      json_error(pesan_gagal($conn, "mengubah akun"));
    }

    catat_aktivitas($conn, "Admin IT", "Mengubah data akun: $nama");
    json_ok();
  }

  if ($action === 'delete') {
    $id = (int) input('id');
    if (!$id) json_error("ID akun tidak valid.");

    $stmt = mysqli_prepare($conn, "SELECT nama FROM users WHERE id = ? AND role IN ('petugas','nurse')");
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    if (!$row) json_error("Akun tidak ditemukan.");
    $nama = $row['nama'];

    $stmt = mysqli_prepare($conn, "DELETE FROM users WHERE id = ? AND role IN ('petugas','nurse')");
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (!mysqli_stmt_execute($stmt)) {
      json_error(pesan_gagal($conn, "menghapus akun"));
    }

    catat_aktivitas($conn, "Admin IT", "Menghapus akun: $nama");
    json_ok();
  }

  if ($action === 'set_hak_akses') {
    $id   = (int) input('id');
    $izin = input('hak_akses', []);
    if (!$id) json_error("ID akun tidak valid.");

    $bersih = [];
    foreach (['dokter_tambah', 'dokter_edit', 'dokter_hapus', 'antrean_kosongkan'] as $k) {
      $bersih[$k] = !empty($izin[$k]);
    }
    $json = json_encode($bersih);

    $stmt = mysqli_prepare($conn, "UPDATE users SET hak_akses = ? WHERE id = ? AND role = 'nurse'");
    mysqli_stmt_bind_param($stmt, "si", $json, $id);

    if (!mysqli_stmt_execute($stmt)) {
      json_error(pesan_gagal($conn, "menyimpan hak akses"));
    }

    catat_aktivitas($conn, "Admin IT", "Mengubah hak akses nurse ID $id");
    json_ok();
  }

  json_error("Action tidak dikenali.");
}

json_error("Method tidak didukung.", 405);