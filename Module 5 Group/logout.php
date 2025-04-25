<?php
    ini_set("session.cookie_httponly", 1);
    session_start();
    session_destroy(); // Destroy session to log out
    echo json_encode(array( // sends back JSON response indicating success
        "success" => true
    ));
?>