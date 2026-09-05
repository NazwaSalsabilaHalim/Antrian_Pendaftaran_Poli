<?php
// Started by Dewo, 31/10/2011
session_start();

include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

$exe = (empty($_REQUEST['exe']))? 'list_tombol' : $_REQUEST['exe'];

switch($exe) {
  case 'list_tombol' : list_tombol(); break;
  case 'data_tombol' : data_tombol(); break;
  case 'ambil_data_tombol' : ambil_data_tombol(); break;
  case 'simpan_tombol' : simpan_tombol(); break;
}

function list_tombol() {
?>

<div id="header_tombol">
<input type=button id="at_tambah" name="at_tambah"
  value="Tambah Tombol" 
  onclick="fn_edit_tombol('0')" />
<Input type=button id="at_refresh" name="at_refresh"
  value="Refresh" 
  onclick="refresh_data_tombol()" />
</div>

<div id="data_tombol">...</div>

<div id="div_frm_edit_tombol" title="Edit Tombol">
  <p class="validateTips"></p>
  
  <form id="frm_edit_tombol" name="frm_edit_tombol">
  <fieldset>
  <input type=hidden id="MD" name="MD" readonly />
  <label for="TombolID">Kode Tombol:</label>
  <input type=text id="TombolID" name="TombolID" />
  <br />
  
  <label for="NamaTombol">Nama Tombol:</label>
  <input type=text id="NamaTombol" name="NamaTombol" />
  <br />
  
  </fieldset>
  </form>
</div>

<script>
$(function() {
  refresh_data_tombol();
  $("#div_frm_edit_tombol").dialog({
    autoOpen: false,
    height: 250,
    width: 400,
    modal: true,
    buttons: {
      "Simpan" : function() {
        updateTips('Proses menyimpan...');
        var TombolID = $('#TombolID').val(),
            MD = $('#MD').val(),
            NamaTombol = $('#NamaTombol').val();
        $.post('admin_tombol.php',
          {
          'exe':'simpan_tombol',
          'MD':MD,
          'TombolID':TombolID,
          'Nama':NamaTombol
          },
          function(ret) {
            if (ret = 'OK') {
              updateTips('Tersimpan');
              refresh_data_tombol();
              $('#div_frm_edit_tombol').dialog('close');
            }
            else updateTips(ret);
          }
        );
      },
      "Tutup" : function() {
        $(this).dialog('close');
      }
    }
  });
});

function ambil_data_tombol(tid) {
  $('#frm_edit_tombol').imPagePopulate({
    data_url: 'admin_tombol.php?exe=ambil_data_tombol&tid=' + tid,
    db_map: [ 
      {'name':'TombolID', 'db_field':'TombolID', 'form':true},
      {'name':'NamaTombol', 'db_field':'Nama', 'form':true}
    ]
  });
}

function fn_edit_tombol(tid) {
  $('.validateTips').text('');
  if (tid == '0') {
    $('#MD').val('0');
    $('#div_frm_edit_tombol').dialog({title:'Tambah Tombol'});
    reset_data_tombol(tid);
    $('#TombolID').removeAttr('readonly');
  }
  else {
    $('#MD').val('1');
    $('#div_frm_edit_tombol').dialog({title:'Edit Tombol'});
    ambil_data_tombol(tid);
    $('#TombolID').attr('readonly', 'true');
  }
  $('#div_frm_edit_tombol').dialog('open');
}

function refresh_data_tombol() {
  $('#data_tombol').text('Reload...');
  $('#data_tombol').load('admin_tombol.php?exe=data_tombol');
}

function updateTips( t ) {
  var tips = $( ".validateTips" );
  tips
  .text( t )
  .addClass( "ui-state-highlight" );
  setTimeout(function() {
    tips.removeClass( "ui-state-highlight", 1500 );
  }, 500 );
}

function reset_data_tombol(tid) {
  $('#TombolID').val('');
  $('#Nama').val('');

}
</script>

<?php
}

function data_tombol() {
  echo <<<ESD
  <table class="table_data">
  <tr><th width=40>No</th>
    <th width=40>Edit</th>
    <th width=80>Kode</th>
    <th width=300>Nama Tombol</th>
  </tr>
ESD;
  $s = "select * from tombol where NA = 'N' order by Nama ";
  $r = _query($s);
  
  $n = 0;
  while ($w = _fetch_array($r)) {
    $n++;
    echo "<tr>
      <td>$n</td>
      <td><a href='#' onclick=\"fn_edit_tombol('$w[TombolID]')\">Edit</a></th>
      <td>$w[TombolID]</td>
      <td>$w[Nama]</td>
      </tr>";
  }
  echo "</table>";
}

function simpan_tombol() {
  $MD = $_REQUEST['MD'];
  $TombolID = $_REQUEST['TombolID'];
  $Nama = $_REQUEST['Nama'];
  
  if ($MD == '0') {
    // Cek dulu
    $ada = GetaField('tombol', 'TombolID', $TombolID, 'TombolID');
    if ($ada) echo "Error: Kode tombol sudah ada. Gunakan kode lain.";
    else {
      $s = "insert into tombol (TombolID, Nama, NA) values ('$TombolID', '$Nama', 'N')";
      if (_query($s)) echo "OK";
      else echo _mysql_error();
    }
  }
  else {
    $s = "update tombol set Nama='$Nama' where TombolID = '$TombolID' ";
    if (_query($s)) echo "OK";
    else echo _mysql_error();
  }
}

function ambil_data_tombol() {
  $tid = $_REQUEST['tid'];
  $d = GetFields('tombol', 'TombolID', $tid, '*');
  echo '[' . json_encode($d) . ']';
}
?>

