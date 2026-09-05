<?php
/**
 * mysql_compat.php
 * "Penerjemah" fungsi mysql_*() (dihapus sejak PHP 7) ke mysqli_*() yang setara,
 * supaya kode lama (db.mysql.php, dkk) tetap bisa jalan tanpa diubah.
 *
 * Cara pakai: taruh file ini SEJAJAR db.mysql.php, lalu tambahkan satu baris
 * paling atas di db.mysql.php (persis setelah "<?php"):
 *   require_once __DIR__ . '/mysql_compat.php';
 */

if (!function_exists('mysql_pconnect')) {
  $GLOBALS['__mysqli_conn'] = null;

  function mysql_pconnect($host, $user, $pass) {
    $GLOBALS['__mysqli_conn'] = mysqli_connect($host, $user, $pass);
    return $GLOBALS['__mysqli_conn'];
  }

  function mysql_connect($host, $user, $pass) {
    return mysql_pconnect($host, $user, $pass);
  }

  function mysql_select_db($db, $conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return mysqli_select_db($c, $db);
  }

  function mysql_query($q, $conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return mysqli_query($c, $q);
  }

  function mysql_error($conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return $c ? mysqli_error($c) : mysqli_connect_error();
  }

  function mysql_fetch_array($result) {
    return $result ? mysqli_fetch_array($result) : false;
  }

  function mysql_num_rows($result) {
    return $result ? mysqli_num_rows($result) : 0;
  }

  function mysql_fetch_row($result) {
    return $result ? mysqli_fetch_row($result) : false;
  }

  function mysql_num_fields($result) {
    return $result ? mysqli_num_fields($result) : 0;
  }

  function mysql_field_name($result, $pos = 0) {
    $f = mysqli_fetch_field_direct($result, $pos);
    return $f ? $f->name : null;
  }

  function mysql_affected_rows($conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return mysqli_affected_rows($c);
  }

  function mysql_result($result, $row, $field = 0) {
    mysqli_data_seek($result, $row);
    $data = mysqli_fetch_array($result);
    return $data[$field] ?? null;
  }

  function mysql_escape_string($s) {
    $c = $GLOBALS['__mysqli_conn'];
    return $c ? mysqli_real_escape_string($c, $s) : addslashes($s);
  }

  function mysql_real_escape_string($s, $conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return mysqli_real_escape_string($c, $s);
  }

  function mysql_insert_id($conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return mysqli_insert_id($c);
  }

  function mysql_close($conn = null) {
    $c = $conn ?: $GLOBALS['__mysqli_conn'];
    return mysqli_close($c);
  }
}
