<?php
require __DIR__ . '/config.php';
require_once __DIR__ . '/loket_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method harus POST', 405);
}

$action    = (string) input('action', '');
$counterId = trim((string) input('counter_id', ''));
$userId    = (int) input('user_id', 0);

if ($counterId === '' || $userId <= 0) {
  json_error('counter_id dan user_id wajib diisi.');
}

/*
|--------------------------------------------------------------------------
| LEPAS  (logout / ganti loket) - boleh walau akun sudah nonaktif
|--------------------------------------------------------------------------
*/
if ($action === 'lepas') {
  $stmt = mysqli_prepare($conn, "DELETE FROM sesi_loket WHERE counter_id = ? AND user_id = ?");
  mysqli_stmt_bind_param($stmt, "si", $counterId, $userId);
  mysqli_stmt_execute($stmt);
  json_ok();
}

// Selain "lepas", akun harus aktif
if (!user_loket_valid($conn, $userId)) {
  json_error('Akun tidak aktif atau tidak boleh memakai loket.', 403);
}

/*
|--------------------------------------------------------------------------
| PING  (dikirim tiap 30 detik selama petugas di halaman Loket)
|--------------------------------------------------------------------------
*/
if ($action === 'ping') {
  $stmt = mysqli_prepare($conn, "UPDATE sesi_loket SET last_ping = NOW() WHERE counter_id = ? AND user_id = ?");
  mysqli_stmt_bind_param($stmt, "si", $counterId, $userId);
  mysqli_stmt_execute($stmt);

  $loket = ambil_loket($conn, $counterId);

  if (!$loket || (int) $loket['petugas_id'] !== $userId) {
    json_error('Loket ini sudah tidak kamu pakai.', 409);
  }

  json_ok();
}

/*
|--------------------------------------------------------------------------
| PILIH  (klaim loket)
|--------------------------------------------------------------------------
| Dalam satu transaksi:
|  1. lepas loket lain milik akun ini (satu akun = satu loket)
|  2. klaim loket ini: berhasil kalau kosong, milik akun ini,
|     atau pemakai lamanya sudah kedaluwarsa
|  3. cek hasilnya; kalau gagal, rollback (loket lama tidak hilang)
*/
if ($action === 'pilih') {
  $timeout = LOKET_TIMEOUT_DETIK;
  $gagal   = null;

  mysqli_begin_transaction($conn);

  try {
    $stmt = mysqli_prepare($conn, "DELETE FROM sesi_loket WHERE user_id = ? AND counter_id <> ?");
    mysqli_stmt_bind_param($stmt, "is", $userId, $counterId);
    mysqli_stmt_execute($stmt);

    $stmt = mysqli_prepare(
      $conn,
      "INSERT INTO sesi_loket (counter_id, user_id, last_ping)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         user_id   = IF(user_id = VALUES(user_id) OR last_ping < NOW() - INTERVAL $timeout SECOND, VALUES(user_id), user_id),
         last_ping = IF(user_id = VALUES(user_id), NOW(), last_ping)"
    );
    mysqli_stmt_bind_param($stmt, "si", $counterId, $userId);
    mysqli_stmt_execute($stmt);

    $loket = ambil_loket($conn, $counterId);

    if (!$loket || $loket['NA'] === 'Y') {
      $gagal = ['Counter tidak ditemukan / tidak aktif.', 404];
    } elseif ((int) $loket['petugas_id'] !== $userId) {
      $oleh  = $loket['petugas_nama'] ?: 'petugas lain';
      $gagal = ["Counter ini sedang dipakai $oleh.", 409];
    }

    if ($gagal) mysqli_rollback($conn);
    else mysqli_commit($conn);

  } catch (Throwable $e) {
    mysqli_rollback($conn);
    json_error('Gagal memilih loket: ' . $e->getMessage(), 500);
  }

  if ($gagal) json_error($gagal[0], $gagal[1]);

  json_ok(["counter_id" => $counterId]);
}

json_error('Action tidak dikenali.');
