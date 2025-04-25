<?php

session_start();

// if(!hash_equals($_SESSION['token'], $_POST['token'])){
// 	die("Request forgery detected");
// }

require 'database.php';

$title = $_POST['title'];
$user = $_SESSION['user'];

// Delete story if user owns it
$stmt = $mysqli->prepare("DELETE FROM Stories WHERE title=? AND user=?");

if(!$stmt){
    echo "Prepare failed: " . $mysqli->error;
    exit;
}

// More of the same with SQL querying and binding parameters
$stmt->bind_param('ss', $title, $user);
$stmt->execute();
$stmt->close();

header("Location: news.php"); // redirect to news.php after you finish deleting the story
exit;
?>