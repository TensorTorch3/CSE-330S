<?php
    // Include the database connection file
    require "database.php";

    // Ensure session cookies are only accessible via HTTP
    ini_set("session.cookie_httponly", 1);
    
    // Set the content type to JSON
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

    // Get the JSON input from the request
    $json_str = file_get_contents('php://input');
    // Decode the JSON input into an associative array
    $json_obj = json_decode($json_str, true);

    // Extract the username and password from the JSON object
    $username = $json_obj['username'];
    $password = $json_obj['password'];

    // This is equivalent to what you previously did with $_POST['username'] and $_POST['password']

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
        // Start the session and set session variables
        session_start();
        $_SESSION['username'] = $username;
        $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32)); // Generate a CSRF token

        // Return success response with the CSRF token
        echo json_encode(array(
            "success" => true,
            "token" => $_SESSION['token'] // Return token to client
        ));
        exit;
    }else{
        // Return failure response if username or password is incorrect
        echo json_encode(array(
            "success" => false,
            "message" => "Incorrect Username or Password"
        ));
        exit;
    }
?>