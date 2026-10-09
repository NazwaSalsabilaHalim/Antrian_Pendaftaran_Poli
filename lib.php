<?php
// Author : Emanuel Setio Dewo, 19/03/2018

if (!empty($_REQUEST['x'])) {
  include_once "db.php";
  $x = $_REQUEST['x'];
  $x($pdo);
}

function get_antrian($pdo) {
  $disp = $_REQUEST['disp']+0;
  $img = $_REQUEST['img']+0;
  $s = "select *
    from antrian
    where Display=$disp and Status >= 0
    order by Ruang";
  $r = $pdo->query($s);
  $a = "";
  while ($w = $r->fetch()) {
    if ($w['Status'] == 0) {
      $nomor = "<small class='cuti'>CUTI</small>";
    }
    else {
      $nomor = str_pad($w['Antrian'], 3, '0', STR_PAD_LEFT);
    }
    $tgl = date("YmdHis");
    if ($img == 0) {
      $gambar = "";
    }
    else {
      $gambar = <<<ESD
      <div style="height:10px;"></div>
      <div style="width:90%; margin: 0 auto;">
        <div class="circle-avatar" style="background-image:url(foto/$w[Foto]?$tgl);"></div>
      </div>
ESD;
    }
    $a .= <<<ESD
    <div class="div-kotak col-md-3 col-lg-3 col-sm-6 col-xs-12">
    <div id="DIV_$w[AID]" class="div-antrian">
      <div class="div-nama">
        $w[Nama]
      </div>
      $gambar
      <div id="A_$w[AID]" class="div-nomor">$nomor</div>
      <div class="div-poli">
        $w[NamaPoli]<br><b>$w[Ruang]</b>
      </div>
    </div>
    </div>
ESD;
  }
  echo $a;
}

function disp_antrian($pdo) {
  $disp = $_REQUEST['disp']+0;
  $s = "select AID,LPAD(Antrian,3, '0') as Antrian from antrian where Display=$disp and Status >0";
  $r = $pdo->query($s);
  $arr = array();
  $arr['OK'] = $r->rowCount();
  if ($arr['OK']>0) {
    $arr['data'] = $r->fetchAll();
  }
  $s = "select Tanggal from refresh_display where Display=$disp limit 1";
  $r = $pdo->query($s);
  $arr['Tanggal'] = $r->fetchColumn();
  header('Content-Type: application/json');
  echo json_encode($arr);
}

function opt_dokter($pdo) {
  $s = "select AID, DokterID, Nama
    from antrian
    where Status > 0
    order by Display, Nama ASC";
  $r = $pdo->query($s);
  $opt = "<option></option>";
  while ($w = $r->fetch()) {
    $opt .= "<option value='$w[AID]'>$w[Nama]</option>";
  }
  return $opt;
}

function opt_display($pdo) {
  $s = "select distinct Display from antrian order by Display";
  $r = $pdo->query($s);
  $opt = "<option></option>";
  while ($w = $r->fetch()) {
    $opt .= "<option value='$w[Display]'>Display : $w[Display]</option>";
  }
  return $opt;
}

function opt_status($pdo) {
  $s = "select Status, Nama from status order by Status";
  $r = $pdo->query($s);
  $opt = "<option></option>";
  while ($w = $r->fetch()) {
    $opt .= "<option value='$w[Status]'>$w[Nama]</option>";
  }
  return $opt;
}
?>
