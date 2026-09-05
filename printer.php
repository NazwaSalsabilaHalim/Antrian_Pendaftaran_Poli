<?php //byrzl

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function initPage(){
	$_SESSION['pg']=1;
	$_SESSION['brs']=1;
}

initPage();

function cekbaris(){
	$str='';
	$_SESSION['brs']++;
	if($_SESSION['mod']==0){

		if($_SESSION['brs']>=52) {

			$str .= "\n\n";
			$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			$str .= kiri('Page: '.$_SESSION['pg']++,92);
			$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);//.chr(12);

			$str .= "\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}
	}elseif($_SESSION['mod']==1){
		if($_SESSION['brs']>=26) {
			$str = chr(12);
			$_SESSION['brs']=1;
		}
        }elseif($_SESSION['mod']==2){
        if($_SESSION['brs']>=100) {
			$str .= "\n\n";
			$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			$str .= kiri('Page: '.$_SESSION['pg']++,92);
			$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);//.chr(12);

			$str .= "\n\n\n\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}


	}elseif($_SESSION['mod']==3){
        if($_SESSION['brs']>=150) {
			$str .= "\n\n";
			$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			$str .= kiri('Page: '.$_SESSION['pg']++,92);
			$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);//.chr(12);

			$str .= "\n\n\n\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}


	}elseif($_SESSION['mod']==4){ //untuk cetak returpo
        if($_SESSION['brs']>=200) {
			$str = chr(12);
			$_SESSION['brs']=1;
			$_SESSION['pg']++;
		}
		


	}elseif($_SESSION['mod']==5){ //Kertas A4 --> untuk cetak defekta
        if($_SESSION['brs']>=100) {
        		$_SESSION['pg']++;
			$str .= chr(12);
			$str .= "\n\n";			
			$str .= kiri(' ',76).kiri(" Halaman",12).": ".$_SESSION['pg']."\n";       

			$_SESSION['brs']=1;
			
		}

	}elseif($_SESSION['mod']==6){//Cetak hasil LAB

		if($_SESSION['brs']>=42) {

			$str .= "\n\n";
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			$str .= "Print Date : ".date("d M Y H:i:s");
			$str .= kiri('Page: '.$_SESSION['pg']++,92);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);
			$str.=chr(12);
			//$str .= "\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;

$umur0=$_SESSION['umur0'];
$umur1=$_SESSION['umur1'];
$umur2=$_SESSION['umur2'];
$kamar=$_SESSION['kamar'];
$dokter=$_SESSION['dokter'];
$dokterPengirim=$_SESSION['DokterPengirim'];
$departemen=$_SESSION['departemen'];
$medrec=$_SESSION['medrec'];
$regRad=$_SESSION['regRad'];
$tgl=$_SESSION['tglcetak'];
$nama=$_SESSION['nama'];


  $str .= "\n\n\n\n\n\n\n";

  $str .= $condensed0.$changefont1.$sans.$print12cpi;
  $str .= tengah("                  ",50)."\n\n";
  
  $str .= kanan(" ",17).kanan($medrec,40)."  ".$regRad."\n";
  $str .= kanan(" ",17).kanan($umur0." tahun ".$umur1." bulan ".$umur2,40)."  ".$nama."\n";
  $str .= kanan(" ",17).kanan($kamar,40)."  ".$dokterPengirim."\n";
  $str .= kanan(" ",17).kanan($departemen,40)."  ".$tgl."\n\n";

  $str .="\n";

  $str .= $condensed1.$changefont1.$sans.$print12cpi;
  $str .= kanan('PEMERIKSAAN',35).kanan('',10,0).kanan('HASIL',10,0).kanan('NILAI RUJUKAN',15,0).kanan('SATUAN',15,0)."\n";
  $str .= "\n";
 $str .= $condensed0.$changefont1.$sans.$print12cpi;

		} }
	elseif ($_SESSION['mod']==7){

		if($_SESSION['brs']>=50) {

			$str .= "\n\n";
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			$str .= kiri('Page: '.$_SESSION['pg']++,92);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);//.chr(12);

			$str .= "\n\n\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}
	}

	elseif ($_SESSION['mod']==8){

		if($_SESSION['brs']>=50) {

			//$str .= "\n\n";
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			//$str .= kiri('Page: '.$_SESSION['pg']++,92);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);//.chr(12);

			//$str .= "\n\n\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}
	}
	elseif ($_SESSION['mod']==9)
	{
	   //$str .= $_SESSION['brs'];
	   if ($_SESSION['brs']>=50) 
	      {  $str .= "\n\n";
		   $str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
		   $str .= kiri('Page: '.$_SESSION['pg']++,92);
		   $str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);//.chr(12);
             //  $str .= chr(12);  
               $_SESSION['brs']=1;
               //$str .=kiri("Hal : ".$_SESSION['pg']++,92);
		   $str .= "\n\n\n\n\n\n\n";
		   
		   	
		}
	}elseif($_SESSION['mod']==14){

		if($_SESSION['brs']>=25) {
		   $header = chr(27).chr(64).chr(27).chr(120).chr(49).chr(27).chr(120).chr(48).chr(27).chr(71).chr(18);//.chr(12);
	//$header = $initialized3.$changefont1.$sans.$doublestrike1;
			//$str = chr(12);
			$_SESSION['brs']=1;
		   $header .= "\n\n\n\n";
	//$header .= $initialized3.$changefont0.$draftmode;
	//$header .= $doublestrike1.$doublestrike1.$condensed0;

$reg=$_SESSION['regPrint'];
$tglmasuk=$_SESSION['tglMsk'];
$jnsreg=$_SESSION['jnsReg'];
$ruangan=$_SESSION['ruangPrint'];
$tglkeluar=$_SESSION['tglKeluar'];
$jenispasien=$_SESSION['jnsPasien'];
$tglcetak=$_SESSION['tglCetak'];
$medrec=$_SESSION['medrecCetak'];
$namapasien=$_SESSION['namaPasien'];
$prsh=$_SESSION['prsh'];

	if(($jnsreg=='1') ||($jnsreg=='6'))
	{ 
	   $header .= kanan("",0).tengah("R E K E N I N G  P A S I E N ( A S L I )",60)."\n";
	   $header .= kanan("",0).tengah("(UNTUK PASIEN)",60)."\n";
	}else{ 
	   $header .= kanan("",0).tengah("R I N C I A N   P E L A Y A N A N",60)."\n\n";
	}
//	$header .= $changefont0.$draftmode;
//	$header .= $doublestrike0.$condensed1;
	$header .= chr(27).chr(120).chr(48).chr(27).chr(120).chr(48);
	$header .= chr(27).chr(72).chr(15);

	$header .= "MEDREC        : ".kanan($medrec,56)."Registrasi   : ".$reg."\n";
	$header .= "Nama Pasien   : ".kanan($namapasien,56)."Tgl. Masuk   : ".$tglmasuk."\n";
	if(($jnsreg=='1') ||($jnsreg=='6')){ $header .= "Ruangan       : ".kanan($ruangan,56)."Tgl. Keluar  : ".$tglkeluar."\n";}
	$header .= "Perusahaan    : ".kanan($prsh,56)."Tgl. Print   : ".$tglcetak."\n";
	$header .= kanan(str_repeat(chr(205),110),0)."\n";

	//$header .= $changefont1.$sans.$doublestrike0.$condensed1;
	$header .= chr(27).chr(120).chr(49).chr(27).chr(120).chr(48).chr(27).chr(72).chr(15);
	if(($jenispasien=='1')||($jenispasien=='2')){	
	$header .= tengah("KETERANGAN",80).kiri("Pasien",15).kiri("Perusahaan",15).$changefont0.$draftmode.$doublestrike0.$condensed1."\n";}else{
	$header .= tengah("KETERANGAN",80).kiri("Jumlah",15).$changefont0.$draftmode.$doublestrike0.$condensed1."\n";		
	}
	$header .= kanan(str_repeat(chr(196),110),0)."\n";
	$str .= $header;
		}
        }

	elseif ($_SESSION['mod']==11)
	{
	   if ($_SESSION['brs']>=62) 
	      { 
		//$str .= "\n\n";
		
		   //$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
		   //$str .= kiri('Page: '.$_SESSION['pg']++,92);
		   //$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);
                //$str .= chr(12);
		//$str .= "\n\n\n\n\n\n";	
            //  $_SESSION['brs']=1;
		//$str .= "\n";

		$str .= "\n\n";
		$_SESSION['pg']++;
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			//$str .= "Print Date : ".date("d M Y H:i:s");
			//$str .= kiri('Page: '.$_SESSION['pg']++,92);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);
			//$str .= "";
			//$str .= "";
			//$str .= chr(12);
			
			$str .= "\n\n\n";
			
			$_SESSION['brs']=1;


$head1=$_SESSION['head1'];
$head2=$_SESSION['head2'];
$head3=$_SESSION['head3'];
$head4=$_SESSION['head4'];
$head5=$_SESSION['head5'];
$head6=$_SESSION['head6'];
$head7=$_SESSION['head7'];
$head8=$_SESSION['head8'];
$head9=$_SESSION['head9'];
$head10=$_SESSION['head10'];
$head11=$_SESSION['head11'];
$head12=$_SESSION['head12'];
$head13=$_SESSION['head13'];
$head14=$_SESSION['head14'];
$head15=$_SESSION['head15'];
$head16=$_SESSION['head16'];
$head17=$_SESSION['head17'];
$head18=$_SESSION['head18'];

$str .=$head1.cekbaris();
$str .=$head2.cekbaris(); 
$str .=$head3.cekbaris(); 
$str .=$head4.cekbaris(); 
$str .=$head5.cekbaris(); 
$str .=$head6.cekbaris(); 
$str .=$head7.cekbaris(); 
$str .=$head8.cekbaris(); 
$str .=$head9.cekbaris(); 
$str .=$head10.cekbaris(); 
$str .=$head11.cekbaris(); 
$str .=$head12.cekbaris(); 
$str .=$head13.cekbaris().cekbaris(); 
$str .=$head14.kanan('Page: '.$_SESSION['pg'],10); 
$str .=$head15.cekbaris(); 
$str .=$head16.cekbaris(); 
$str .=$head17.cekbaris(); 
$str .=$head18.cekbaris(); 
	   	
		}
	}
	
	elseif($_SESSION['mod']==12){

		if($_SESSION['brs']>=56) {
			
			$str .= "\n\n";
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			//$str .= "Print Date : ".date("d M Y H:i:s");
			$str .= kiri('Page: '.$_SESSION['pg']++,92);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);
			$str .= chr(12);

			//$str .= "\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}	
	}
	
	elseif($_SESSION['mod']==50){
		if($_SESSION['brs']>=90) {
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			//$str .= "Print Date : ".date("d M Y H:i:s");
			//$str .= kiri('Page: '.$_SESSION['pg']++,92);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);
			$str .= chr(12);

			//$str .= "\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
	}
	}
	elseif($_SESSION['mod']==22){

		if($_SESSION['brs']>=56) {
			
			$str .= "\n\n";
			//$str .= chr(27).chr(33).chr(5)."Print Date : ".date("d M Y H:i:s");
			$str .= kiri("Print Date : ".date("d M Y H:i:s")."  ".'Page: '.$_SESSION['pg']++,85);
			//$str .= chr(27).chr(64).chr(27).chr(120).chr(48).chr(15);
			$str .= chr(12);

			//$str .= "\n\n\n\n\n\n\n";
			
			$_SESSION['brs']=1;
		}	
	}
	
	
	
	return $str;
}




