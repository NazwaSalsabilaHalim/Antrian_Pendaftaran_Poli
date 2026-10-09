<?php
// Author : Emanuel Setio Dewo, 27/11/2017
$db_server = "localhost";
$db_user = "yasmin";
$db_password = "yasmin@2026";
$db_name = "antripol";
$charset = "utf8";

$dsn = "mysql:host=$db_server;dbname=$db_name;charset=$charset";

$opt = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];
$pdo = new PDO($dsn, $db_user, $db_password, $opt);
?>
