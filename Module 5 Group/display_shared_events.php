<?php

// Ensure session cookies are only accessible via HTTP
ini_set("session.cookie_httponly", 1);

// Start the session
session_start();

// Include the database connection file
require "database.php";

// Set the content type to JSON
header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    echo json_encode([]); // Return an empty JSON array if not logged in
    exit;
}

// Get the JSON input from the request
$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

// Check for CSRF token validation
if (!isset($_SESSION['token']) || !isset($json_obj['token']) || $_SESSION['token'] !== $json_obj['token']) {
    echo json_encode(array(
        "success" => false,
        "message" => "CSRF token validation failed"
    ));
    exit;
}

// Extract year and month from the JSON object
$year = intval($json_obj['year']);
$month = intval($json_obj['month']);
$username = $_SESSION["username"];

// Get events from users who have shared their calendar with the current user
$stmt = $mysqli->prepare("
    SELECT e.title, e.time, DAY(e.date) AS day, e.date, e.category, e.user AS owner
    FROM Events e
    JOIN SharedCalendars sc ON e.user = sc.owner
    WHERE sc.shared_with = ? AND MONTH(e.date) = ? AND YEAR(e.date) = ?
");

if(!$stmt){
    printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
    exit;
}

// Bind the parameters
$stmt->bind_param('sss', $username, $month, $year);
$stmt->execute();

// Bind the results
$stmt->bind_result($title, $time, $day, $date, $category, $owner);

$array = array();
while ($stmt->fetch()) {
    array_push($array, array(
        "title" => htmlentities($title), 
        "time" => htmlentities($time), 
        "day" => htmlentities($day), 
        "date" => htmlentities($date),
        "category" => htmlentities($category),
        "owner" => htmlentities($owner)
    ));
}

// Return the shared events as a JSON array
echo json_encode($array);
?>