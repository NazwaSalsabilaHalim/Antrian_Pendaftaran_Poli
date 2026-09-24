<?php
require __DIR__ . '/config.php';
require __DIR__ . '/activity_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $sql = "SELECT CounterID, Nama, petugas_nama, NA FROM counter ORDER BY CounterID";
  $res = mysqli_query($conn, $sql);

  $data = [];
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = [
      "counter_id"   => $row['CounterID'],
      "nama"         => $row['Nama'],
      "petugas_nama" => $row['petugas_nama'] ?: '-',
      "status"       => $row['NA'] === 'Y' ? 'Tidak Aktif' : 'Aktif',
    ];
  }

  json_ok(["loket" => $data]);
}

if ($method === 'POST') {
  $action = input('action', 'update');

  if ($action === 'update') {
    $counter_id   = (string) input('counter_id', '');
    $petugas_nama = trim((string) input('petugas_nama', ''));
    $status       = input('status', 'Aktif');

    if ($counter_id === '') json_error("Counter ID wajib diisi.");

    $na = ($status === 'Tidak Aktif') ? 'Y' : 'N';

    $sql  = "UPDATE counter SET petugas_nama = ?, NA = ? WHERE CounterID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sss", $petugas_nama, $na, $counter_id);

    if (!mysqli_stmt_execute($stmt)) {
      json_error("Gagal mengubah loket: " . mysqli_error($conn));
    }

    catat_aktivitas($conn, "Admin IT", "Mengubah loket $counter_id (petugas: $petugas_nama, status: $status)");
    json_ok();
  }

  json_error("Action tidak dikenali.");
}

json_error("Method tidak didukung.", 405);
