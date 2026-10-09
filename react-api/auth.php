<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

/*
|--------------------------------------------------------------------------
| Helper response
|--------------------------------------------------------------------------
*/

function response($ok, $data = [], $status = 200)
{
    http_response_code($status);

    echo json_encode(
        array_merge(
            ['ok' => $ok],
            $data
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/*
|--------------------------------------------------------------------------
| Ambil input JSON
|--------------------------------------------------------------------------
*/

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    $input = [];
}

$action = $input['action'] ?? '';

/*
|--------------------------------------------------------------------------
| Pastikan koneksi database tersedia
|--------------------------------------------------------------------------
|
| File config.php harus menyediakan koneksi database.
| Umumnya menggunakan $conn atau $mysqli.
|
*/

$db = null;

if (isset($conn) && $conn instanceof mysqli) {
    $db = $conn;
} elseif (isset($mysqli) && $mysqli instanceof mysqli) {
    $db = $mysqli;
}

if (!$db) {
    response(false, [
        'error' => 'Koneksi database tidak ditemukan.'
    ], 500);
}

/*
|--------------------------------------------------------------------------
| REGISTER ADMIN / IT
|--------------------------------------------------------------------------
*/

if ($action === 'register_admin') {

    $nama = trim($input['nama'] ?? '');
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $konfirmasi = $input['konfirmasi_password'] ?? '';

    if ($nama === '' || $username === '' || $password === '') {
        response(false, [
            'error' => 'Nama, username, dan password wajib diisi.'
        ], 400);
    }

    if ($password !== $konfirmasi) {
        response(false, [
            'error' => 'Konfirmasi password tidak sama.'
        ], 400);
    }

    if (strlen($username) < 3) {
        response(false, [
            'error' => 'Username minimal 3 karakter.'
        ], 400);
    }

    if (strlen($password) < 6) {
        response(false, [
            'error' => 'Password minimal 6 karakter.'
        ], 400);
    }

    /*
    |--------------------------------------------------------------------------
    | Cek username
    |--------------------------------------------------------------------------
    */

    $stmt = $db->prepare(
        "SELECT id
         FROM users
         WHERE username = ?
         LIMIT 1"
    );

    if (!$stmt) {
        response(false, [
            'error' => 'Gagal menyiapkan pemeriksaan username.'
        ], 500);
    }

    $stmt->bind_param('s', $username);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt->close();

        response(false, [
            'error' => 'Username sudah digunakan.'
        ], 409);
    }

    $stmt->close();

    /*
    |--------------------------------------------------------------------------
    | Hash password
    |--------------------------------------------------------------------------
    */

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    /*
    |--------------------------------------------------------------------------
    | Simpan Admin
    |--------------------------------------------------------------------------
    */

    $role = 'admin';
    $status = 'aktif';

    $stmt = $db->prepare(
        "INSERT INTO users
        (nama, username, password, role, status)
        VALUES (?, ?, ?, ?, ?)"
    );

    if (!$stmt) {
        response(false, [
            'error' => 'Gagal menyiapkan penyimpanan akun.'
        ], 500);
    }

    $stmt->bind_param(
        'sssss',
        $nama,
        $username,
        $passwordHash,
        $role,
        $status
    );

    if (!$stmt->execute()) {

        $error = $stmt->error;

        $stmt->close();

        response(false, [
            'error' => 'Akun gagal dibuat: ' . $error
        ], 500);
    }

    $userId = $stmt->insert_id;

    $stmt->close();

    response(true, [
        'message' => 'Akun Admin berhasil dibuat.',
        'user' => [
            'id' => $userId,
            'nama' => $nama,
            'username' => $username,
            'role' => 'admin',
            'status' => 'aktif'
        ]
    ]);

}


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

if ($action === 'login') {

    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if ($username === '' || $password === '') {
        response(false, [
            'error' => 'Username dan password wajib diisi.'
        ], 400);
    }

    /*
    |--------------------------------------------------------------------------
    | Cari user
    |--------------------------------------------------------------------------
    */

    $stmt = $db->prepare(
        "SELECT
            id,
            nama,
            username,
            password,
            role,
            status
         FROM users
         WHERE username = ?
         LIMIT 1"
    );

    if (!$stmt) {
        response(false, [
            'error' => 'Gagal menyiapkan proses login.'
        ], 500);
    }

    $stmt->bind_param('s', $username);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();

        response(false, [
            'error' => 'Username atau password salah.'
        ], 401);
    }

    $user = $result->fetch_assoc();

    $stmt->close();

    /*
    |--------------------------------------------------------------------------
    | Cek status akun
    |--------------------------------------------------------------------------
    */

    if ($user['status'] !== 'aktif') {
        response(false, [
            'error' => 'Akun ini tidak aktif.'
        ], 403);
    }

    /*
    |--------------------------------------------------------------------------
    | Verifikasi password
    |--------------------------------------------------------------------------
    */

    if (!password_verify($password, $user['password'])) {
        response(false, [
            'error' => 'Username atau password salah.'
        ], 401);
    }

    /*
    |--------------------------------------------------------------------------
    | Login berhasil
    |--------------------------------------------------------------------------
    */

    unset($user['password']);

    response(true, [
        'message' => 'Login berhasil.',
        'user' => $user
    ]);

}


/*
|--------------------------------------------------------------------------
| ACTION TIDAK DIKENAL
|--------------------------------------------------------------------------
*/

response(false, [
    'error' => 'Action tidak dikenali.'
], 400);