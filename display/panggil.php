<?php
// Listed by  : Heri
// Start      : Nov 12, 2011 (PKU)
session_start();

// *** Infrastructures ***
require_once "db.mysql.php";
require_once "connectdb.php";
require_once "antrian.lib.php";

// $sql = "SELECT * FROM panggil WHERE Panggil='N' AND Tgl = '" . date('Y-m-d') . "' order by ID ASC limit 1";
$sql = "SELECT * FROM panggil WHERE ID = '"._escape_string($_REQUEST['PanggilID'])."' LIMIT 1";
$qry=_query($sql);
$num=_num_rows($qry);
$dat=_fetch_array($qry);

if($num>0){
  $urutanskrg = $dat['Nomor'];
  $prefix=$dat['Prefix'];
  $widget=$dat['CounterID'];
  echo $urutanskrg."|".$prefix."|".$widget;

  $s="update panggil set Panggil='Y', TanggalPanggil = NOW(), PanggilUlang = 'N' WHERE ID='".$dat['ID']."'";
  _query($s);
}else{
	echo "kosong|";
}

?>


