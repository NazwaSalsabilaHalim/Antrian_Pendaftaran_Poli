<?php
// Started by Dewo, 01/11/2011
session_start();
?>
<!DOCTYPE html>
<HTML>
<HEAD>
  <TITLE>Counter Pendaftaran</TITLE>
  <link rel="stylesheet" type="text/css" href="jquery-ui.min.css" />
  <link rel="stylesheet" type="text/css" href="jquery-ui.structure.min.css" />
  <link rel="stylesheet" type="text/css" href="jquery-ui.theme.min.css" />
  <link rel="stylesheet" type="text/css" href="index.css" />
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <script type="text/javascript" src="jquery-1.11.1.min.js"></script>
  <script type="text/javascript" src="jquery-ui.min.js"></script>
</HEAD>

<BODY id="counter">

<div class="container">
  <h1>Counter Pendaftaran - <span id="counterz"></span></h1>

  <div id="div_counter"></div>
  <div id="total_counter">
    <table>
    </table>
  </div>
  <div id="div_footer_counter">
    <input class="button button-rounded" type="button" onclick="fn_reset_counter()" value="Reset Counter" />
  </div>
</div>

<script>

$(function() {
  $('#div_counter').load('counter_lib.php');
  setInterval(function() {
    $('#total_counter > table').load('counter_lib.php?exe=total')
  }, 5000);
});

function fn_tekan(a,i,x) {
  $.post("counter_lib.php?exe=tekan_counter&i="+i+"&x="+x+"&a="+a,
    function(res) {
      var tombol = $('#' + x);
      $('#'+x).html(res.text);
      if (res.panggil_id !== null) {
        $('#panggil_' + x).attr('data-panggil-id', res.panggil_id)
          .attr('disabled', false);
      }
    }
  );

}

function fn_reset_counter() {
  $.post("counter_lib.php?exe=reset_counter",
    function(res) {
      if (res == 'OK') {
        window.setTimeout('location.reload()', 100);
      }
      else alert(res);
    }
  );
}

function fn_panggil_ulang(loket, tombolID, tombol, e) {
  e.preventDefault();
  var PanggilID = parseInt(tombol.attr('data-panggil-id'));

  $.ajax({
    url: "counter_lib.php",
    type: "POST",
    data: {
      "exe": "panggil_ulang",
      "panggil_id": PanggilID
    },
    dataType: "json",
    success: function(d, s, XHR) {
    }
  });

  return false;
}

</script>

</BODY>
</HTML>
