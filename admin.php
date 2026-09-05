<?php
// Started by Dewo
session_start();



?>

<HTML>
<HEAD>
<TITLE>Admin Antrian Pendaftaran</TITLE>
<link rel="stylesheet" type="text/css" href="admin.css" />
<link rel="stylesheet" type="text/css" href="jquery-ui-1.8.16.custom.css" />
<script type="text/javascript" src="jquery-1.6.2.min.js"></script>
<script type="text/javascript" src="jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="jquery.imPagePopulate.js"></script>

</HEAD>

<BODY>
<H2>Admin Antrian Pendaftaran</H2>

<div class='antrian_pendaftaran'>
  <div id='tab_pendaftaran'>
  <ul>
    <li><a href="admin_tombol.php">Tombol Pendaftaran</a></li>
    <li><a href="admin_counter.php">Counter Pendaftaran</a></li>
    <li><a href="#tab_help">Bantuan</a></li>
  </ul>
  
  <div id='tab_help'>
  Di modul Admin ini Anda dapat mengatur modul Anjungan Antrian Pendaftaran.
  <ol>
  <li><b>Tombol Pendaftaran</b><br />
      Untuk mendefinisikan tombol-tombol yg akan tampak di
      Anjungan Antrian Pendaftaran (AAP).</li>
  <li><b>Counter Pendaftaran</b><br />
      Untuk mendaftarkan konter2 tempat pasien mendaftarkan diri
      berdasarkan struk antrian pendaftaran.</li>
  </ol>
  </div>
  
  </div>
  
  
</div>

<script>
$(function() {
  $("#tab_pendaftaran").tabs();
});
</script>
</BODY>
</HTML>
