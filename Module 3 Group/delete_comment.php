<?php

session_start();

// if(!hash_equals($_SESSION['token'], $_POST['token'])){
// 	die("Request forgery detected");
// }

require 'database.php';

$title = $_POST['title'];
$user = $_SESSION['user'];
$comment = $_POST['comment'];

// Delete comment if user owns it
$stmt = $mysqli->prepare("DELETE FROM Comments WHERE title=? AND user1=? AND comment=?");

if(!$stmt){
    echo "Prepare failed: " . $mysqli->error;
    exit;
}

// Bind parameters, execute, close
$stmt->bind_param('sss', $title, $user, $comment);
$stmt->execute();
$stmt->close();

$_SESSION['title'] = $title;  // Go back to story.php once you finish deleting the comment
header("Location: story.php");
exit;
?>