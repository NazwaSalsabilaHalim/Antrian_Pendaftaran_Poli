<?php
/**
 * activity_helper.php
 * Helper untuk mencatat aktivitas admin/IT ke tabel log_aktivitas.
 * Include file ini di endpoint yang melakukan perubahan data (create/update/delete).
 */

function catat_aktivitas($conn, $pengguna, $aktivitas) {
  $sql = "INSERT INTO log_aktivitas (pengguna, aktivitas) VALUES (?, ?)";
  $stmt = mysqli_prepare($conn, $sql);
  mysqli_stmt_bind_param($stmt, "ss", $pengguna, $aktivitas);
  mysqli_stmt_execute($stmt);
}
