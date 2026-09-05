<?php
// Epson ESC Command & ASCII, mod byrzl @ 19/04/2010
global $newpage;

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