function tbl($m=1)
{
	if($_SESSION['typ']=='layar') return ($m)?"<table border=0 width=100% background='../../img/preview.jpg'>":"</table>";
}

function td($m=1,$s=0,$p='left',$c='&nbsp;')
{
	if($_SESSION['typ']=='layar') return ($m)?"<td colspan=$s align=$p height='1px'>$c":"</td>";
}

function tr($m=1)
{
	if($_SESSION['typ']=='layar') return ($m)?"<tr>":"</tr>";
}

function tengah($str,$col){
	return str_pad($str, $col, " ", STR_PAD_BOTH);
}

function kiri($str,$col){
	return str_pad($str, $col, " ", STR_PAD_LEFT);
}

function kanan($str,$col,$cek=1){
	if($cek && $_SESSION['typ']!='layar') return cekbaris().str_pad($str, $col, " ", STR_PAD_RIGHT);
	else return str_pad($str, $col, " ", STR_PAD_RIGHT);
}

function grs($str="─",$ln = 0){
	return str_repeat($str,$ln);
}

$u1 = chr(218); // ┌
$u2 = chr(191); // ┐
$u3 = chr(192); // └
$u4 = chr(217); // ┘
$t1 = chr(195); // ├
$t2 = chr(194); // ┬ 
$t3 = chr(180); // ┤
$t4 = chr(197); // ┼  
$t5 = chr(193); // ┴
$g1 = chr(179); // │
$g2 = chr(196); // ─

