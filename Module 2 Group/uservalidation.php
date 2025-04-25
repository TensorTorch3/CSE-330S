<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Validation Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <?php
        session_start();
        function iterate() {

            $username = $_GET['user'];
            $_SESSION['user'] = $username;

            $file_path = "/srv/uploads/users.txt";

            // Source for all of code below: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // Opens up users.txt to check for user
            $h = fopen($file_path, "r");
            
            // Iterates through each line of users.txt
            while (!feof($h)) {
                
                $valid_user = trim(fgets($h)); // For each line of the file, you get the username and trim out excess content

                // If username matches up with a username in the file and username is not empty
                // Then head over to the file manager in fileprocessing.php
                if ($username == $valid_user && $username != "") {
                    header("Location: fileprocessing.php");
                    exit;
                }
            }
            
            // Close the file
            fclose($h);
            
            // If the user hasn't alr exited the uservalidation.php page to go to file manager, that means username invalid
            // So we have relevant message to display that
            echo "<div class='siteText'><h2 class='messageWording'>Invalid username. Please go back and enter a valid username.</h2></div>";
            
        }
        
        iterate();
    ?>
    
    <br>
    <!-- Back button -->
    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='login.html'">Go Back</button>
    </div>  

</body>
</html>