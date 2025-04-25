<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add User</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <?php 
        session_start();
        function addUser() {
            $username = $_GET['user1'];
            
            // Checks to see if username is empty and rejects it if so
            if ($username == "") {
                echo "<div class='siteText'><h2 class='messageWording'>Please fill in an actual username</h2></div>";
                return;
            }

            // Source for block of code right below: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // Checks to see if username has any weird special characters and rejects it if so
            if( !preg_match('/^[\w_\-]+$/', $username) ){
                echo "<div class='siteText'><h2 class='messageWording'>Invalid username</h2></div>";
                return;
            }

            // Inspiration for block of code right below: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // Basically we change the users.txt file here to add the user in
            $file_path_users = "/srv/uploads/users.txt";   
            $h = fopen($file_path_users, "r");  
            
            // Loops through to see if username is already in users.txt to make sure we're not adding a duplicate user               
            while (!feof($h)) {
                $valid_user = trim(fgets($h));
                if ($username == $valid_user) {
                    echo "<div class='siteText'><h2 class='messageWording'>Username {$username} already exists</h2></div>";
                    fclose($h);
                    return;
                }
            }

            // Otherwise if the user is unique, we add them to the users.txt file
            fclose($h);
            $newPath = fopen($file_path_users, "a");
            fwrite($newPath, $username . "\n"); // Source: https://www.php.net/manual/en/function.fwrite.php
            fclose($newPath);

            // Then we define a new directory 
            $file_path = sprintf("/srv/uploads/%s", htmlentities($username));
            
            // And we make a directory there for the user to upload files
            mkdir($file_path); // Source: https://www.php.net/manual/en/function.mkdir.php
            echo "<div class='siteText'><h2 class='messageWording'> Username {$username} Has Been Added</h2></div>";
        }
        
        addUser();
    ?>  
    <!-- This button here at the bottom allows you to go back which you'll see on many files -->
    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='login.html'">Go Back</button>
    </div>    
    
</body>
</html>