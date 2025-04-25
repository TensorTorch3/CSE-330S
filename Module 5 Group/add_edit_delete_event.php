<?php
    // Ensure session cookies are only accessible via HTTP
    ini_set("session.cookie_httponly", 1);

    // Start the session
    session_start();

    // Include the database connection file
    require "database.php";

    // Set the content type to JSON
    header("Content-Type: application/json");

    // Get the JSON input from the request
    $json_str = file_get_contents("php://input");
    $json_obj = json_decode($json_str, true);

    // Check for CSRF token validation
    if (!isset($_SESSION['token']) || !isset($json_obj['token']) || $_SESSION['token'] !== $json_obj['token']) {
        echo json_encode(array(
            "success" => false,
            "message" => "CSRF token validation failed"
        ));
        exit;
    }

    // Check if the user is logged in
    if (!isset($_SESSION['username'])) {
        echo json_encode(array(
            "success" => false,
            "message" => "Not logged in"
        ));
        exit;
    }

    // Get session variables and variables from the AJAX request
    $username = $_SESSION["username"];
    $title = htmlentities($json_obj["event_title"]); // Escape for XSS protection
    $date = $json_obj["event_date"];
    $time = $json_obj["event_time"];
    $action = $json_obj["action"]; // "add" or "edit" or "delete"
    $category = isset($json_obj["category"]) ? htmlentities($json_obj["category"]) : "default";

    // Handle the "add" action
    if($action === "add") {
        $stmt = $mysqli->prepare("INSERT INTO Events (title, date, time, user, category) VALUES (?, ?, ?, ?, ?)");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('sssss', $title, $date, $time, $username, $category);
    } 
    // Handle the "edit" action
    else if ($action === "edit") {
        $old_title = $json_obj["old_title"];
        $old_date = $json_obj["old_date"];
        $old_time = $json_obj["old_time"];
        $stmt = $mysqli->prepare("UPDATE Events SET title=?, date=?, time=?, category=? WHERE user=? AND title=? AND date=? AND time=?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('ssssssss', $title, $date, $time, $category, $username, $old_title, $old_date, $old_time);
    } 
    // Handle the "delete" action
    else {
        $old_title = $json_obj["old_title"];
        $old_date = $json_obj["old_date"];
        $old_time = $json_obj["old_time"];
        $stmt = $mysqli->prepare("DELETE FROM Events WHERE user=? AND title=? AND date=? AND time=?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('ssss', $username, $old_title, $old_date, $old_time);
    }

    // Execute the query and check if it was successful
    $successful = $stmt->execute();

    if($successful){
        echo json_encode(array(
            "success" => true
        ));
        exit;
    } else {
        echo json_encode(array(
            "success" => false,
            "message" => "Event unsuccessfully added"
        ));
        exit;
    }
?>