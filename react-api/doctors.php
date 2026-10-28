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


/**
 * Mengirim response JSON.
 */
function respond($success, $message = '', $data = null)
{
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/**
 * Memperbarui informasi refresh display.
 */
function request_refresh($pdo, $display)
{
    $tanggal = date('YmdHis');

    $stmt = $pdo->prepare("
        REPLACE INTO refresh_display (Display, Tanggal)
        VALUES (?, ?)
    ");

    $stmt->execute([
        $display,
        $tanggal
    ]);
}


/**
 * Upload foto dokter.
 *
 * Nama file mengikuti sistem lama:
 *
 * AID 25 + JPG
 * => 25.jpg
 *
 * AID 25 + PNG
 * => 25.png
 */
function upload_photo($file, $aid)
{
    if (
        !isset($file) ||
        $file['error'] === UPLOAD_ERR_NO_FILE
    ) {
        return null;
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException(
            'Foto gagal diupload.'
        );
    }


    /*
     * Maksimal 5 MB
     */
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new RuntimeException(
            'Ukuran foto maksimal 5 MB.'
        );
    }


    /*
     * Validasi MIME file.
     */
    $finfo = new finfo(FILEINFO_MIME_TYPE);

    $mime = $finfo->file(
        $file['tmp_name']
    );


    $allowedMime = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/webp' => 'webp'
    ];


    if (!isset($allowedMime[$mime])) {
        throw new RuntimeException(
            'Format foto harus JPG, PNG, GIF, atau WEBP.'
        );
    }


    $extension = $allowedMime[$mime];


    /*
     * Folder foto sistem lama.
     */
    $photoDir = __DIR__ . '/../foto/';


    /*
     * Buat folder jika belum ada.
     */
    if (!is_dir($photoDir)) {

        if (!mkdir(
            $photoDir,
            0755,
            true
        )) {
            throw new RuntimeException(
                'Folder foto tidak dapat dibuat.'
            );
        }
    }


    /*
     * Pastikan folder dapat ditulis.
     */
    if (!is_writable($photoDir)) {
        throw new RuntimeException(
            'Folder foto tidak dapat ditulis oleh server.'
        );
    }


    /*
     * Nama file mengikuti sistem lama.
     *
     * Contoh:
     * 15.jpg
     * 16.png
     */
    $filename = $aid . '.' . $extension;

    $destination = $photoDir . $filename;


    /*
     * Hapus kemungkinan foto lama
     * dengan ekstensi berbeda.
     *
     * Contoh:
     * sebelumnya 15.jpg
     * sekarang upload 15.png
     */
    $extensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp'
    ];

    foreach ($extensions as $oldExtension) {

        $oldFile =
            $photoDir .
            $aid .
            '.' .
            $oldExtension;

        if (
            $oldFile !== $destination &&
            is_file($oldFile)
        ) {
            unlink($oldFile);
        }
    }


    /*
     * Simpan file.
     */
    if (
        !move_uploaded_file(
            $file['tmp_name'],
            $destination
        )
    ) {
        throw new RuntimeException(
            'Foto gagal disimpan ke folder foto.'
        );
    }


    /*
     * Kembalikan nama file
     * untuk disimpan ke database.
     */
    return $filename;
}


