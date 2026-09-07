<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method harus GET', 405);
}

/*
|--------------------------------------------------------------------------
| Filter
|--------------------------------------------------------------------------
*/

$tanggal = trim((string) ($_GET['tanggal'] ?? ''));
$search  = trim((string) ($_GET['search'] ?? ''));
$tombol  = trim((string) ($_GET['tombol'] ?? ''));
$counter = trim((string) ($_GET['counter'] ?? ''));

/*
|--------------------------------------------------------------------------
| Query dasar
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT
        p.ID,
        p.Tgl,
        p.CounterID,
        c.Nama AS CounterNama,
        p.TombolID,
        p.Nama AS TombolNama,
        p.Prefix,
        p.Nomor,
        p.Panggil,
        p.PanggilUlang,
        p.TanggalInsert,
        p.TanggalPanggil
    FROM panggil p
    LEFT JOIN counter c
        ON c.CounterID = p.CounterID
    WHERE 1=1
";

$params = [];
$types = "";

/*
|--------------------------------------------------------------------------
| Filter tanggal
|--------------------------------------------------------------------------
*/

if ($tanggal !== '') {
    $sql .= " AND p.Tgl = ?";
    $params[] = $tanggal;
    $types .= "s";
}

/*
|--------------------------------------------------------------------------
| Pencarian nomor
|--------------------------------------------------------------------------
*/

if ($search !== '') {
    $sql .= "
        AND CONCAT(p.Prefix, p.Nomor) LIKE ?
    ";

    $params[] = '%' . $search . '%';
    $types .= "s";
}

/*
|--------------------------------------------------------------------------
| Filter jenis pasien
|--------------------------------------------------------------------------
*/

if ($tombol !== '') {
    $sql .= " AND p.TombolID = ?";
    $params[] = $tombol;
    $types .= "s";
}

/*
|--------------------------------------------------------------------------
| Filter loket
|--------------------------------------------------------------------------
*/

if ($counter !== '') {
    $sql .= " AND p.CounterID = ?";
    $params[] = $counter;
    $types .= "s";
}

/*
|--------------------------------------------------------------------------
| Urutan terbaru
|--------------------------------------------------------------------------
*/

$sql .= " ORDER BY p.ID DESC";

$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    json_error(
        'Prepare riwayat gagal: ' . mysqli_error($conn),
        500
    );
}

if (!empty($params)) {
    mysqli_stmt_bind_param(
        $stmt,
        $types,
        ...$params
    );
}

if (!mysqli_stmt_execute($stmt)) {
    json_error(
        'Query riwayat gagal: ' . mysqli_stmt_error($stmt),
        500
    );
}

$result = mysqli_stmt_get_result($stmt);

$riwayat = [];

while ($row = mysqli_fetch_assoc($result)) {

    /*
    |--------------------------------------------------------------------------
    | Tentukan status
    |--------------------------------------------------------------------------
    */

    if ($row['PanggilUlang'] === 'Y') {
        $status = 'Dipanggil Ulang';
    } elseif ($row['Panggil'] === 'Y') {
        $status = 'Selesai';
    } else {
        $status = 'Dipanggil';
    }

    $riwayat[] = [
        'id' => (int) $row['ID'],
        'tanggal' => $row['Tgl'],
        'nomor' => $row['Prefix'] . str_pad(
            (string) $row['Nomor'],
            3,
            '0',
            STR_PAD_LEFT
        ),
        'nomor_asli' => (int) $row['Nomor'],
        'prefix' => $row['Prefix'],

        'tombol_id' => $row['TombolID'],
        'jenis_pasien' => $row['TombolNama'],

        'counter_id' => $row['CounterID'],
        'counter_nama' => $row['CounterNama'],

        'status' => $status,
        'panggil' => $row['Panggil'],
        'panggil_ulang' => $row['PanggilUlang'],

        'tanggal_insert' => $row['TanggalInsert'],
        'tanggal_panggil' => $row['TanggalPanggil'],
    ];
}

json_ok([
    'total' => count($riwayat),
    'riwayat' => $riwayat,
]);