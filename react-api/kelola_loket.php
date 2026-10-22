<?php
require __DIR__ . '/config.php';
require __DIR__ . '/activity_helper.php';
require_once __DIR__ . '/loket_helper.php';

mysqli_report(MYSQLI_REPORT_OFF);

function nama_loket_dipakai($conn, $nama, $kecualiCounterId = '') {
  $stmt = mysqli_prepare($conn, "SELECT 1 FROM counter WHERE Nama = ? AND CounterID <> ? LIMIT 1");
  mysqli_stmt_bind_param($stmt, "ss", $nama, $kecualiCounterId);
  mysqli_stmt_execute($stmt);
  return mysqli_num_rows(mysqli_stmt_get_result($stmt)) > 0;
}

$method = $_SERVER['REQUEST_METHOD'];

/*
|--------------------------------------------------------------------------
| GET: daftar semua loket
|--------------------------------------------------------------------------
*/
if ($method === 'GET') {
  $res = mysqli_query($conn, "SELECT CounterID, Nama, NA FROM counter ORDER BY ID");

  $data = [];
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = [
      "counter_id" => $row['CounterID'],
      "nama"       => $row['Nama'],
      "status"     => $row['NA'] === 'Y' ? 'Tidak Aktif' : 'Aktif',
    ];
  }

  json_ok(["loket" => $data]);
}

if ($method === 'POST') {
  $action = input('action', 'update');

  /*
  |------------------------------------------------------------------------
  | CREATE
  |------------------------------------------------------------------------
  */
  if ($action === 'create') {
    $nama   = trim((string) input('nama', ''));
    $status = input('status', 'Aktif');

    if ($nama === '') json_error("Nama loket wajib diisi.");
    if (mb_strlen($nama) > 50) json_error("Nama loket maksimal 50 karakter.");
    if (nama_loket_dipakai($conn, $nama)) json_error("Nama loket sudah dipakai.");

    $na = ($status === 'Tidak Aktif') ? 'Y' : 'N';

    // CounterID baru = angka terbesar di counter DAN riwayat panggil + 1,
    // supaya tidak bentrok dengan riwayat loket lama (mis. C3 yang pernah ada)
    $res = mysqli_query(
      $conn,
      "SELECT GREATEST(
         COALESCE((SELECT MAX(CAST(SUBSTRING(CounterID, 2) AS UNSIGNED)) FROM counter), 0),
         COALESCE((SELECT MAX(CAST(SUBSTRING(CounterID, 2) AS UNSIGNED)) FROM panggil), 0)
       ) AS maks"
    );
    $maks      = (int) mysqli_fetch_assoc($res)['maks'];
    $counterId = 'C' . ($maks + 1);

    $stmt = mysqli_prepare(
      $conn,
      "INSERT INTO counter (CounterID, Nama, TombolID, Prefix, Display, TGL, Progress, Play, NA)
       VALUES (?, ?, '', '', 1, CURDATE(), 0, 'N', ?)"
    );
    mysqli_stmt_bind_param($stmt, "sss", $counterId, $nama, $na);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal menambah loket: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Menambah loket $counterId ($nama)");
    json_ok(["counter_id" => $counterId]);
  }

  /*
  |------------------------------------------------------------------------
  | UPDATE (nama + status)
  |------------------------------------------------------------------------
  */
  if ($action === 'update') {
    $counterId = trim((string) input('counter_id', ''));
    $nama      = trim((string) input('nama', ''));
    $status    = input('status', 'Aktif');

    if ($counterId === '') json_error("Counter ID wajib diisi.");
    if ($nama === '') json_error("Nama loket wajib diisi.");
    if (mb_strlen($nama) > 50) json_error("Nama loket maksimal 50 karakter.");

    $loket = ambil_loket($conn, $counterId);
    if (!$loket) json_error("Loket tidak ditemukan.", 404);

    if (nama_loket_dipakai($conn, $nama, $counterId)) json_error("Nama loket sudah dipakai.");

    $na = ($status === 'Tidak Aktif') ? 'Y' : 'N';

    if ($na === 'Y' && (int) $loket['dipakai'] === 1) {
      json_error("Loket sedang dipakai {$loket['petugas_nama']}, tidak bisa dinonaktifkan.");
    }

    $stmt = mysqli_prepare($conn, "UPDATE counter SET Nama = ?, NA = ? WHERE CounterID = ?");
    mysqli_stmt_bind_param($stmt, "sss", $nama, $na, $counterId);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal mengubah loket: " . mysqli_error($conn));
    }

    // loket nonaktif: bersihkan sisa sesi lama (yang sudah kedaluwarsa)
    if ($na === 'Y') {
      $stmt = mysqli_prepare($conn, "DELETE FROM sesi_loket WHERE counter_id = ?");
      mysqli_stmt_bind_param($stmt, "s", $counterId);
      mysqli_stmt_execute($stmt);
    }

    catat_aktivitas($conn, "Admin IT", "Mengubah loket $counterId (nama: $nama, status: $status)");
    json_ok();
  }

  /*
  |------------------------------------------------------------------------
  | DELETE
  |------------------------------------------------------------------------
  */
  if ($action === 'delete') {
    $counterId = trim((string) input('counter_id', ''));
    if ($counterId === '') json_error("Counter ID wajib diisi.");

    $loket = ambil_loket($conn, $counterId);
    if (!$loket) json_error("Loket tidak ditemukan.", 404);

    if ((int) $loket['dipakai'] === 1) {
      json_error("Loket sedang dipakai {$loket['petugas_nama']}, tidak bisa dihapus.");
    }

    $stmt = mysqli_prepare($conn, "DELETE FROM counter WHERE CounterID = ?");
    mysqli_stmt_bind_param($stmt, "s", $counterId);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal menghapus loket: " . mysqli_error($conn));
    }

    // bersihkan sisa sesi loket ini
    $stmt = mysqli_prepare($conn, "DELETE FROM sesi_loket WHERE counter_id = ?");
    mysqli_stmt_bind_param($stmt, "s", $counterId);
    mysqli_stmt_execute($stmt);

    catat_aktivitas($conn, "Admin IT", "Menghapus loket $counterId ({$loket['Nama']})");
    json_ok();
  }

  json_error("Action tidak dikenali.");
}

json_error("Method tidak didukung.", 405);