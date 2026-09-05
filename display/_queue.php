<?php
// Listed by  : Heri
// Start      : Nov 12, 2011 (PKU)
session_start();

// *** Main ***
$CounterID = $_REQUEST['CounterID'];
$TombolID = $_REQUEST['TombolID'];
$widget  = $_REQUEST['w'];

if (empty($CounterID)) {
	echo "Kosong";
	exit;
}

// *** Infrastructures ***
include_once "db.mysql.php";
include_once "connectdb.php";
include_once "antrian.lib.php";

$key = 'Antrian_'.$CounterID;

$tgl = date("d/m/Y");
$jam = date("H:i:s");
$tgl1   = explode("/",$tgl);
$tglant = $tgl1[2]."-".$tgl1[1]."-".$tgl1[0];

$tmbl = GetData("SELECT * FROM tombol WHERE TombolID='$TombolID' AND NA='N'");
$poli = $tmbl['Nama'];

// Nomer antriannya

$skrg = GetData("select * from counter where CounterID='$CounterID' AND NA='N'");
if ($skrg['Progress'] > 0){
	$urutanskrg = str_pad($skrg['Progress'], 3, '0', STR_PAD_LEFT);
	$counter = $skrg['Nama'];
} else {
	$urutanskrg = "-";
	$counter = '';
}

$waktu  = date('Hi');
$prefix = $skrg['Prefix'];
echo <<<ESD
<div id="$key" class="widget-container">
  <div class="queuetitle">
  $counter
  </div>
  <div class="queuenumber">
  $prefix$urutanskrg
  </div>
</div>
ESD;

// Jika tidak sama dengan nomor sebelumnya, maka bunyikan bel
if ($_SESSION[$key] != $urutanskrg) {
	//fnBunyikanBel($key);
	// sound($key,$widget,$urutanskrg,$prefix);
	echo"
	<script>
	$('#$key').fadeOut(50);
	$('#$key').fadeIn(2000);
	$('#$key').fadeOut(50);
	$('#$key').fadeIn(2000);
	$('#$key').fadeOut(50);
	$('#$key').fadeIn(2000);</script>";
	$_SESSION[$key] = $urutanskrg;
}


function fnBunyikanBel($key) {
	echo <<<ESD
	<EMBED src="display/sound.wav" autostart=true loop=false volume=200 hidden=true>
	<NOEMBED><BGSOUND src="display/sound.wav"></NOEMBED>

<script>
	$('#$key').fadeOut(50);
	$('#$key').fadeIn(2000);
	$('#$key').fadeOut(50);
	$('#$key').fadeIn(2000);
	$('#$key').fadeOut(50);
	$('#$key').fadeIn(2000);

</script>
ESD;
} // end funct



function sound($key,$widget,$urutanskrg,$prefix){
	echo"
		<script>

$('#$key').fadeOut(50);
$('#$key').fadeIn(2000);
$('#$key').fadeOut(50);
$('#$key').fadeIn(2000);
$('#$key').fadeOut(50);
$('#$key').fadeIn(2000);

$.post('read.php?act=putar&nomor=".$urutanskrg."&prefix=".$prefix."&widget=".$widget." ');
$('#flashPlayer').load('suara.php?counter=".$widget."');
</script>
";
} // end funct

?>
