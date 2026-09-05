<?php
// Started by Dewo, 31/10/2011

include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";
include "printer.php";

$exe = (empty($_REQUEST['exe']))? 'tampilkan_tombol' : $_REQUEST['exe'];

switch($exe) {
  case 'tampilkan_tombol' : tampilkan_tombol(); break;
  case 'cetak_antrian' : cetak_antrian(); break;
  case 'cetak_struk' : setStrukAntrian(); break;
}

function cari_display() {
  if (empty($_SESSION['Daftar'])) pilih_display();
  else tampilkan_tombol();
}

function pilih_display() {
  echo <<<ESD
  <p>Pilih nomer display terlebih dahulu.</p>
  <div style="text-align:center">
  <label>Nomer Display:</label>
  <input type=text id='Disp3' name='Disp3' size=3 />
  <input type=button id='btn_submit_disp' name='btn_submit_disp'
    value='Tampilkan Pendaftaran' 
    onclick="fn_submit_disp2()" />
  </div>
  
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
    var Disp = $('#Disp3').val();
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
  //$disp=$_REQUEST['Disp'];
  $s = "select * from tombol a LEFT JOIN counter b ON a.TombolID= b.TombolID where a.NA='N' AND b.Display='2' order by a.Nama";
  $r = _query($s);
  while ($w = _fetch_array($r)) {
    echo "<button id='$w[TombolID]' onclick=\"tampil('$w[TombolID]');\">$w[Nama]</button>";
  }
  }

function cetak_antrian() {
  $tid = $_REQUEST['tid'];
  $tgl = date('Y-m-d');
 
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
      <h1>1</h1>
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
      <h1>$terakhir</h1>
      Silakan ambil struk antrian.";
  }
  // Add by Domi
 echo "<script> window.open('index_btn2.php?exe=cetak_struk&tid=$tid&tombol=$tombol&no=$terakhir'); </script>";
}

function setStrukAntrian()
{ 
  include "ascii.php";
  $tid = $_REQUEST['tid'];
  $tombol = $_REQUEST['tombol'];
  $terakhir = $_REQUEST['no'];
  $tgl = date('d-m-Y h:i'); 
  //initPage();
  //$_SESSION['mod']=0;

  $isi = '';
  //$isi .= $initialized2.$print10cpi.$doublestrike1;
  $isi .= tengah("RS Awal Bros Tangerang",40).kanan(" ",1)."\n";
  //$isi .= $condensed0.$doublestrike0;
  $isi .= tengah($tgl,40).kanan(" ",1)."\n";
  $isi .= tengah("Antrian $tombol",40).kanan(" ",1)."\n";
  //$isi .= $changefont0.$condensed0.$doublestrike1;
  $isi .= tengah("No. : $terakhir",40).kanan(" ",1)."\n";
  $isi .= tengah("Silahkan Menunggu Antrian",40).kanan(" ",1)."\n";
  $isi .= tengah("Terima kasih",40).kanan(" ",1)."\n";//.chr(29).chr(86).chr(66).chr(0);
  $tmp = date('siHdm');
  header('Content-Type: application/x-download');
  header('Content-Disposition: inline; filename="antrian'.$tmp.'.glb2"');
  header('Cache-Control: private, max-age=0, must-revalidate');
  header('Pragma: public');
  echo $isi;//.$initialized2;
}

?>
