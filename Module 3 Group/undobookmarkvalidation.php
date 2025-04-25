<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remove Bookmark Validation</title>
</head>
<body>
    <?php

        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);

        session_start();

        require 'database.php';

        $title = isset($_GET['title']) ? $_GET['title'] : $_SESSION["title"];

        $stmt = $mysqli->prepare("UPDATE Stories SET bookmarked = 0 WHERE title = ?");
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->bind_param("s", $title);
        
        $stmt->execute();

        $stmt->close();

        echo "Bookmark Successfully Removed!";
    ?>

<div class="buttonDiv">
        <button class="loginButton" onclick="location.href='news.php'">Go Back</button>
    </div>

</body>
</html>