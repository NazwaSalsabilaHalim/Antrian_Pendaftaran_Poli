<?php
/**
 * config.php
 * Bootstrap untuk semua endpoint react-api/*.
 *
 * Kenapa file baru, bukan pakai connectdb.php + db.mysql.php lama?
 * db.mysql.php memakai fungsi mysql_*() yang SUDAH DIHAPUS dari PHP 7 ke atas.
 * Supaya API untuk React ini pasti jalan di PHP versi berapa pun yang dipakai
 * hosting sekarang, kita pakai koneksi mysqli sendiri di sini.
 *
 * PENTING: samakan 4 nilai di bawah dengan yang ada di connectdb.php project lama.
 */

$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";
$DB_NAME = "antrian_pendaftaran";

// --- CORS: izinkan React (beda origin/port saat development) memanggil API ini ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

mysqli_report(MYSQLI_REPORT_OFF); // kita tangani error manual biar rapi di JSON

$conn = mysqli_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if (!$conn) {
  json_error("Gagal konek ke database: " . mysqli_connect_error(), 500);
}
mysqli_set_charset($conn, "utf8mb4");

function json_ok($data = []) {
  echo json_encode(array_merge(["ok" => true], $data));
  exit;
}

function json_error($message, $code = 400) {
  http_response_code($code);
  echo json_encode(["ok" => false, "error" => $message]);
  exit;
}

function body_json() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

/** Ambil nilai dari POST-JSON, lalu fallback ke $_REQUEST (biar fleksibel testing pakai curl/Postman) */
function input($key, $default = null) {
  static $body = null;
  if ($body === null) $body = body_json();
  if (isset($body[$key])) return $body[$key];
  if (isset($_REQUEST[$key])) return $_REQUEST[$key];
  return $default;
}
