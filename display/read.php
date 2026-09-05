<?php
// Author : Heru Widakdo
// Start  : Tgr,21/01/2013
// Description : Read number (w/h sound) from modul : antrian

$act = $_REQUEST['act'];

switch ($act){
 case 'putar' : putar(); break;
} // end swutch

// start function putar
function putar(){

  $nomer   = $_REQUEST['nomor'];
  $prefix  = $_REQUEST['prefix'];
  $widget  = $_REQUEST['widget'];

  $daftar  = " tingtong ";
  $daftar .= " nomorantrian ";

  //baca prefix
  if($prefix!=''){
    $daftar .= " $prefix ";
  }
  //baca angka
  /*baca belasan*/
  if ($nomer=='0010'){
    $daftar .= "0010 ";
  }else if ($nomer=='0011'){
    $daftar .= "0011 ";
  }else if (substr($nomer,2,1)=="1" and substr($nomer,0,-2)=="0"){
    $angka   = substr($nomer,3);
    $daftar .= "000".$angka." belas ";

    /*baca ratusan*/
  }else if (substr($nomer,1,-2)>"0"){
    //100
    $angka1 = substr($nomer,1,-2);
    $angka2 = substr($nomer,2,1);
    $angka3 = substr($nomer,3);

    $angka  = ($angka1=="1")?"0100":"000".$angka1." ratus"; // se - ratusan
    $angka_ = ($angka2=="1")?"0011":"000".$angka2.""; // se - puluhan

    /*start tingkatan : ratusan puluhan satuan*/
    if($angka1>"0" and $angka2=="1" and $angka3>"1"){ // seratus y belas
      $daftar .= "".$angka." 000".$angka3." belas ";
    }else if($angka2=="0" and $angka3>"0"){  // x ratus z
      $daftar .= "".$angka." 000".$angka3." ";
    }else if($angka1>"0" and $angka2>"1" and $angka3>"0"){ // x ratus y puluh z
      $daftar .= "".$angka." 000".$angka2." puluh 000".$angka3." ";

    }else if($angka1>"0" and $angka2>"1" and $angka3=="0"){ // x ratus y puluh
      $daftar .= "".$angka." 000".$angka2." puluh ";

    }else if($angka1>"0" and $angka2=="1" and $angka3=="1"){ // x ratus SEbelas
      $daftar .= "".$angka." 0011 ";
    }else if($angka1>"0" and $angka2>="1" and $angka3=="0"){ // x ratus sepuluh
      $daftar .= "".$angka." 0010 ";
    }else{ // x ratus
      if ($angka1=="1" and $angka2=="0" and $angka3=="0"){
        $daftar .= "0100 ";
      }else{
        $daftar .= "".$angka." ";
      }
    } /*end tingkatan : ratusan puluhan satuan*/


    /*baca puluhan*/
  }else if ((substr($nomer,1,-2)=="0") and (substr($nomer,2,1)>"1")){

    $angka  = substr($nomer,1,-2); // ratusan
    $angka1 = substr($nomer,2,1); // puluhan
    $angka2 = substr($nomer,3); // satuan


    if($angka=="0" and $angka2=="0"){
      $daftar .= "000".$angka1." puluh ";
    }else if($angka=="0" and $angka2>"0"){
      $daftar .= "000".$angka1." puluh 000".$angka2." ";
    }

    /*baca satuan*/
  }else{
    $daftar .= " ".$nomer." ";
  }

  $daftar .= " keloket ";

  // baca counter, file suara dapat di sesuaikan
  if ($widget=='C1'){
    $daftar .= " 0001 ";
  }elseif($widget=='C2'){ // widget 2
    $daftar .= " 0002 ";
  }elseif($widget=='C3'){ // widget 2
    $daftar .= " 0003 ";
  }else{
    $daftar .= " 0005 ";
  }

  antrianSuara($daftar);

} // end function putar


// start function antrian suara
function antrianSuara($daftar) {

  $boxKata	= explode(" ",$daftar);
  $last[0]	= "stop";
  $boxKata    = array_merge($boxKata,$last);

  include "OwnXmlWriter.php";
  $xml = new OwnXmlWriter();

  $xml->push('xml');

  foreach ($boxKata as $key => $val)
  {
    if ($val != "")
    {
      $xml->push('track');
      $xml->element('path', 'sounds/' . $val . '.mp3');
      $xml->element('title', $val);
      $xml->pop();
    }

  }

  $xml->pop();
  $filename = 'widget.xml';

	$fp = fopen($filename, 'w');

	if ($fp) {

		// lock file biar tidak tabrakan
		flock($fp, LOCK_EX);

		fwrite($fp, $xml->getXml());
		fflush($fp);

		flock($fp, LOCK_UN);

		fclose($fp);
	}
  
  fwrite($fp, $xml->getXml());
  fclose($fp);

} // end function
?>
