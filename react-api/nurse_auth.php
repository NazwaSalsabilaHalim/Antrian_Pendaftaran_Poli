<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

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

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    $input = [];
}

$action = $input['action'] ?? '';

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
| LOGIN NURSE
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

    $stmt = $db->prepare(
        "SELECT
            id,
            nama,
            username,
            password,
            role,
            status,
            hak_akses
         FROM users
         WHERE username = ? AND role = 'nurse'
         LIMIT 1"
    );

    if (!$stmt) {
        response(false, [
            'error' => 'Gagal menyiapkan proses login nurse.'
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

    $nurse = $result->fetch_assoc();

    $stmt->close();


    if (strtolower($nurse['status']) !== 'aktif') {

        response(false, [
            'error' => 'Akun nurse tidak aktif.'
        ], 403);
    }


    if (!password_verify($password, $nurse['password'])) {

        response(false, [
            'error' => 'Username atau password salah.'
        ], 401);
    }


    unset($nurse['password']);

    response(true, [
        'message' => 'Login nurse berhasil.',
        'user' => [
            'id' => (int) $nurse['id'],
            'nama' => $nurse['nama'],
            'username' => $nurse['username'],
            'role' => $nurse['role'],
            'status' => $nurse['status'],
            'hak_akses' => json_decode($nurse['hak_akses'] ?? '', true) ?: new stdClass(),
        ]
    ]);
}


response(false, [
    'error' => 'Action tidak dikenali.'
], 400);