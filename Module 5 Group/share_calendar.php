<?php
// Prevent PHP notices and warnings from breaking the JSON response
ini_set("session.cookie_httponly", 1);

error_reporting(E_ERROR);
ini_set('display_errors', 0);

// Start the session
session_start();

// Include the database connection file
require "database.php";

// Set the content type to JSON
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode(array(
        "success" => false,
        "message" => "Not logged in"
    ));
    exit;
}

// Get the JSON input from the request
$json_str = file_get_contents("php://input");
$json_obj = json_decode($json_str, true);

// Check for CSRF token validation
if(!isset($_SESSION['token']) || !isset($json_obj['token']) || $_SESSION['token'] !== $json_obj['token']){
    echo json_encode(array(
        "success" => false,
        "message" => "CSRF token validation failed"
    ));
    exit;
}

$owner = $_SESSION['username'];
$share_with = htmlentities($json_obj['share_with']); // Sanitize input

// Verify that the user to share with exists
$check_user = $mysqli->prepare("SELECT COUNT(*) FROM Users WHERE username = ?");
if(!$check_user){
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $mysqli->error
    ));
    exit;
}

$check_user->bind_param('s', $share_with);
$check_user->execute();
$check_user->bind_result($user_exists);
$check_user->fetch();
$check_user->close();

if ($user_exists == 0) {
    echo json_encode(array(
        "success" => false,
        "message" => "User does not exist"
    ));
    exit;
}

// Check if the calendar is already shared with this user
$check_shared = $mysqli->prepare("SELECT COUNT(*) FROM SharedCalendars WHERE owner = ? AND shared_with = ?");
if(!$check_shared){
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $mysqli->error
    ));
    exit;
}

$check_shared->bind_param('ss', $owner, $share_with);
$check_shared->execute();
$check_shared->bind_result($already_shared);
$check_shared->fetch();
$check_shared->close();

if ($already_shared > 0) {
    echo json_encode(array(
        "success" => false,
        "message" => "Calendar already shared with this user"
    ));
    exit;
}

// Create sharing relationship
$stmt = $mysqli->prepare("INSERT INTO SharedCalendars (owner, shared_with) VALUES (?, ?)");
if(!$stmt){
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $mysqli->error
    ));
    exit;
}

$stmt->bind_param('ss', $owner, $share_with);
$successful = $stmt->execute();
$stmt->close();

if ($successful) {
    echo json_encode(array(
        "success" => true,
        "message" => "Calendar successfully shared"
    ));
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Failed to share calendar: " . $mysqli->error
    ));
}
?>