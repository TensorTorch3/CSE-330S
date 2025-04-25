<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comment Validation Page</title>
</head>
<body>
    <?php

        session_start();

        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);

        // Variables
        $comment = $_POST["comment"];
        $user = $_SESSION["user"];
        $title = $_SESSION["title"];

        // if(!hash_equals($_SESSION['token'], $_POST['token'])){
        //     die("Request forgery detected");
        // }

        require 'database.php';

        // Prepare SQL statement
        $stmt = $mysqli->prepare("insert into Comments (comment, user1, title) values (?, ?, ?)");
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }

        // Bind comment, user, and title to query, execute, and close
        $stmt->bind_param('sss', $comment, $user, $title);
        $stmt->execute();
        
        echo "Comment successfully added!";

        $stmt->close();

    ?>

    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='story.php'">Go Back</button>
    </div>

</body>
</html>