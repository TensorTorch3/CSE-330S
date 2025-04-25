<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story Validation</title>
</head>
<body>
    <?php

        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);

        session_start();

        // if(!hash_equals($_SESSION['token'], $_POST['token'])){
        //     die("Request forgery detected");
        // }

        $title = $_POST["title"];
        $story_text = $_POST["story_text"];
        $link = $_POST["link"];
        $user = $_SESSION["user"];
        $category = $_POST["category"];
        
        require 'database.php';

        $target_dir = "uploads/";
    
        if ($link == "") {
            $stmt = $mysqli->prepare("insert into Stories (title, text, user, category, bookmarked) values (?, ?, ?, ?, 0)");
        }
        else {
            $stmt = $mysqli->prepare("insert into Stories (title, text, user, link, category, bookmarked) values (?, ?, ?, ?, ?, 0)");
        }
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }

        if ($link == "") {
            $stmt->bind_param('ssss', $title, $story_text, $user, $category);
            $stmt->execute();
        }
        else {
            $stmt->bind_param('sssss', $title, $story_text, $user, $link, $category);
            $stmt->execute();
        }
        
        echo "Story successfully added!";

        $stmt->close();

    ?>

    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='news.php'">Go Back</button>
    </div>

</body>
</html>