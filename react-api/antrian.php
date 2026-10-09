<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../db.php';

function respond(array $data): void
{
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function request_refresh($pdo, $display = '1')
{
    $tanggal = date('YmdHis');
    try {
        $stmt = $pdo->prepare("
            REPLACE INTO refresh_display (Display, Tanggal)
            VALUES (?, ?)
        ");
        $stmt->execute([$display, $tanggal]);
    } catch (Throwable $e) {
        // Abaikan jika tabel belum ada
    }
}

// Ambil input dari JSON body atau $_POST atau $_REQUEST
$input = $_POST;
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $jsonData = json_decode($rawInput, true);
    if (is_array($jsonData)) {
        $input = array_merge($input, $jsonData);
    }
}
if (empty($input)) {
    $input = $_REQUEST;
}

$action = $input['x'] ?? '';

$allowed = [
    'login',
    'data_tombol',
    'tekan_tombol',
    'nomor_manual',
];

if (!in_array($action, $allowed, true)) {
    respond([
        'OK' => 0,
        'MSG' => 'Parameter tidak valid.',
    ]);
}

$AID = isset($input['AID']) ? (int) $input['AID'] : 0;
$Pwd = (string) ($input['Pwd'] ?? '');

if (!$AID || $AID < 1) {
    respond([
        'OK' => 0,
        'MSG' => 'Dokter tidak valid.',
    ]);
}

function verifyDoctor(PDO $pdo, int $aid, string $password): bool
{
    $stmt = $pdo->prepare(
        'SELECT AID FROM antrian WHERE AID = ? AND Pwd = MD5(?) LIMIT 1'
    );
    $stmt->execute([$aid, $password]);

    return (bool) $stmt->fetchColumn();
}

try {
    if ($action === 'login') {
        if (verifyDoctor($pdo, $AID, $Pwd)) {
            respond(['OK' => 1, 'MSG' => 'OK']);
        }

        respond([
            'OK' => 0,
            'MSG' => 'Login salah. Periksa password dokter.',
        ]);
    }

    if (!verifyDoctor($pdo, $AID, $Pwd)) {
        respond([
            'OK' => 0,
            'MSG' => 'Password tidak sesuai. Silakan login kembali.',
        ]);
    }

    if ($action === 'data_tombol') {
        $stmt = $pdo->prepare(
            'SELECT AID, Nama, foto, NamaPoli, Ruang, Display, Antrian
             FROM antrian
             WHERE AID = ?
             LIMIT 1'
        );
        $stmt->execute([$AID]);

        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            respond([
                'OK' => 0,
                'MSG' => 'Data dokter tidak ditemukan.',
            ]);
        }

        $data['Antrian'] = str_pad(
            (string) ($data['Antrian'] ?? 0),
            3,
            '0',
            STR_PAD_LEFT
        );

        respond($data);
    }

    if ($action === 'tekan_tombol') {
        $direction = isset($input['dir']) ? (int) $input['dir'] : 0;

        if (!in_array($direction, [-1, 1], true)) {
            respond([
                'OK' => 0,
                'MSG' => 'Arah perubahan antrean tidak valid.',
            ]);
        }

        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'SELECT Antrian, Display FROM antrian WHERE AID = ? FOR UPDATE'
        );
        $stmt->execute([$AID]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            $pdo->rollBack();

            respond([
                'OK' => 0,
                'MSG' => 'Data antrean tidak ditemukan.',
            ]);
        }

        $current = (int) $row['Antrian'];
        $display = $row['Display'] ?? '1';
        $next = $current + $direction;

        if ($next < 0) {
            $pdo->rollBack();

            respond([
                'OK' => 0,
                'MSG' => 'Nomor antrean tidak boleh minus.',
            ]);
        }

        $stmt = $pdo->prepare(
            'UPDATE antrian SET Antrian = ? WHERE AID = ?'
        );
        $stmt->execute([$next, $AID]);

        $pdo->commit();

        request_refresh($pdo, $display);

        respond([
            'OK' => 1,
            'MSG' => 'OK',
            'Antrian' => str_pad(
                (string) $next,
                3,
                '0',
                STR_PAD_LEFT
            ),
        ]);
    }

    if ($action === 'nomor_manual') {
        $nomor = isset($input['nomor']) ? (int) $input['nomor'] : null;

        if ($nomor === null || $nomor < 0) {
            respond([
                'OK' => 0,
                'MSG' => 'Nomor antrean harus berupa bilangan bulat minimal 0.',
            ]);
        }

        $stmt = $pdo->prepare(
            'SELECT Display FROM antrian WHERE AID = ? LIMIT 1'
        );
        $stmt->execute([$AID]);
        $display = $stmt->fetchColumn() ?: '1';

        $stmt = $pdo->prepare(
            'UPDATE antrian SET Antrian = ? WHERE AID = ?'
        );
        $stmt->execute([$nomor, $AID]);

        request_refresh($pdo, $display);

        respond([
            'OK' => 1,
            'MSG' => 'OK',
            'Antrian' => str_pad(
                (string) $nomor,
                3,
                '0',
                STR_PAD_LEFT
            ),
        ]);
    }
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('API Antrian Poli: ' . $e->getMessage());

    http_response_code(500);

    respond([
        'OK' => 0,
        'MSG' => 'Terjadi kesalahan pada server: ' . $e->getMessage(),
    ]);
}