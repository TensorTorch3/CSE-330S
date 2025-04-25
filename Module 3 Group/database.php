<?php
// Content of database.php

$mysqli = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'mod3group');

if($mysqli->connect_errno) {
	printf("Connection Failed: %s\n", $mysqli->connect_error);
	exit; // Credit to CSE 330S wiki but basically this just checks if connection succeeds or not
}
?>