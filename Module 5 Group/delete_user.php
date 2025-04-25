<?php
    // Include the database connection file
    require "database.php";

    // Ensure session cookies are only accessible via HTTP
    ini_set("session.cookie_httponly", 1);
    
    // Set the content type to JSON
    header("Content-Type: application/json");

    // Get the JSON input from the request
    $json_str = file_get_contents('php://input');
    // Decode the JSON input into an associative array
    $json_obj = json_decode($json_str, true);

    // Extract the username and password from the JSON object
    $username = $json_obj['username'];
    $password = $json_obj['password'];

    // Prepare the SQL statement to check if the username and password are valid
    $stmt = $mysqli->prepare("SELECT COUNT(*), Username, Password FROM Users WHERE Username=?");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
        exit;
    }

    // Bind the parameter
    $stmt->bind_param('s', $username);
    $stmt->execute();

    // Bind the results
    $stmt->bind_result($cnt, $user_id, $pwd_hash);
    $stmt->fetch();
    
    // Compare the submitted password to the actual password hash
    if($cnt == 1 && password_verify($password, $pwd_hash)){
        $stmt->close();
        
        // Delete the calendar that the user owns
        $stmt1 = $mysqli->prepare("DELETE FROM SharedCalendars WHERE owner = ?");
        if(!$stmt1){
            printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
            exit;
        }
        $stmt1->bind_param("s", $username);
        $stmt1->execute();
        $stmt1->close();

        // Delete the events that the user owns
        $stmt2 = $mysqli->prepare("DELETE FROM Events WHERE User = ?");
        if(!$stmt2){
            printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
            exit;
        }
        $stmt2->bind_param("s", $username);
        $stmt2->execute();
        $stmt2->close();

        // Delete the user
        $stmt3 = $mysqli->prepare("DELETE FROM Users WHERE Username=?");
        if(!$stmt3){
            printf("Query Prep Failed: %s\n", $mysqli->error); // Output an error message if query preparation fails
            exit;
        }
        $stmt3->bind_param("s", $username);
        $stmt3->execute();
        $stmt3->close();

        // Return success response
        echo json_encode(array(
            "success" => true,
            "token" => $_SESSION['token'] // Return token to client
        ));
        exit;
    } else {
        // Return failure response if username or password is incorrect
        echo json_encode(array(
            "success" => false,
            "message" => "Incorrect Username or Password"
        ));
        exit;
    }
?>