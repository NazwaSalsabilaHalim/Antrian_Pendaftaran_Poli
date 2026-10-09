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

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        UPDATE antrian
        SET Antrian = 0
        WHERE Display BETWEEN 1 AND 10
    ");

    $stmt->execute();

    try {
        // Beri tahu display bahwa data antrean perlu diperbarui.
        $refresh = $pdo->prepare("
            REPLACE INTO refresh_display (Display, Tanggal)
            VALUES (?, NOW())
        ");

        for ($display = 1; $display <= 10; $display++) {
            $refresh->execute([$display]);
        }
    } catch (Throwable $e) {
        // Abaikan jika tabel belum ada
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Seluruh nomor antrean Display 1–10 berhasil dikosongkan.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Gagal mengosongkan antrean: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

