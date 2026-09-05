<?php
// Author: Emanuel Setio Dewo
// Desember 2005
require_once __DIR__ . '/mysql_compat.php';

function _connect($h, $u, $p) {
  $r = mysql_pconnect($h, $u, $p) or die("Gagal terkoneksi dengan database server <b>$h</b>");
  return $r;
}
function _select_db($db, $con) {
  return mysql_select_db($db, $con) or die("Gagal membuka database <b>$db</b>.");
}
function _query_x($s='') {
  $r = mysql_query($s) or die("Gagal: <pre>$s</pre><br>".mysql_error());
  return $r;
}

function _query($s='') {
  mysql_query("BEGIN");
  $r = mysql_query($s) or die("Gagal: <pre>$s</pre><br>".mysql_error());
  
  if(!$r){
        mysql_query("ROLLBACK");
        echo "<script>alert('database rolled back')</script>";
        exit;
  }else{
        mysql_query("COMMIT");
        return $r;
  }
  
}

function _fetch_array($r) {
  $w = mysql_fetch_array($r);
  return $w;
}
function _num_rows($r) {
  return mysql_num_rows($r);
}
function _fetch_row($r) {
  return mysql_fetch_row($r);
}
function _num_fields($r) {
  return mysql_num_fields($r);
}
function _field_name($r, $pos=0) {
  return mysql_field_name($r, $pos);
}
function _affected_rows() {
  return mysql_affected_rows();
}
function _result($r, $brs=0, $fld='') {
  $w = mysql_result($r, $brs, $fld);
  return $w;
}

//kill appostrove
function _appostrove($s='') {
  $r = mysql_escape_string($s);
  return $r;
}

function _escape_string($s='') {
  $r = mysql_real_escape_string($s);
  return $r;
}
// additional function by fajar
function _insert_id() {
  $w = mysql_insert_id();
  return $w;
}

function _close(){
 return mysql_close();
}
?>
