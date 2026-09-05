<?php
// Started by Dewo, 31/10/2011

include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION['mod'] = 0;
$_SESSION['typ'] = '';

include "printer.php";

$exe = (empty($_REQUEST['exe']))? 'cari_display' : $_REQUEST['exe'];

switch($exe) {
  //case 'tampilkan_tombol' : tampilkan_tombol(); break;
  case 'cetak_antrian' : cetak_antrian(); break;
  case 'cetak_struk' : setStrukAntrian(); break;
  case 'cari_display' : cari_display(); break;
  case 'set_display' : set_display(); break;
  case 'reset_daftar' : reset_daftar(); break;
	case 'tampilkan_tombol' : tampilkan_tombol();break;
	case 'set_antrian' : set_antrian(); break;
}

function cari_display() {
  if (empty($_SESSION['Daftar'])) pilih_display();
  else tampilkan_tombol();
}

function pilih_display() {
  echo <<<ESD
  <input type="button" id="btn_submit_disp" class="button button-rounded button-primary" name="btn_submit_disp" value="Tampilkan Pendaftaran" onclick="fn_submit_disp2()" />

  <script>
  $(function() {
    $('#Disp3').keydown(function(event) {
      if (event.keyCode == 46 || event.keyCode == 8) {
      }
      else {
        if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
          event.preventDefault();
        }
      }
    });
  });

  function fn_submit_disp2() {
    var Disp = 1;
    $.post("index_btn.php?exe=set_display&disp=" + Disp,
      function(res) {
        if (res = 'OK') {
          //window.setTimeout('location.reload()', 100);
         // alert("yes");
          tampilkan(Disp);
        }
        else alert(res);
      }
    );
  }
  </script>
ESD;
}

function reset_daftar() {
  session_destroy();
  echo "OK";
}

function set_display() {
  $disp = $_REQUEST['disp']+0;
  $ada = GetaField("counter", "Display", $disp, "count(CounterID)")+0;
  if ($ada > 0) {
    $_SESSION['Daftar'] = $disp;
    echo "OK";
  }
  else echo "Error: Display $disp tidak terdaftar.";
}

function tampilkan_tombol() {
  $s = "select a.TombolID, a.Nama, a.Prefix from tombol a
    where a.NA='N'
    Order By a.Nama";
  $r = _query($s);
  while ($w = _fetch_array($r)) {
    //echo "<button id='$w[TombolID]' onclick=\"tampil('$w[TombolID]');\">$w[Nama]</button>";
    //modified heru.w 21 jan 2013 added prefix parameter into tampil function
    echo "<button id='$w[TombolID]' class='button_example'  onclick=\"tampil('$w[TombolID]','$w[Prefix]');\">{$w['Nama']}</button>";
  }
}

function cetak_antrian() {
  $tid = $_REQUEST['tid'];
  $tgl = date('Y-m-d');
  $prefix = $_REQUEST['prefix'];

  $terakhir = GetaField("log_daftar", "TGL='$tgl' and TombolID", $tid, "max(Nomer)");
  $tombol = GetaField("tombol", "NA='N' and TombolID", $tid, "Nama");

  if (empty($terakhir)) {
    $s = "insert into log_daftar
      set TGL = '$tgl',
          TombolID = '$tid',
          Nomer = 1 ";
    $r = _query($s);
    $terakhir = 1;
    echo "Anda mendapat nomor antrian:<br />
      <h1>".$prefix."1</h1>
      Silakan ambil struk antrian.";
  }
  else
  {
    $terakhir=$terakhir+1;
    $s = "update log_daftar
      set Nomer = $terakhir
      where TGL = '$tgl'
        and TombolID = '$tid' ";
    $r = _query($s);
    echo "Anda mendapat nomor antrian:<br />
    <h1>".$prefix."".$terakhir."</h1>
      Silakan ambil struk antrian.";
  }
  // Add by Domi
 //echo "<script> window.open('index_btn.php?exe=cetak_struk&tid=$tid&tombol=$tombol&no=$terakhir'); </script>";
 //modified heru.w 21 jan 2013
 echo "<script> window.open('index_btn.php?exe=cetak_struk&tid=$tid&tombol=$tombol&no=$terakhir&prefix=$prefix'); </script>";
}

function setStrukAntrian()
{
  include "ascii.php";
  $prefix = $_REQUEST['prefix'];
  $tid = $_REQUEST['tid'];
  $tombol = $_REQUEST['tombol'];
  $terakhir = $_REQUEST['no'];
  $tgl = date('d-m-Y h:i');

  //initPage();
  //$_SESSION['mod']=0;

  $isi = '';
  $isi .= $initialized2.$print10cpi.$doublestrike1;
  $isi .= "                RS Awal Bros Yasmine"."\n\n";
  $isi .= "     Jl. Marlan Jaya, Bukit Datuk, Kota Dumai, Riau"."\n\n";
  //$isi .= "     Telp: (0761)5868888 Fax(0761)586111"."\n\n\n";
  $isi .= "     -------------------------------------"."\n\n";
  $isi .= "     -------------------------------------"."\n";
  $isi .= $condensed0.$doublestrike0;
  $isi .= "     Tanggal : ".$tgl."\n";
  $isi .= "     Antrian ". $tombol."\n\n";
  // $isi .= $changefont0.$condensed0.$doublestrike1;
  // $isi .= "                   No. : ".$prefix."".$terakhir."\n";
	$isi .= $initialized2;
	// $isi .= chr(27).chr(33)."    No:$prefix$terakhir"."\n";
  $isi .= chr(27).chr(33).chr(32).kanan(" ",4).tengah("  No:$prefix$terakhir",1).kanan(" ",1)."\n";
	$isi .= $initialized2;
	$isi .= chr(0).tengah("",35).kanan(" ",1)."\n";
  $isi .= tengah("    Silahkan Menunggu Antrian",35).kanan(" ",1)."\n";
  $isi .= tengah("    Terima kasih",35).kanan(" ",1)."\n".chr(29).chr(86).chr(66).chr(0);
  $isi .= $initialized2;

  $tmp = date('siHdm');
  header('Content-Type: application/x-download');
  header('Content-Disposition: inline; filename="antrian'.$tmp.'.glb2"');
  header('Cache-Control: private, max-age=0, must-revalidate');
  header('Pragma: public');
  echo $isi;
//$initialized2;
}

function set_antrian() {
	$jumlah = (int) $_REQUEST['jumlah'];
	$tgl = date('Y-m-d');
	$s = "SELECT TGL, TombolID, Nomer, LogID FROM log_daftar WHERE TGL = '{$tgl}' AND TombolID = 'A1' LIMIT 1";
	$r = _query($s);
	$log = _fetch_array($r);

	if (empty($log)) {
		$s = "INSERT INTO log_daftar(TGL,TombolID,Nomer) VALUES ('{$tgl}','A1','{$jumlah}')";
		$r = _query($s);
	} else {
		$s = "UPDATE log_daftar SET Nomer = {$jumlah}, Progress = 0 WHERE LogID = '{$log['LogID']}' LIMIT 1";
		$r = _query($s);
	}

	$resp = array(
		'code' => 200,
		'status' => 'OK'
	);

	header('Status: 200 OK');
	header('Content-Type: application/json');
	echo json_encode($resp);
	exit;
}
