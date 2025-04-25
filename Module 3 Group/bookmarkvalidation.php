<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookmark Validation</title>
</head>
<body>
    <?php

        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);

        session_start();

        require 'database.php'; // connection

        // Get variable
        $title = isset($_GET['title']) ? $_GET['title'] : $_SESSION["title"]; // https://www.php.net/manual/en/function.isset.php

        // Prepare statement
        $stmt = $mysqli->prepare("UPDATE Stories SET bookmarked = 1 WHERE title = ?");
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        // Bind parameter title to statement, execute, close
        $stmt->bind_param("s", $title);
        
        $stmt->execute();

        $stmt->close();

        echo "Bookmark Successfully Added!"; // output for successful query
    ?>

<div class="buttonDiv">
        <button class="loginButton" onclick="location.href='news.php'">Go Back</button>
    </div>

</body>
</html>