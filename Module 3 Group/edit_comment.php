<?php

session_start();

require 'database.php';

$new_comment = $_POST['new_comment'];
$old_comment = $_POST['old_comment'];
$title = $_POST['title'];
$user = $_SESSION['user'];

// Update comment if user owns it
$stmt = $mysqli->prepare("UPDATE Comments SET comment=? WHERE title=? AND user1=? AND comment=?");
$stmt->bind_param('ssss', $new_comment, $title, $user, $old_comment);
$stmt->execute();
$stmt->close();

$_SESSION['title'] = $title;
header("Location: story.php");
exit;
?>