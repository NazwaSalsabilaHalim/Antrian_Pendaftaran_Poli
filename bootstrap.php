<?php

session_start();

define('ROOT', realpath(dirname(__FILE__) . '/../..'));
define('MODULE_ROOT', realpath(dirname(__FILE__)));
define('FUNC_LIB', ROOT . '/function_library');
define('BASE_SESSION', $_SERVER['SERVER_NAME']);

include ROOT . '/db.mysql.php';
include ROOT . '/connectdb.php';
include ROOT . '/dwo.lib.php';
include FUNC_LIB . '/tgllahir.php';
include FUNC_LIB . '/formatTgl.php';
include FUNC_LIB . '/medrec.lib.php';
include FUNC_LIB . '/tarifkerjasama.php';
include FUNC_LIB . '/dopages.lib.php';

$_SESSION[BASE_SESSION . '_UserName'] = 'admin';
$_SESSION['operasi_Execute'] = 'x';
