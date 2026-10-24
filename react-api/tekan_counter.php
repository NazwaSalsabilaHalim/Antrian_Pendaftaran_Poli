<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method harus POST', 405);
}

require_once __DIR__ . '/loket_helper.php';

$counterId = trim((string) input('counter_id', ''));
$tombolId  = trim((string) input('tombol_id', ''));
$userId    = (int) input('user_id', 0);

if ($counterId === '' || $tombolId === '') {
    json_error('counter_id dan tombol_id wajib diisi');
}

/*
|--------------------------------------------------------------------------
| 1. Cek akun + counter (harus sedang dipakai akun ini)
|--------------------------------------------------------------------------
*/
if (!user_loket_valid($conn, $userId)) {
    json_error('Akun tidak aktif atau tidak dikenal.', 403);
}

$counter = ambil_loket($conn, $counterId);

if (!$counter || $counter['NA'] === 'Y') {
    json_error('Counter tidak ditemukan / tidak aktif', 404);
}

if ((int) $counter['petugas_id'] !== $userId) {
    json_error('Loket ini tidak sedang kamu pakai. Pilih loket ulang.', 403);
}

// Segarkan penanda "sedang dipakai"
$stmt = mysqli_prepare($conn, "UPDATE sesi_loket SET last_ping = NOW() WHERE counter_id = ? AND user_id = ?");
mysqli_stmt_bind_param($stmt, "si", $counterId, $userId);
mysqli_stmt_execute($stmt);

/*
|--------------------------------------------------------------------------
| 2. Cek tombol / jenis pasien
|--------------------------------------------------------------------------
*/
$stmt = mysqli_prepare(
    $conn,
    "SELECT TombolID, Nama, Prefix
     FROM tombol
     WHERE TombolID = ? AND NA = 'N'
     LIMIT 1"
);

if (!$stmt) {
    json_error('Prepare tombol gagal: ' . mysqli_error($conn), 500);
}

mysqli_stmt_bind_param($stmt, "s", $tombolId);

if (!mysqli_stmt_execute($stmt)) {
    json_error('Query tombol gagal: ' . mysqli_stmt_error($stmt), 500);
}

$tombol = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

if (!$tombol) {
    json_error('Jenis pasien tidak ditemukan / tidak aktif', 404);
}


/*
|--------------------------------------------------------------------------
| 3. Ambil log nomor hari ini
|--------------------------------------------------------------------------
*/
$tgl = date('Y-m-d');
$prefix = $tombol['Prefix'];
$panah = "→";

$stmt = mysqli_prepare(
    $conn,
    "SELECT LogID, Nomer, Progress
     FROM log_daftar
     WHERE TGL = ? AND TombolID = ?
     LIMIT 1"
);

if (!$stmt) {
    json_error('Prepare log_daftar gagal: ' . mysqli_error($conn), 500);
}

mysqli_stmt_bind_param($stmt, "ss", $tgl, $tombolId);

if (!mysqli_stmt_execute($stmt)) {
    json_error('Query log_daftar gagal: ' . mysqli_stmt_error($stmt), 500);
}

$log = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));


/*
|--------------------------------------------------------------------------
| 4. Tidak ada nomor yang bisa dipanggil
|--------------------------------------------------------------------------
*/
if (!$log || (int)$log['Progress'] >= (int)$log['Nomer']) {

    $sisa = $log ? (int)$log['Progress'] : 0;

    json_ok([
        "status"     => "TUNGGU",
        "text"       => "{$tombol['Nama']} {$panah} {$prefix}{$sisa} (TUNGGU)",
        "panggil_id" => null,
    ]);
}


/*
|--------------------------------------------------------------------------
| 5. Tentukan nomor berikutnya
|--------------------------------------------------------------------------
*/
$nomorPanggil = (int)$log['Progress'] + 1;


/*
|--------------------------------------------------------------------------
| 6. Mulai transaksi
|--------------------------------------------------------------------------
*/
mysqli_begin_transaction($conn);

try {

    /*
    |--------------------------------------------------------------------------
    | Update progress log_daftar
    |--------------------------------------------------------------------------
    */
    $stmt = mysqli_prepare(
        $conn,
        "UPDATE log_daftar
         SET Progress = ?
         WHERE LogID = ?"
    );

    if (!$stmt) {
        throw new Exception(
            'Prepare UPDATE log_daftar gagal: ' . mysqli_error($conn)
        );
    }

    mysqli_stmt_bind_param(
        $stmt,
        "ii",
        $nomorPanggil,
        $log['LogID']
    );

    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception(
            'UPDATE log_daftar gagal: ' . mysqli_stmt_error($stmt)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Update counter
    |--------------------------------------------------------------------------
    */
    $stmt = mysqli_prepare(
        $conn,
        "UPDATE counter
         SET TGL = ?, Progress = ?
         WHERE CounterID = ?"
    );

    if (!$stmt) {
        throw new Exception(
            'Prepare UPDATE counter gagal: ' . mysqli_error($conn)
        );
    }

    mysqli_stmt_bind_param(
        $stmt,
        "sis",
        $tgl,
        $nomorPanggil,
        $counterId
    );

    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception(
            'UPDATE counter gagal: ' . mysqli_stmt_error($stmt)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | INSERT panggilan
    |--------------------------------------------------------------------------
    */
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO panggil
        (
            Tgl,
            CounterID,
            TombolID,
            Display,
            Prefix,
            Nama,
            Nomor,
            Panggil,
            PanggilUlang,
            TanggalInsert,
            TanggalPanggil
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'Y',
            'N',
            NOW(),
            NOW()
        )"
    );

    if (!$stmt) {
        throw new Exception(
            'Prepare INSERT panggil gagal: ' . mysqli_error($conn)
        );
    }

    mysqli_stmt_bind_param(
        $stmt,
        "sssissi",
        $tgl,
        $counterId,
        $tombolId,
        $counter['Display'],
        $prefix,
        $tombol['Nama'],
        $nomorPanggil
    );

    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception(
            'INSERT panggil gagal: ' . mysqli_stmt_error($stmt)
        );
    }

    $panggilId = mysqli_insert_id($conn);

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */
    mysqli_commit($conn);

} catch (Throwable $e) {

    mysqli_rollback($conn);

    json_error(
        'Gagal memanggil antrian: ' . $e->getMessage(),
        500
    );
}


/*
|--------------------------------------------------------------------------
| 7. Berhasil
|--------------------------------------------------------------------------
*/
json_ok([
    "status"     => "OK",
    "text"       => "{$tombol['Nama']} {$panah} {$prefix}{$nomorPanggil}",
    "panggil_id" => $panggilId,
    "nomor"      => $nomorPanggil,
    "prefix"     => $prefix,
]);