try {

    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {


        /*
         * Ambil pilihan status.
         */
        if (isset($_GET['options'])) {
        }
        
        /*
         * Ambil dokter Yasmin yang belum terdaftar di Antripol.
         * Khusus untuk pilihan pada form Tambah Dokter.
         */
        if (isset($_GET['yasmin_doctors'])) {
            $sqlYasmin = "
                SELECT
                    d.DokterID,
                    d.Nama,
                    d.Sapaan,
                    d.Inisial,
                    d.Gelar
                FROM yasmin2026_testing.dokter AS d
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM antripol.antrian AS a
                    WHERE TRIM(a.DokterID) = TRIM(d.DokterID)
                )
                ORDER BY d.Nama ASC
            ";

            $stmtYasmin = $pdo->query($sqlYasmin);

            respond(
                true,
                'Daftar dokter Yasmin berhasil diambil.',
                $stmtYasmin->fetchAll(PDO::FETCH_ASSOC)
            );
        }

        /*
         * Ambil pilihan status.
         */
        if (isset($_GET['options'])) {
            $stmt = $pdo->query("
                SELECT
                    Status,
                    Nama
                FROM status
                ORDER BY Status
            ");

            respond(
                true,
                'Pilihan status berhasil diambil.',
                [
                    'statuses' => $stmt->fetchAll(PDO::FETCH_ASSOC)
                ]
            );
        }
        
        /*
        * Ambil daftar dokter dari tabel master dokter.
        * Konfigurasi antrean tetap berasal dari tabel antrian.
        */
        $sql = "
            SELECT
                a.AID,
                a.Display,
                COALESCE(NULLIF(d.Nama, ''), a.Nama) AS Nama,
                a.DokterID,
                a.foto,
                a.NamaPoli,
                a.Ruang,
                a.Status,
                a.Antrian,
                s.Nama AS NamaStatus,
                d.Sapaan,
                d.Inisial,
                d.Gelar
            FROM antripol.antrian AS a
            LEFT JOIN yasmin2026_testing.dokter AS d
                ON CONVERT(a.DokterID USING latin1) = d.DokterID
            LEFT JOIN antripol.status AS s
                ON a.Status = s.Status
            WHERE 1 = 1
        ";

        $params = [];

        /* Filter display */
        if (
            isset($_GET['display']) &&
            $_GET['display'] !== ''
        ) {
            $sql .= " AND a.Display = ?";
            $params[] = (int) $_GET['display'];
        }

        /* Pencarian dokter / poli */
        if (
            isset($_GET['search']) &&
            trim($_GET['search']) !== ''
        ) {
            $sql .= "
                AND (
                    d.Nama LIKE ?
                    OR a.Nama LIKE ?
                    OR a.NamaPoli LIKE ?
                )
            ";

            $keyword = '%' . trim($_GET['search']) . '%';

            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
        }

        $sql .= "
            ORDER BY
                a.Display ASC,
                Nama ASC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        respond(
            true,
            'Data dokter berhasil diambil.',
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Hanya POST setelah bagian GET
    |--------------------------------------------------------------------------
    */

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

        http_response_code(405);

        respond(
            false,
            'Metode permintaan tidak diizinkan.'
        );
    }


    $action = $_POST['action'] ?? '';


    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    if ($action === 'create') {

        $nama =
            trim($_POST['Nama'] ?? '');

        $dokterId =
            trim($_POST['DokterID'] ?? '');

        $password =
            $_POST['Pwd'] ?? '';

        $poli =
            trim($_POST['NamaPoli'] ?? '');

        $ruang =
            trim($_POST['Ruang'] ?? '');

        $display =
            (int) ($_POST['Display'] ?? 0);

        $status =
            trim(
                (string) ($_POST['Status'] ?? '')
            );


        /*
         * Validasi.
         */
        if (
            $nama === '' ||
            $dokterId === '' ||
            $password === '' ||
            $poli === '' ||
            $ruang === '' ||
            $display < 1 ||
            $status === ''
        ) {

            http_response_code(422);

            respond(
                false,
                'Lengkapi semua kolom wajib.'
            );
        }


        /*
         * Mulai transaction.
         */
        $pdo->beginTransaction();


        /*
         * Tambahkan dokter.
         */
        $stmt = $pdo->prepare("
            INSERT INTO antrian
            SET
                Display = ?,
                Nama = ?,
                DokterID = ?,
                NamaPoli = ?,
                Ruang = ?,
                Status = ?,
                Pwd = MD5(?),
                Tanggal = NOW(),
                Antrian = 0
        ");


        $stmt->execute([
            $display,
            $nama,
            $dokterId,
            $poli,
            $ruang,
            $status,
            $password
        ]);


        /*
         * Ambil AID dokter yang baru dibuat.
         */
        $aid =
            (int) $pdo->lastInsertId();


        /*
         * Upload foto jika ada.
         */
        $foto = null;

        if (
            isset($_FILES['foto']) &&
            $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE
        ) {

            $foto =
                upload_photo(
                    $_FILES['foto'],
                    $aid
                );


            /*
             * Simpan nama foto ke database.
             */
            $stmt = $pdo->prepare("
                UPDATE antrian
                SET foto = ?
                WHERE AID = ?
            ");

            $stmt->execute([
                $foto,
                $aid
            ]);
        }


        /*
         * Commit.
         */
        $pdo->commit();


        /*
         * Refresh display.
         */
        request_refresh(
            $pdo,
            $display
        );


        respond(
            true,
            'Dokter berhasil ditambahkan.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    if ($action === 'update') {

        $aid =
            (int) ($_POST['AID'] ?? 0);

        $nama =
            trim($_POST['Nama'] ?? '');

        $dokterId =
            trim($_POST['DokterID'] ?? '');

        $poli =
            trim($_POST['NamaPoli'] ?? '');

        $ruang =
            trim($_POST['Ruang'] ?? '');

        $display =
            (int) ($_POST['Display'] ?? 0);

        $status =
            trim(
                (string) ($_POST['Status'] ?? '')
            );

        $password =
            $_POST['Pwd'] ?? '';


        /*
         * Validasi.
         */
        if (
            $aid < 1 ||
            $nama === '' ||
            $dokterId === '' ||
            $poli === '' ||
            $ruang === '' ||
            $display < 1 ||
            $status === ''
        ) {

            http_response_code(422);

            respond(
                false,
                'Data dokter belum lengkap.'
            );
        }


        /*
         * Ambil data dokter lama.
         *
         * FOTO HARUS ikut diambil.
         */
        $stmt = $pdo->prepare("
            SELECT
                Display,
                foto
            FROM antrian
            WHERE AID = ?
        ");

        $stmt->execute([
            $aid
        ]);


        $dokterLama =
            $stmt->fetch(PDO::FETCH_ASSOC);


        if (!$dokterLama) {

            http_response_code(404);

            respond(
                false,
                'Data dokter tidak ditemukan.'
            );
        }


        $displayLama =
            (int) $dokterLama['Display'];

        $fotoLama =
            $dokterLama['foto'] ?? '';


        /*
         * Secara default,
         * gunakan foto lama.
         */
        $fotoBaru = $fotoLama;


        /*
         * Jika user memilih foto baru,
         * upload foto tersebut.
         */
        if (
            isset($_FILES['foto']) &&
            $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE
        ) {

            $fotoBaru =
                upload_photo(
                    $_FILES['foto'],
                    $aid
                );
        }


        /*
         * Update data dokter.
         */
        if ($password !== '') {

            $stmt = $pdo->prepare("
                UPDATE antrian
                SET
                    Display = ?,
                    Nama = ?,
                    DokterID = ?,
                    NamaPoli = ?,
                    Ruang = ?,
                    Status = ?,
                    Pwd = MD5(?),
                    foto = ?
                WHERE AID = ?
            ");


            $stmt->execute([
                $display,
                $nama,
                $dokterId,
                $poli,
                $ruang,
                $status,
                $password,
                $fotoBaru,
                $aid
            ]);
        } else {

            $stmt = $pdo->prepare("
                UPDATE antrian
                SET
                    Display = ?,
                    Nama = ?,
                    DokterID = ?,
                    NamaPoli = ?,
                    Ruang = ?,
                    Status = ?,
                    foto = ?
                WHERE AID = ?
            ");


            $stmt->execute([
                $display,
                $nama,
                $dokterId,
                $poli,
                $ruang,
                $status,
                $fotoBaru,
                $aid
            ]);
        }


        /*
         * Refresh display lama.
         */
        request_refresh(
            $pdo,
            $displayLama
        );


        /*
         * Kalau display berubah,
         * refresh display baru juga.
         */
        if ($display !== $displayLama) {

            request_refresh(
                $pdo,
                $display
            );
        }


        respond(
            true,
            'Data dokter berhasil diperbarui.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    if ($action === 'delete') {

        $aid =
            (int) ($_POST['AID'] ?? 0);


        if ($aid < 1) {

            http_response_code(422);

            respond(
                false,
                'ID dokter tidak valid.'
            );
        }


        /*
         * Ambil display dan foto.
         */
        $stmt = $pdo->prepare("
            SELECT
                Display,
                foto
            FROM antrian
            WHERE AID = ?
        ");

        $stmt->execute([
            $aid
        ]);


        $dokter =
            $stmt->fetch(PDO::FETCH_ASSOC);


        if (!$dokter) {

            http_response_code(404);

            respond(
                false,
                'Data dokter tidak ditemukan.'
            );
        }


        $display =
            (int) $dokter['Display'];

        $foto =
            $dokter['foto'] ?? '';


        /*
         * Hapus data dokter.
         */
        $stmt = $pdo->prepare("
            DELETE FROM antrian
            WHERE AID = ?
        ");

        $stmt->execute([
            $aid
        ]);


        /*
         * Hapus file foto.
         */
        if ($foto !== '') {

            $photoPath =
                __DIR__ .
                '/../foto/' .
                basename($foto);


            if (is_file($photoPath)) {
                unlink($photoPath);
            }
        }


        /*
         * Refresh display.
         */
        request_refresh(
            $pdo,
            $display
        );


        respond(
            true,
            'Dokter berhasil dihapus.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Aksi tidak dikenal
    |--------------------------------------------------------------------------
    */

    http_response_code(400);

    respond(
        false,
        'Aksi tidak dikenal.'
    );
} catch (Throwable $e) {

    /*
     * Jika transaction masih aktif,
     * batalkan perubahan database.
     */
    if (
        isset($pdo) &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }


    http_response_code(500);

    respond(
        false,
        'Terjadi kesalahan pada server. Silakan coba kembali.'
    );
}
