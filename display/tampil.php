<?php

// Listed by  : Heri
// Start      : Nov 12, 2011 (PKU)

include_once "db.mysql.php";
include_once "connectdb.php";

isset($_POST['disp']) or die('Error parameter');

$disp = $_POST['disp']+0;

$queQ = "SELECT ID, CounterID, Nomor, Prefix, PanggilUlang
  FROM panggil
  WHERE
    Tgl = '" . date('Y-m-d') . "'
    AND Display = 1
    AND Panggil = 'N'
    ORDER BY TanggalInsert, Nomor LIMIT 1";
$queR = mysql_query($queQ);
$resp = array();
if (mysql_num_rows($queR) > 0) {
  $queue = mysql_fetch_array($queR);
  $prefix = '';
  if ($queue['Prefix'] !== '') {
    $prefix = $queue['Prefix'];
  }

  $counterR = mysql_query("SELECT Nama FROM counter WHERE CounterID = '{$queue['CounterID']}' AND NA='N' LIMIT 1");
  $counter =  mysql_fetch_array($counterR);

  $status = "OK";
  $code = 200;
  $resp['panggil_id'] = $queue['ID'];
  $resp['counter_id'] = $queue['CounterID'];
  $resp['counter_nama'] = $counter['Nama'];
  $resp['nomor'] = $prefix.str_pad($queue['Nomor'], 3, '0', STR_PAD_LEFT);
  $resp['panggil_ulang'] = ($queue['PanggilUlang'] === 'Y');
} else {
  /**
   * Jika tidak ada antrian yang belum dipanggil, ambil nomor antrian terakhir
   */
  $queQ = "SELECT p.ID,p.CounterID,p.Nomor,c.Nama,p.Prefix,p.PanggilUlang
    FROM panggil AS p
    LEFT JOIN counter AS c USING (CounterID)
    WHERE
      p.Tgl = '" . date('Y-m-d') . "'
      AND p.Panggil = 'Y'
      ORDER BY TanggalPanggil DESC";
  $queR = mysql_query($queQ);
  $queue = mysql_fetch_array($queR);
  $prefix = '';
  if ($queue['Prefix'] !== '') {
    $prefix = $queue['Prefix'];
  }
  $resp['panggil_id'] = $queue['ID'];
  $resp['counter_id'] = $queue['CounterID'];
  $resp['counter_nama'] = $queue['Nama'];
  $resp['nomor'] = $prefix.str_pad($queue['Nomor'], 3, '0', STR_PAD_LEFT);
  $resp['panggil_ulang'] = $queue['PanggilUlang'] === 'Y';
  $status = "OK";
  $code = 200;
}

$resp['code'] = $code;
$resp['status'] = $status;
header("Status: {$code} {$status}");
header('Content-Type: application/json');
echo json_encode($resp);
exit;
