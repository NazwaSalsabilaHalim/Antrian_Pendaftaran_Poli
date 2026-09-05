<?php

// Listed by  : Heri
// Start      : Nov 12, 2011 (PKU)

include_once "db.mysql.php";
include_once "connectdb.php";

$act = $_REQUEST['act'];

switch ($act){
	case 'tampilgroup' :
                        tampilgroup();
                        break;
}


function tampilgroup()
{
   $sql="SELECT GroupAntrianID, NamaGroup FROM groupantrian where NA='N'";
   $proses = _query($sql);
   if (_num_rows($proses)>0)
      {
          while ($data=_fetch_array($proses))
          {
              $nilai .="<option value=".$data['GroupAntrianID']."> ".$data['NamaGroup']." </option>"; 
          }
          echo $nilai;
      }
   else
      {
         echo "<option> Group Tidak Ada </option>";
      }   
}

?>
