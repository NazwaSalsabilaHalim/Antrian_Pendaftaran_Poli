<?php
// Author : Emanuel Setio Dewo
// Email  : setio.dewo@gmail.com
// Start  : 25/08/2009

function sanitize($data)  {  
  // remove whitespaces (not a must though)  
  $data = trim($data);   

  // apply stripslashes if magic_quotes_gpc is enabled  
  if (get_magic_quotes_gpc()) {  
    $data = stripslashes($data);  
  }
  
  // a mySQL connection is required before using this function  
  $data = mysql_real_escape_string($data);  
  
  return $data;
}
function ErrorBox($title='', $msg='') {
  echo <<<ESD
  <style>
  .msgtitle {
    color: #E00E0E;
    font-weight: bold;
    border-bottom: 1px dotted maroon;
    padding: 4px;
  }
  .msgbody {
    color: navy;
    padding: 4px;
  }
  </style>
  
  <div class='msgtitle'>$title</div>
  <div class='msgbody'>$msg</div>
ESD;
}

function GetOptions($sql, $name, $keyfield, $valuefield, $default='', $autosubmit=1) {
  $r = _query($sql);
  $opt = "<option value=''>...</option>";
  
  while ($w = _fetch_array($r)) {
    $key = $w[$keyfield];
    $value = $w[$valuefield];
    $sel = ($default == $key)? 'selected' : '';
    $opt .= "<option value='$key' $sel>$value</option>";
  }
  $auto = ($autosubmit == 1)? "onchange='this.form.submit()'" : '';
  return "<select name='$name' $auto>$opt</select>";
}

function GetData($sql) {
  $r = _query($sql);
  $w = _fetch_array($r);
  return $w;
}

function fnHTMLHeader($title='') {
?>
  <HTML>
  <HEAD>
    <TITLE><?php echo $title;?></TITLE>
    <link href="index.css" rel="stylesheet" type="text/css" media="screen" />
  </HEAD>
  
  <BODY>
<?php
}
?>
