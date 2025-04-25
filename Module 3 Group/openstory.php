<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Open Story</title>
</head>
<body>
    <?php

        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);
    
        session_start();

        $story_title = $_POST["story_open"];

        require 'database.php';

        $stmt = $mysqli->prepare("select Title, Text from Stories where Title = ?");
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->bind_param("s", $story_title);
        
        $stmt->execute();

        $stmt->bind_result($title, $text);
        
        $num = 0;
        while ($stmt -> fetch()) {
            $num++;
        }

        if ($num != 0) {
            $_SESSION["title"] = $title;
            $_SESSION["text"] = $text;
            header("Location: story.php");
            exit;
        }
        else {
            echo "Invalid story name. Please go back and enter a correct one";
        }

        $stmt->close(); // have this line at the end
    ?>

    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='news.php'">Go Back</button>
    </div>

</body>
</html>