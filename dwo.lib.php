<?php
// Author : Emanuel Setio Dewo
// Email  : setio.dewo@gmail.com
// Start  : 21 April 2009 -- redesign

function GetSetVar($str, $def='') {
  if (isset($_REQUEST[$str])) {
	$_SESSION[$str] = $_REQUEST[$str];
	return $_REQUEST[$str];
  }
  else {
    if (isset($_SESSION[$str])) return $_SESSION[$str];
    else {
	  $_SESSION[$str] = $def;
	  return $def;
    }
  }
}
function GetaField($_tbl,$_key,$_value,$_result, $_order='', $_group='', $_limit= 'limit 1') {
  global $strCantQuery;
	$_sql = "select $_result from $_tbl where $_key='$_value' $_group $_order $_limit";
	$_res = _query($_sql);
	//echo $_sql;
	if (_num_rows($_res) == 0) return '';
	else {
	  $w = _fetch_array($_res);
	  return $w[$_result];
	}
}
function GetFields($_tbl, $_key, $_value, $_results, $_group='', $_order='', $_limit= 'limit 1') {
  global $strCantQuery;
	$s = "select $_results from $_tbl where $_key='$_value' $_group $_order $_limit";
	$r = _query($s);
	//echo "<pre>$s</pre>";
	if (_num_rows($r) == 0) return '';
	else {
	  /*$res = array();
	  for ($i=0; $i < mysql_num_fields($r); $i++) {
		$res[mysql_field_name($r, $i)] = mysql_result($r, 0, mysql_field_name($r, $i));
	  } */
	  return _fetch_array($r);
	}
}
function sqling($str) {
    $str = stripslashes($str);
	return addslashes($str);
}
function GetLastID() {
  $sql = "select LAST_INSERT_ID() as ID";
  $res = mysql_query($sql);
  return mysql_result($res, 0, 'ID');
}

function GetOption2($_table, $_field, $_order='', $_default='', $_where='', $_value='', $not=0, $blank=1) {
  global $strCantQuery;
	if (!empty($_order)) $str_order = " order by $_order ";
	else $str_order = "";
	if ($not==0) $strnot = "NA='N'"; else $strnot = '';
	if (!empty($_where)) {
	  if (empty($strnot)) $_where = "$_where"; else $_where = "and $_where";
	}
	if (!empty($_value)) {
	  $_fieldvalue = ", $_value";
	  $fk = $_value;
	}
	else {
	  $_fieldvalue = '';
	  $fk = $_field;
	}
  $_tmp = ($blank == 1)? "<option value=''></option>" : '';
	$_sql = "select $_field $_fieldvalue from $_table where $strnot $_where $str_order";
	$_res = _query($_sql);

  while ($w = _fetch_array($_res)) {
	  if (!empty($_value)) $_v = "value='" . $w[$_value]."'";
	  else $_v = '';
	  if ($_default == $w[$fk])
	    $_tmp = "$_tmp <option $_v selected>". $w[$_field]."</option>";
	  else
	    $_tmp = "$_tmp <option $_v>". $w[$_field]."</option>";    
  }
	return $_tmp;
}

function GetOption2md($_table, $_field, $_order='', $_default='', $_where='', $_value='', $not=0, $blank=1) {
  global $strCantQuery;
	if (!empty($_order)) $str_order = " order by $_order ";
	else $str_order = "";
	if ($not==0) $strnot = "NA='N'"; else $strnot = '';
	if (!empty($_where)) {
	  if (empty($strnot)) $_where = "$_where"; else $_where = "and $_where";
	}
	if (!empty($_value)) {
	  $_fieldvalue = ", $_value";
	  $fk = $_value;
	}
	else {
	  $_fieldvalue = '';
	  $fk = $_field;
	}
  $_tmp = ($blank == 1)? "<option value=''></option>" : '';
	$_sql = "select $_field $_fieldvalue from $_table where $strnot $_where $str_order";
	$_res = _query($_sql);

  while ($w = _fetch_array($_res)) {
	  if (!empty($_value)) $_v = "value='" . $w[$_value]."'";
	  else $_v = '';
	  if ($_default == $w[$fk])
	    $_tmp = "$_tmp <option $_v selected>". $w[$_field]."</option>";
	  else
	    $_tmp = "$_tmp <option $_v>". $w[$_field]."</option>";    
  }
	if ($_default == 'UGD')
	    $_tmp = "$_tmp <option 'UGD' selected>UGD</option>";
 	else 
          $_tmp = "$_tmp <option 'UGD'>UGD</option>";
	return $_tmp;
}

function lastday($month = '', $year = '', $fmt = 'Y-m-d') {
  // taken from: http://lutrov.com/blog/php-last-day-of-the-month-calculation/
  if (empty($month)) {
    $month = date('m');
  }
  if (empty($year)) {
    $year = date('Y');
  }
  $result = strtotime("{$year}-{$month}-01");
  $result = strtotime('-1 second', strtotime('+1 month', $result));
  return date($fmt, $result);
}

?>
