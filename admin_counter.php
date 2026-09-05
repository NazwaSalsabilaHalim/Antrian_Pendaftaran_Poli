<?php
// Started by Dewo, 31/10/2011
session_start();

include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";

$exe = (empty($_REQUEST['exe']))? 'list_counter' : $_REQUEST['exe'];

switch($exe) {
  case 'list_counter' : list_counter(); break;
  case 'data_counter' : data_counter(); break;
  case 'ambil_data_counter' : ambil_data_counter(); break;
  case 'simpan_counter' : simpan_counter(); break;
}

function list_counter() {
?>

<div id="header_counter">
<input type=button id="at_tambah" name="at_tambah"
  value="Tambah Counter" 
  onclick="fn_edit_counter('0','0','0')" />
<Input type=button id="at_refresh" name="at_refresh"
  value="Refresh" 
  onclick="refresh_data_counter()" />
</div>

<div id="data_counter">...</div>

<div id="div_frm_edit_counter" title="Edit Tombol">
  <p class="validateTips"></p>
  
  <form id="frm_edit_counter" name="frm_edit_counter">
  <fieldset>
  <input type=hidden id="MD" name="MD" readonly />
  <input type=hidden id="ID" name="ID" readonly />
  <label for="CounterID">Kode Counter:</label>
  <input type=text id="CounterID" name="CounterID" />
  <br />
  
  <label for="NamaCounter">Nama Counter:</label>
  <input type=text id="NamaCounter" name="NamaCounter" />
  <br />
  
  <label for="TombolID2">Gunakan Tombol:</label>
  <input type=text id="TombolID2" name="TombolID2" />
  <br />
  
  <label for="Display">Nomer Display:</label>
  <input type=text id="Display" name="Display" size=3 />
  <font color="maroon">*) Isikan dengan angka 1-10</font>
  
  </fieldset>
  </form>
</div>

<script>
$(function() {
  refresh_data_counter();
  $('#TombolID2').autocomplete({
    source: "admin_cari_tombol.php",
    minLength: 2
  });
  $("#div_frm_edit_counter").dialog({
    autoOpen: false,
    height: 250,
    width: 400,
    modal: true,
    buttons: {
      "Simpan" : function() {
        updateTips('Proses menyimpan...');
        var CounterID = $('#CounterID').val(),
            MD = $('#MD').val(),
            Nama = $('#NamaCounter').val(),
            TombolID = $('#TombolID2').val(),
            Disp = $('#Display').val(),
            ID = $('#ID').val();
            
            if(CounterID=='' || Nama=='' || TombolID=='' || Disp==''){
             alert('Form Isian belum lengkap !');
             updateTips('Lengkapi isian form :');
            }else{
                           
        $.post('admin_counter.php',
          {
          'exe':'simpan_counter',
          'MD':MD,
          'CounterID':CounterID,
          'Nama':Nama,
          'TombolID':TombolID,
          'ID':ID,
          'Display':Disp
          },
          function(ret) {
            if (ret = 'OK') {
              updateTips('Tersimpan');
              refresh_data_counter();
              $('#div_frm_edit_counter').dialog('close');
            }else if(ret = 'ada'){
              alert('Data Kombinasi Counter dan Tombol sudah ada !');
            }
            else updateTips(ret); 
            
          }
        );
     }
      },
      "Tutup" : function() {
        $(this).dialog('close');
      }
    }
  });
});

function ambil_data_counter(id,tid,cid) {
  $('#frm_edit_counter').imPagePopulate({
    data_url: 'admin_counter.php?exe=ambil_data_counter&tid='+tid+'&cid='+cid+'&id='+id,
    db_map: [ 
      {'name':'CounterID', 'db_field':'CounterID', 'form':true},
      {'name':'NamaCounter', 'db_field':'Nama', 'form':true},
      {'name':'TombolID2', 'db_field':'TombolID', 'form':true},
      {'name':'ID', 'db_field':'ID', 'form':true},
      {'name':'Display', 'db_field':'Display', 'form':true}
    ]
  });
}

//start function
function fn_edit_counter(id,tid,cid) {
  $('.validateTips').text('');
  if (id=='0' && tid == '0' && cid == '0') {
    $('#MD').val('0');
    $('#div_frm_edit_counter').dialog({title:'Tambah Tombol'});
    reset_data_counter(tid);
    $('#CounterID').removeAttr('readonly');
  }
  else {
    $('#MD').val('1');
    $('#ID').val(id);
    $('#div_frm_edit_counter').dialog({title:'Edit Tombol'});
    ambil_data_counter(id,tid,cid);
    $('#CounterID').attr('readonly', 'true');
  }
  $('#div_frm_edit_counter').dialog('open');
} // end else

function refresh_data_counter() {
  $('#data_counter').text('Reload...');
  $('#data_counter').load('admin_counter.php?exe=data_counter');
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

function reset_data_counter(tid) {
  $('#CounterID').val('');
  $('#NamaCounter').val('');
  $('#TombolID2').val('');
  $('#Display').val('1');
}
</script>

<?php
}

function data_counter() {
  echo <<<ESD
  <table class="table_data">
  <tr><th width=40>No</th>
    <th width=40>Edit</th>
    <th width=80>Kode</th>
    <th width=180>Nama Counter</th>
    <th width=150>Gunakan Tombol</th>
    <th width=80>No.Display</th>
  </tr>
ESD;
  $s = "select * from counter where NA = 'N' order by CounterID ";
  $r = _query($s);
  
  $n = 0;
  while ($w = _fetch_array($r)) {
    $n++;
    echo "<tr>
      <td>$n</td>
      <td><a href='#' onclick=\"fn_edit_counter('$w[ID]','$w[CounterID]','$w[TombolID]')\">Edit</a></th>
      <td>$w[CounterID]</td>
      <td>$w[Nama]</td>
      <td>$w[TombolID]</td>
      <td>$w[Display]</td>
      </tr>";
  }
  echo "</table>";
}

function simpan_counter() {
  $MD        = $_REQUEST['MD'];
  $ID        = $_REQUEST['ID'];
  $CounterID = $_REQUEST['CounterID'];
  $Nama      = $_REQUEST['Nama'];
  $TombolID  = $_REQUEST['TombolID'];
  $Display   = $_REQUEST['Display'] +0;
  
  if ($MD == '0') {     
    // Cek dulu
    $ada = GetaField("counter","TombolID='".$TombolID."' and CounterID",$CounterID,"CounterID");
    if ($ada) echo "ada";
    else {
      $s = "insert into counter (CounterID, Nama, TombolID, Display, NA) 
            values ('$CounterID', '$Nama', '$TombolID', '$Display', 'N')";
      if (_query($s)) echo "OK";
      else echo _mysql_error();
    }
  }
  else {
     $ada = GetaField("counter","TombolID='".$TombolID."' and CounterID",$CounterID,"CounterID");
     if ($ada) echo "ada";
     else{  $s = "update counter 
                  set Nama = '$Nama', 
                  TombolID = '$TombolID',
                  Display  = '$Display'
                  where ID = '$ID' ";
       if (_query($s)) echo "OK";
       else echo _mysql_error();
     }
  }
}

function ambil_data_counter() {
  $id = $_REQUEST['id'];
  //$tid = $_REQUEST['tid'];
  //$cid = $_REQUEST['cid'];
  //$d = GetFields("counter","TombolID='".$cid."' and CounterID",$tid,"*");
  $d = GetFields("counter","ID",$id,"*");
  echo '[' . json_encode($d) . ']';
}
?>

