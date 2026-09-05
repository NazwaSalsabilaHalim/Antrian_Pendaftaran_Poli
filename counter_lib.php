<?php
// @DEBUG
ini_set('display_errors', 'On');
ini_set('error_reporting', E_ALL & ~E_NOTICE /*& ~E_WARNING*/ & ~E_STRICT & ~E_DEPRECATED);
ini_set('xdebug.var_display_max_data', -1);
ini_set('xdebug.var_display_max_depth', -1);

// Started by Dewo, 01/11/2011

session_start();
include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

$Counter = GetSetVar('Counter');
$exe = (empty($_REQUEST['exe']))? 'list_counter' : $_REQUEST['exe'];

switch ($exe) {
  case 'list_counter'  : list_counter();  break;
  case 'set_display'   : set_display();   break;
  case 'reset_counter' : reset_counter(); break;
  case 'tekan_counter' : tekan_counter(); break;
  case 'total'         : total();         break;
  case 'ddownCounter'  : ddownCounter();  break;
  case 'panggil_ulang' : panggil_ulang(); break;
}


function total() {
  $tgl=date('Y-m-d');
  $sql = "SELECT a.*, b.Nama as tombol from log_daftar a LEFT JOIN tombol b ON a.TombolID=b.TombolID WHERE a.TGL='$tgl'";
  $qry = _query($sql);
  while ($dat = _fetch_array($qry)){
    $sisa = $dat['Nomer']-$dat['Progress'];
    echo '<tr>';
    echo "<td>Total Pendaftar  ".ucwords(strtolower($dat['tombol']))."</td>";
    echo "<td>: ".$dat['Nomer']."</td>";
    echo "</tr>";
    echo "<tr>";
    echo "<td>Sisa Pendaftar</td>";
    echo "<td>: ".$sisa."</td>";
    echo '</tr>';
  }
}

function list_counter() {
  if (empty($_SESSION['Counter'])) pilih_display();
  else tampilkan_counter();
}

function ddownCounter($return = false){
  $disp = 1;

  $l_dt = '<option value="">PILIH COUNTER</option>';
  $s = "SELECT DISTINCT(CounterID), Nama FROM counter WHERE Display ='$disp' AND NA='N' ORDER BY Nama";
  $r = _query($s);
  $jum = _num_rows($r);
  if($jum > 0)
  {
    while($data = _fetch_array($r))
    {
      $l_dt .= "<option value='".$data['CounterID']."'>".$data['Nama']."&nbsp;</option>";
    }
  }
  else
  {
    $l_dt .= "<option value=''>Pilih display dahulu&nbsp;</option>";
  }

  if ($return) {
    return $l_dt;
  }

  echo $l_dt;

} // end function

function tampilkan_counter() {
  /*
  $s = "select *
    from counter
    where Display = '$_SESSION[Counter]'
    and CounterID   = '$_SESSION[BtnCounter]'
    and   NA = 'N'
    order by Nama";
   */

  /**
  $s = "select *
    from counter
    where Display = 1 AND CounterID = '" . $_SESSION['BtnCounter'] . "'
    and   NA = 'N'
    order by Nama LIMIT 1";
   */
  $s = "SELECT * FROM tombol WHERE NA = 'N'";
  $r = _query($s);

  $loket = $_SESSION['BtnCounter'] ;

  while ($w = _fetch_array($r)) {
    //echo "<button id='$w[TombolID]' onclick=\"fn_tekan('$w[CounterID]','$w[TombolID]')\">$w[Nama]</button>";
    echo '<div class="tombol_container">';
    echo "<button id=\"$w[TombolID]\" class=\"button button-rounded button-primary button-counter\" onclick=\"fn_tekan('$loket','$loket','$w[TombolID]')\">$w[Nama]</button>";
    echo "<button id=\"panggil_{$w['TombolID']}\" class=\"button button-rounded button-action button-restart\" onclick=\"fn_panggil_ulang('$loket','$w[TombolID]', $(this), $.Event(event))\" title=\"Panggil Ulang\" data-panggil-id=\"\" disabled><i class=\"fa fa-volume-up\"></i></button>";
    echo '</div>';
  }
  echo "<script> $('#counterz').html('".$_SESSION['BtnCounter']."'); </script>";
} // end function



