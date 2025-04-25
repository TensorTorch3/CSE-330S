<?php
    // Include the database connection file
    require "database.php";

    // Set the content type to JSON
    header("Content-Type: application/json");

    // Get the JSON input from the request
    $json_str = file_get_contents('php://input');
    // Decode the JSON input into an associative array
    $json_obj = json_decode($json_str, true);

    // Extract the username and password from the JSON object
    $guessed_username = $json_obj["guessed_username"];
    $guessed_password = $json_obj["guessed_password"];

    // Hash the password for security
    $password_hashed = password_hash($guessed_password, PASSWORD_DEFAULT);

    // Prepare the SQL statement to insert a new user
    $stmt = $mysqli->prepare("insert into Users (username, password) values (?, ?)");

    // Check if the statement preparation failed
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
        exit;
    }

    // Bind the parameters to the SQL query
    $stmt->bind_param('ss', $guessed_username, $password_hashed);
    // Execute the query
    $successful = $stmt->execute();

    // If adding a user was successful
    if($successful){
        echo json_encode(array(
            "success" => true
        ));
        exit;
    } else {
        // If adding a user failed (e.g., username already exists)
        echo json_encode(array(
            "success" => false,
            "message" => "Username already exists"
        ));
        exit;
    }
?>