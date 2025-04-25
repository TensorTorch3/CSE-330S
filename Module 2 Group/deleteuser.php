<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Delete User</title>
</head>
<body>

    <?php
        session_start();
        function deleteUser() {

            // Get username, file path
            $username = $_GET['user2'];
            $_SESSION['user'] = $username;

            $file_path = "/srv/uploads/users.txt"; 

            // FIEO by checking for if username is empty
            if ($username == "") {
                echo "<div class='siteText'><h2 class='messageWording'>Please fill in an actual username</h2></div>";
                return;
            }
            
            // Source for FIEO block of code below: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // Checks if username has weird characters
            if( !preg_match('/^[\w_\-]+$/', $username) ){
                echo "<div class='siteText'><h2 class='messageWording'>Invalid username</h2></div>";
                return;
            }
            
            // Read the file into an array
            $lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES); // Source: https://www.php.net/manual/en/function.file.php


            // Remove the line containing the username
            // Source for array_filter: https://www.php.net/manual/en/function.array-filter.php
            // Source for anonymous functions: https://www.php.net/manual/en/functions.anonymous.php
            $new_lines = array_filter($lines, function ($line) use ($username) { 
                return trim($line) !== $username;
            });


            // If user was found and removed
            // count() source: https://www.php.net/manual/en/function.count.php
            // Source for file put contents: https://www.php.net/manual/en/function.file-put-contents.php
            if (count($new_lines) < count($lines)) { 
                file_put_contents($file_path, implode("\n", $new_lines) . "\n"); // Write updated data
                echo "<div class='siteText'><h2 class='messageWording'> User '{$username}' deleted successfully.</h2></div>";
            } 
            else {
                echo "<div class='siteText'><h2 class='messageWording'>User '{$username}' not found</h2></div>";
            }


            // Defines directory to delete and rmdir to remove it
            $file_path_2 = sprintf("/srv/uploads/%s", htmlentities($username));
            rmdir($file_path_2); // source: https://www.php.net/manual/en/function.rmdir.php

        }

        // Call function
        deleteUser();

    ?> 
    <!-- Go Back button -->
    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='login.html'">Go Back</button>
    </div>    
     
</body>
</html>