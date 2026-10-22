<?php
require __DIR__ . '/config.php';
require_once __DIR__ . '/loket_helper.php';

$sqlDipakai = sql_loket_dipakai('s');

$sql = "SELECT c.ID, c.CounterID, c.Nama, c.Display,
               s.user_id AS petugas_id, u.nama AS petugas_nama,
               $sqlDipakai AS dipakai
        FROM counter c
        LEFT JOIN sesi_loket s ON s.counter_id = c.CounterID
        LEFT JOIN users u ON u.id = s.user_id
        WHERE c.NA = 'N'
        ORDER BY c.ID";
$res = mysqli_query($conn, $sql);
if (!$res) json_error(mysqli_error($conn), 500);

$list = [];
while ($row = mysqli_fetch_assoc($res)) {
  $dipakai = (int) $row['dipakai'] === 1;

  $list[] = [
    "ID"           => $row['ID'],
    "CounterID"    => $row['CounterID'],
    "Nama"         => $row['Nama'],
    "Display"      => $row['Display'],
    "dipakai"      => $dipakai,
    "petugas_id"   => $dipakai ? (int) $row['petugas_id'] : null,
    "petugas_nama" => $dipakai ? $row['petugas_nama'] : null,
  ];
}

json_ok(["counter" => $list]);