$space = chr(27).chr(64).chr(27).chr(15);

$initialized    = chr(27).chr(64)."\n\n\n\n\n\n\n";
$initialized2   = chr(27).chr(64);
$initialized3   = chr(27).chr(64);
$draftmode      = chr(27).chr(120).chr(0);
$lqmode         = chr(27).chr(120).chr(1);
$print10cpi     = chr(27).chr(80);
$print12cpi     = chr(27).chr(77);
$doublestrike0  = chr(27).chr(72);
$doublestrike1  = chr(27).chr(71);
$doubleheight0  = chr(27).chr(119).chr(0);
$doubleheight1  = chr(27).chr(119).chr(1);
$elongated0     = chr(27).chr(87).chr(0);
$elongated1     = chr(27).chr(87).chr(1);
$italic0        = chr(27).chr(53);
$italic1        = chr(27).chr(52);
$condensed0     = chr(18);
$condensed1     = chr(15);
$elongatedline0 = chr(20);
$elongatedline1 = chr(14);
$movetoleft     = chr(13);
$linefeed	= chr(10);
$changefont1	= chr(27).chr(120).chr(49);
$changefont0	= chr(27).chr(120).chr(48);
$roman 		= chr(27).chr(107).chr(48);
$sans 		= chr(27).chr(107).chr(49);
$draftmode	= chr(27).chr(120).chr(48);
$underline1	= chr(27).chr(45).chr(49);
$underline0	= chr(27).chr(45).chr(48);
$small		= chr(27).chr(33).chr(5);
$newpage	= chr(12);
$sizekwt	= chr(27)."1".chr(27).chr(67)."9";
$sizerek	= chr(27)."2".chr(27).chr(67)."66";
$sizedet	= chr(27)."1".chr(27).chr(67)."9";
$leftmargin0	= chr(27)."g".chr(27)."1"."-10".chr(27)."Q"."20";
?>
