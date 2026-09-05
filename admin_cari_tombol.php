<?php
// Started by Dewo, 31/10/2011

session_start();
include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

$term = $_REQUEST['term'];

$s = "select TombolID, Nama 
  from tombol 
  where Nama like '%$term%' 
    or  TombolID like '%$term%'
    and NA = 'N' 
  order by Nama";
$r = _query($s);
$h = array();
while ($w = _fetch_array($r)) {
  $h[] = $w['TombolID'];
}
echo json_encode($h);

?>
