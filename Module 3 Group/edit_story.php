<?php

session_start();

// if(!hash_equals($_SESSION['token'], $_POST['token'])){
// 	die("Request forgery detected");
// }

require 'database.php';

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get posted data and session user
$new_text = $_POST['new_text'];
$title = $_POST['title'];
$user = $_SESSION['user'];

echo $_SESSION["token"];
echo $_POST["token"];

// Debugging: Output the values
echo "New Text: " . htmlspecialchars($new_text) . "<br>";
echo "Title: " . htmlspecialchars($title) . "<br>";
echo "User: " . htmlspecialchars($user) . "<br>";

// Simple update for story if user owns it
$stmt = $mysqli->prepare("UPDATE Stories SET text=? WHERE title=? AND user=?");
if(!$stmt){
    echo "Prepare failed: " . $mysqli->error;
    exit;
}

$stmt->bind_param('sss', $new_text, $title, $user);
if ($stmt->execute()) {
    echo "Story updated successfully!";
} else {
    echo "Execute failed: " . $stmt->error;
}
$stmt->close();

// Return to story page
$_SESSION['title'] = $title;
header("Location: story.php");
exit;
?>