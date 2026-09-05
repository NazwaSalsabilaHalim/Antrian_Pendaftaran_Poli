<?php
  // file: connectdb.php
  // author: E. Setio Dewo, Maret 2003

  $db_username = "yasmin";
  $db_hostname = "localhost";
  $db_password = "yasmin@2026";
  $db_name = "antrian_pendaftaran";

  $con = _connect($db_hostname, $db_username, $db_password);
  $db  = _select_db($db_name, $con);

?>
