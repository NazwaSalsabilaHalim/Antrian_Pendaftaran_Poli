<?php
require __DIR__ . '/config.php';

$sql = "SELECT ID, CounterID, Nama, Display FROM counter WHERE NA = 'N' ORDER BY CounterID";
$res = mysqli_query($conn, $sql);
if (!$res) json_error(mysqli_error($conn), 500);

$list = [];
while ($row = mysqli_fetch_assoc($res)) {
  $list[] = $row;
}

json_ok(["counter" => $list]);
