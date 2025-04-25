<?php
    // Ensure session cookies are only accessible via HTTP
    ini_set("session.cookie_httponly", 1);

    // Start the session
    session_start();

    // Include the database connection file
    require "database.php";

    // Set the content type to JSON
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

    // Check if the user is logged in
    if (!isset($_SESSION['username'])) {
        echo json_encode([]); // Return an empty JSON array if not logged in
        exit;
    }

    // Get the JSON input from the request
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);
    $year = $json_obj['year'];
    $month = $json_obj['month'];
    $username = $_SESSION["username"];

    // Check for CSRF token validation
    if (!isset($_SESSION['token']) || !isset($json_obj['token']) || $_SESSION['token'] !== $json_obj['token']) {
        echo json_encode(array(
            "success" => false,
            "message" => "CSRF token validation failed"
        ));
        exit;
    }

    // Prepare the SQL statement to fetch events for the given user, month, and year
    $stmt = $mysqli->prepare("SELECT title AS title, time AS time, DAY(date) AS day, date AS date, category AS category FROM Events WHERE user = ? AND MONTH(date) = ? AND YEAR(date) = ?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
        exit;
    }

    // Bind the parameters
    $stmt->bind_param('sss', $username, $month, $year);
    $stmt->execute();

    // Bind the results
    $stmt->bind_result($title, $time, $day, $date, $category);
    $array = array();
    while ($stmt->fetch()) {
        array_push($array, array(
            "title" => htmlentities($title), 
            "time" => htmlentities($time), 
            "day" => htmlentities($day), 
            "date" => htmlentities($date),
            "category" => htmlentities($category)
        ));
    }
    echo json_encode($array); // Return the events as a JSON array

?>