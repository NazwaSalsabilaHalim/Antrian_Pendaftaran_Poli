<?php
// Started by Dewo, 31/10/2011

session_start();
include "db.mysql.php";
include "connectdb.php";
include "dwo.lib.php";


?>
<!DOCTYPE html>
<HTML>
<HEAD>
  <TITLE>Anjungan Antrian Pendaftaran</TITLE>
  <link rel="stylesheet" type="text/css" href="jquery-ui.min.css" />
  <link rel="stylesheet" type="text/css" href="jquery-ui.structure.min.css" />
  <link rel="stylesheet" type="text/css" href="jquery-ui.theme.min.css" />
  <link rel="stylesheet" type="text/css" href="index.css" />
  <script type="text/javascript" src="jquery-1.11.1.min.js"></script>
  <script type="text/javascript" src="jquery-ui.min.js"></script>
</HEAD>

<BODY>
<!--
<table>
<tr><td>
<img id="image1" src="logorsabpku.jpg" width="300px" height="160px" align="left"></td><td width="960px" align="right"><img id="image3" src="logoiso.jpg" width="350px" height="140px" align="right"><img id="image2" src="logoakreditasi.jpg" width="350px" height="140px" align="right">
</td></tr>
</table>
-->

<div class="container">

  <h1>Antrian Pendaftaran </h1>

  <h1>Pelanggan yang terhormat jika anda pasien baru pastikan anda sudah mengisi link barcode pasien baru</h1>

  <p style="text-align:center">
  Silahkan tekan tombol di bawah ini untuk mencetak Antrian Pendaftaran </p>


  <div id="div_btn">...</div>
  <div id="div_dlg" title="Cetak Antrian"></div>
  <div id="div_footer_counter">
    <a class="button button-rounded button-action" href="counter.php">Counter</a>
    <a class="button button-rounded button-action" href="display/" target="_blank">Display</a>
    <!--
    <input class="button button-rounded" type="button" onclick="return setAntrian(jQuery(this), jQuery.Event(event));" value="Set Antrian">
    <input class="button button-rounded" type="button" onclick="fn_reset_daftar()" value="Reset Daftar" />
     -->
  </div>

 

  <div id="dialog-set-antrian" title="Set Jumlah Antrian" style="display: none;">
    <form action="index_btn.php" method="post">
      <div class="form-group">
        <label for="jumlah">Jumlah Antrian</label>
        <input id="jumlah" type="text" name="jumlah">
        <input type="hidden" name="exe" value="set_antrian">
      </div>
    </form>
  </div>

  <marquee style="display: none;">Selamat datang di Rumah Sakit Awal Bros Yasmine. Silahkan mengambil Nomor Antrian anda</marquee>

</div>


<script>
$(function() {
  $('#div_btn').load('index_btn.php');

  $('#div_dlg').dialog({
    autoOpen: false,
    height: 400,
    width: 560,
    modal: true,
    buttons: {
      'Tutup' : function() {
        $(this).dialog('close');
      }
    }
  });
});

function tampilkan(disp){
	$('#div_btn').load('index_btn.php?exe=tampilkan_tombol&Disp='+disp);
	$('#div_footer_counter').hide();
}

//function cetak(i,tombol,no) {
  //window.open('index_btn.php?exe=cetak_struk&tid='+i+'&tombol='+tombol+'&no='+no);
//}



function tampil(i,p){
  //$('#div_dlg').load('index_btn.php?exe=cetak_antrian&tid='+i).dialog('open');
  // modified : heru.w 21 jan 2013
  $('#div_dlg').load('index_btn.php?exe=cetak_antrian&tid='+i+'&prefix='+p).dialog('open');
  setTimeout(function(){  $('#div_dlg').hide('slow').dialog('close');},1000);
}

function fn_reset_daftar() {
  $.post("index_btn.php?exe=reset_daftar",
    function(res) {
      if (res == 'OK') {
        window.setTimeout('location.reload()', 100);
      }
      else alert(res);
    }
  );
}

function setAntrian(elem, e) {
	var dialog = $('#dialog-set-antrian');
	var form = dialog.find('form:first');

	dialog.dialog({
		autoOpen: false,
		modal: true,
		buttons: [
			{
				text: "Set",
				click: function() {
					var jumlah = $('#jumlah', this).val();
					if (jumlah.toString() == '') {
						alert("Anda harus menginput jumlah nomor antrian.");
					} else if (!jumlah.match(/[0-9]+/g)) {
						alert("Anda harus menginput angka pada nomor antrian.");
					} else {
						var formData = form.serialize(),
								$this = $(this);

						$.ajax({
							url: form.attr('action'),
							type: "POST",
							data: formData,
							dataType: "json",
							success: function(d, s, XHR) {
								$this.dialog("close");

								// Redirect ke halaman Counter
								window.location.replace('counter.php');
							}
						});
					}

					return false;
				}
			},
			{
				text: "Batal",
				click: function() {
					$(this).dialog('close');
				}
			}
		],
		show: "puff",
		hide: "puff"
	});

	dialog.dialog('open');
}

</script>

</BODY>
</HTML>
