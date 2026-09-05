<?php
// Started by Dewo, 01/11/2011
session_start();
?>

<HTML>
<HEAD>
  <TITLE>Display Antrian</TITLE>
  <link rel="stylesheet" type="text/css" href="index.css" />
  <script type="text/javascript" src="jquery-1.6.2.min.js"></script>
  <link rel="stylesheet" type="text/css" href="jquery-ui-1.8.16.custom.css" />
  <script type="text/javascript" src="jquery-ui-1.8.16.custom.min.js"></script>
</HEAD>

<BODY>
<h1>Antrian Pendaftaran</h1>

<div id="div_display"></div>
<div id="div_footer_display">
  Group RS Awal Bros. Reset Display: <input type=button onclick="fn_reset_display()" value="Reset" />
</div>

<script>
$(function() {
  fn_reload_display();
  fn_cek_display();
});

function fn_reload_display() {
  $('#div_display').load('display_lib.php');
}

function fn_cek_display() {
  $.get("display_lib.php?exe=cek_antrian",
    function(res) {
      if (res == 'OK') setInterval("fn_reload_display()", 10000);
      else $('#div_footer_display').html("Antrian Off");
    }
  );
}

function fn_reset_display() {
  $.post("display_lib.php?exe=reset_antrian",
    function(res) {
      if (res == 'OK') {
        window.setTimeout('location.reload()', 100);
      }
      else alert(res);
    }
  );
}
</script>

</BODY>
</HTML>
