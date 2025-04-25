<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <?php

        // ini_set('display_errors', '1');
        // ini_set('display_startup_errors', '1');
        // error_reporting(E_ALL);

        session_start();
        echo "<header><h1>Stories</h1></header>";
        require 'database.php';

        // function category_output
        $stmt = $mysqli->prepare("select Title, User, Category, Bookmarked from Stories");
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        
        $stmt->execute();

        $stmt->bind_result($title, $username, $category, $bookmarked);

        echo "<div class='formDiv' id='newsarticles''>\n";
        echo "<ul>\n";
        while ($stmt -> fetch()) {
            if (htmlspecialchars($bookmarked) == 1) {
                $bookmark = "Yes";
            }
            else {
                $bookmark = "No";
            }
            printf("\t<div class='fileItem'><a class='fileClass' href='story.php?title=%s'>%s</a> <span class='storyInfo'>written by %s • Category: %s • Bookmarked: %s </span></div>\n",
                urlencode($title),
                htmlspecialchars($title),
                htmlspecialchars($username),
                htmlspecialchars($category),
                htmlspecialchars($bookmark)
            );
        }
        echo "</ul>\n";
        echo "</div>\n";
        $stmt->close(); // have this line at the end

    ?>
    <div class="formDiv" id="addStory">
        <form class="formself" action="storyvalidation.php" method="post" enctype="multipart/form-data">
            <h2>Add Story</h2>
            <label>Title:  <input type = "text" name = "title"></label>
            <br> <br>
            <label>Story Text: <input type = "text" name = "story_text"></label>
            <br> <br>
            <label>Link: <input type = "text" name = "link"></label>
            <br> <br>
            <label>Story Category:</label>
            <select id="category" name="category">
                <option value="politics">Politics</option>
                <option value="business">Business</option>
                <option value="sports">Sports</option>
                <option value="world">World</option>
                <option value="other">Other</option>
            </select>
            <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>"> <!-- CSRF Token -->
            <input type = "submit" value = "Add Story">
        </form>
    </div>
    <div class="formDiv" id="storyOpener">
        <h2> Story Opener </h2>
        <form class= "formself" action = "openstory.php" method = "POST">
            <label> Story to Open: <input type = "text" name = "story_open"> </label>
            <input type = "submit" value = "Submit">
        </form> 
    </div>
    <div id = "logOut" class="formDiv">
        <h2> Log Out </h2>
        <form class= "formself" action = "logout.php" method = "POST">
            <input type = "submit" value = "Log Out">
        </form> 
    </div>
</body>
</html>