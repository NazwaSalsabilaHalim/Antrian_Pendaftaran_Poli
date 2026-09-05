<?php
// Started by Dewo, 01/11/2011

session_start();
include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

$Antrian = GetSetVar('Antrian');
$exe = (empty($_REQUEST['exe']))? 'list_antrian' : $_REQUEST['exe'];

switch ($exe) {
  case 'list_antrian' : list_antrian(); break;
  case 'set_antrian' : set_antrian(); break;
  case 'tampilkan_antrian' : tampilkan_antrian(); break;
  case 'reset_antrian' : reset_antrian(); break;
  case 'cek_antrian' : cek_antrian(); break;
}

function list_antrian() {
  if (empty($_SESSION['Antrian'])) pilih_antrian();
  else tampilkan_antrian();
}

function pilih_antrian() {
  echo <<<ESD
  <p>Pilih nomer display antrian terlebih dahulu.</p>
  <div style="text-align:center">
  <label>Nomer Display:</label>
  <input type=text id='DispAntrian' name='DispAntrian' size=3 />
  <input type=button id='btn_submit_disp_antrian' name='btn_submit_disp_antrian'
    value='Tampilkan Antrian' 
    onclick="fn_submit_antrian()" />
  </div>
  
  <script>
  $(function() {
    $('#DispAntrian').keydown(function(event) {
      if (event.keyCode == 46 || event.keyCode == 8) {
      }
      else {
        if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
          event.preventDefault(); 
        } 
      }
    });
  });
  
  function fn_submit_antrian() {
    var Disp = $('#DispAntrian').val();
    $.post("display_lib.php?exe=set_antrian&disp=" + Disp,
      function(res) {
        if (res = 'OK') {
          window.setTimeout('location.reload()', 100);
        }
        else alert(res);
      }
    );
  }
  </script>
ESD;
}

function set_antrian() {
  $disp = $_REQUEST['disp']+0;
  $ada = GetaField("counter", "Display", $disp, "count(CounterID)")+0;
  if ($ada > 0) {
    $_SESSION['Antrian'] = $disp;
    echo "OK";
  }
  else echo "Error: Display $disp tidak terdaftar.";
}

function tampilkan_antrian() {
  $s = "select * 
    from counter 
    where Display = '$_SESSION[Antrian]' 
    and   NA = 'N'
    order by Nama";
  $r = _query($s);
  $panah = "&#8658;";
  while ($w = _fetch_array($r)) {
    echo "<button id='$w[CounterID]'>
    <font color='red' size=+6>$w[Progress]</font>
    <font color='blue'>$panah</font>
    $w[Nama]</button>";
  }
  $tgl = date('d/m/Y H:i');
  echo "<p>$tgl</p>";
}

function reset_antrian() {
  session_destroy();
  echo "OK";
}

function cek_antrian() {
  if ($_SESSION['Antrian'] > 0) echo "OK";
}
?>
