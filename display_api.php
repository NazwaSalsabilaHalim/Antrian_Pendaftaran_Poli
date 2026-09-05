<?php

header('Content-Type: application/json');

include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

$sql = "SELECT CounterID, Nama, Progress, Display
        FROM counter
        WHERE Display = 1
        AND NA = 'N'
        ORDER BY Nama";

$qry = _query($sql);

$data = [];

while ($row = _fetch_array($qry)) {
    $data[] = [
        'counter_id' => $row['CounterID'],
        'nama'       => $row['Nama'],
        'progress'   => (int) $row['Progress'],
        'display'    => (int) $row['Display']
    ];
}

echo json_encode([
    'status' => 'OK',
    'data'   => $data
]);