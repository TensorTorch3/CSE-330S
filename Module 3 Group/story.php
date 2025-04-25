<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <?php

        session_start();

        $title = isset($_GET['title']) ? $_GET['title'] : $_SESSION["title"];
        $_SESSION["title"] = $title;
        $user = $_SESSION["user"];
        
        require 'database.php';

        $stmt1 = $mysqli->prepare("SELECT text, user, link FROM Stories WHERE title = ?");
        if(!$stmt1){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt1->bind_param("s", $title);
        $stmt1->execute();
        $stmt1->bind_result($text, $user, $link);
        $stmt1->fetch();
        
        echo "<div class='story-header'>";
        printf("<div class='story-title'>%s</div><div class='story-author'>written by %s</div>", 
            htmlspecialchars($title), 
            htmlspecialchars($user)
        );
        echo "</div>";
        if ($user == $_SESSION['user']) {
            echo "<form action='edit_story.php' method='POST' style='display:inline'>
                    <input type='text' name='new_text' value='".htmlspecialchars($text)."'>
                    <input type='hidden' name='old_text' value='".htmlspecialchars($text)."'>
                    <input type='hidden' name='title' value='".htmlspecialchars($title)."'>
                    <input type='submit' value='Edit'>
                </form>";
            echo "<form action='delete_story.php' method='POST' style='display:inline'>
                    <input type='hidden' name='title' value='".htmlspecialchars($title)."'>
                    <input type='submit' value='Delete'>
                </form>";

        }

        $stmt1->close();

        $stmt = $mysqli->prepare("select comment, user1 from Comments where title = ?");
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->bind_param("s", $title);
        
        $stmt->execute();

        $stmt->bind_result($comment1, $user1);
        
        echo "<div class='comments-section'>" . htmlspecialchars($text) . "</div>";
        echo "<div class='comments-section'>Link: " . htmlspecialchars($link) . "</div>";

        // Comments loop
        while ($stmt->fetch()) {
            echo "<div class='comment'>";
            echo "<span class='comment-author'>" . htmlspecialchars($user1) . " commented:</span>";
            echo "<div class='comment-text'>" . htmlspecialchars($comment1) . "</div>";
            
            // Show edit/delete forms if user owns the comment
            if ($user1 == $_SESSION['user']) {
                echo "<div class='comment-actions'>";
                echo "<form action='edit_comment.php' method='POST'>
                        <input type='text' name='new_comment' value='".htmlspecialchars($comment1)."'>
                        <input type='hidden' name='old_comment' value='".htmlspecialchars($comment1)."'>
                        <input type='hidden' name='title' value='".htmlspecialchars($title)."'>
                        <input type='submit' value='Edit'>
                      </form>";
        
                echo "<form action='delete_comment.php' method='POST'>
                        <input type='hidden' name='title' value='".htmlspecialchars($title)."'>
                        <input type='hidden' name='comment' value='".htmlspecialchars($comment1)."'>
                        <input type='submit' value='Delete'>
                    </form>";
                echo "</div>";
            }
            echo "</div>";
        }
        
        $stmt->close();
    ?>
        
    <div class="formDiv" id="commenter">
        <h2> Leave a Comment! </h2>
        <form class= "formself" action = "commentvalidation.php" method = "POST">
            <label>Comment: <input type = "text", name = "comment"> </label>
            <input type="hidden" name="story_title" value="<?php echo htmlspecialchars($title); ?>">
            <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>">
            <input type = "submit" value = "Submit">
        </form> 
    </div>
    <div class="formDiv" class="bookmark"id="bookmarker">
        <h2> Bookmark! </h2>
        <form class= "formself" action = "bookmarkvalidation.php" method = "POST">
            <input type = "submit" value = "Add Bookmark">
        </form> 
    </div>
    <div class="formDiv" class="bookmark"id="undoBookmarker">
        <h2> Undo Bookmark </h2>
        <form class= "formself" action = "undobookmarkvalidation.php" method = "POST">
            <input type = "submit" value = "Remove Bookmark">
        </form> 
    </div>
    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='news.php'">Go Back</button>
    </div>
</body>
</html>