function pilih_display() {

  echo "
  <p>Pilih counter terlebih dahulu.</p>
  <div style='text-align:center'>
  ";
  ////combo display
  $s = "select distinct(Display) from counter where NA = 'N'";
  $r = _query($s);
  $opt = "<option value=''>PILIH DISPLAY</option>";

  while ($w = _fetch_array($r)) {

    $opt .= "<option value='$w[Display]'>DISPLAY $w[Display]</option>";
  }
  echo "
  <!--
  <select id='Disp' name='Disp' onchange='ShowCounter()'>".$opt."</select>
  <select id='Count' name='Count'>
  <option value=''>PILIH COUNTER</option>
  <option value=''>Pilih display dahulu</option>
  </select>
  -->

  <select id='Count' name='Count'>" . ddownCounter(true) . "</select>
  <input id=\"Disp\" type=\"hidden\" name=\"Disp\" value=\"1\">

  <input type=button id='btn_submit_disp' name='btn_submit_disp' value='Tampilkan Counter'
    onclick='fn_submit_disp()' />
  </div>

  <script>
  $(function() {
    $('#Disp').keydown(function(event) {
      if (event.keyCode == 46 || event.keyCode == 8) {
      }
      else {
        if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
          event.preventDefault();
        }
      }
    });
  });

  function fn_submit_disp() {
    var Disp  = $('#Disp').val();
    var Count = $('#Count').val();

    if((Disp=='')||(Count=='')){
    alert('Pilih Display Dan Counter Terlebih Dahulu !');
    }else{
    $.post('counter_lib.php?exe=set_display&disp='+Disp+'&count='+Count,
      function(res) {
        if (res = 'OK') {
          window.setTimeout('location.reload()', 100);
        }
        else alert(res);
      }
    );
    }

  }


  function ShowCounter(){
        var disp = $('#Disp').val();
	$('#Count').load('counter_lib.php?exe=ddownCounter&disp='+disp);
  }

  </script>
";
}

function set_display() {
  $disp  = 1;
  $count = $_REQUEST['count'];
  //$ada = GetaField("counter", "CounterID='".$count."' and Display", $disp, "count(CounterID)")+0;
  $ada = GetaField("counter", "Display", $disp, "count(CounterID)")+0;

  if ($ada > 0) {
    $_SESSION['Counter']    = $disp;
    $_SESSION['BtnCounter']  = $count;
    echo "OK";
  }
  else echo "Error: Display $disp tidak terdaftar.";
}

function reset_counter() {
  session_destroy();
  echo "OK";
}

function tekan_counter() {
  $panah = "&#8658;";
  $i = $_REQUEST['i']; // counterID
  $x = $_REQUEST['x']; // tombolID
  $a = $_REQUEST['a']; // tombol loket

  // Ambil data counter
  $cnt = GetFields('counter','CounterID',$i,'*');
  $tombol = GetFields('tombol', "TombolID = '{$x}' AND NA", 'N', '*');
  $prefix = '';
  if ($tombol['Prefix'] !== '') {
    $prefix = $tombol['Prefix'];
  }
  //$cnt = GetFields('counter','TombolID',$x,'*');
  // Ambil data antrian
  $tgl = date('Y-m-d');
  $ant = GetFields('log_daftar', "TGL='$tgl' and TombolID", $x, '*');
  $nm = $tombol['Nama'];
  $pr = $ant['Progress'];

  $PanggilID = null;

  if ($ant['Progress'] >= $ant['Nomer']) {
    // echo "$nm $panah $prefix$pr (TUNGGU)";
    $text = "{$nm} {$panah} {$prefix}{$pr} (TUNGGU)";
  }
  else {
    $nomer = $ant['Progress']+ 1;
    // Update log_daftar
    $s = "update log_daftar
      set Progress = '$nomer'
      where TGL = '$tgl'
      and TombolID = '$x'";
    $r = _query($s);
    // Update counter
    $s = "update counter
      set TGL = '$tgl',
          Progress = '$nomer'
      where CounterID = '$i' ";
    $r = _query($s);

    //insert to panggil
    $p = "insert into panggil
          set Tgl       = '$tgl',
          CounterID     = '$i',
          TombolID      = '$cnt[TombolID]',
          Display       = '$cnt[Display]',
          Prefix        = '$tombol[Prefix]',
          Nama          = '$tombol[Nama]',
          Nomor         = '$nomer',
          TanggalInsert = NOW()
         ";
    $r = _query($p);

    $qID = "SELECT LAST_INSERT_ID()";
    $rID = _query($qID);
    $dtID = _fetch_array($rID);
    $PanggilID = (int) $dtID[0];

    // Tampilkan antrian
    // echo "$tombol[Nama] $panah $prefix$nomer";
    $text = "{$nm} {$panah} {$prefix}{$nomer}";
  }

  header('Status: 200 OK');
  header('Content-Type: application/json');
  echo json_encode(array(
    'code' => 200,
    'status' => 'OK',
    'text' => $text,
    'panggil_id' => $PanggilID,
  ));
  exit;
}

function panggil_ulang()
{
  $PanggilID = (int) $_REQUEST['panggil_id'];

  $q = "UPDATE panggil SET
    Panggil = 'N',
    PanggilUlang = 'Y',
    TanggalPanggil = '0000-00-00 00:00:00'
    WHERE ID = '"._appostrove($PanggilID)."' LIMIT 1";
  $code = 500;
  $status = 'Internal Server Error';
  if (($r = _query($q)) === true) {
    $code = 200;
    $status = "OK";
  }

  header("Status: {$code} {$status}");
  header("Content-Type: application/json");
  echo json_encode(array(
    'code' => $code,
    'status' => $status,
    'success' => (bool) $r,
  ));
  exit;
}
