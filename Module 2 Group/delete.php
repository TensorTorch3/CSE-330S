<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Files</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

     <?php
        session_start();

        // Important variables to do the work
        $username = $_SESSION['user'];
        $filename = $_GET['file'];
        $directory = sprintf("/srv/uploads/%s/", htmlentities($username));
        $full_path = "/srv/uploads/$username/$filename";
        
        // Source for below block of code: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
        // Makes sure no weird characters in filename
        if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
            echo "<div class='siteText'><h2 class='messageWording'>Invalid filename</h2></div>";
        }

        $username = $_SESSION["user"];

        // Source for below block of code: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
        // Makes sure no weird characters in username
        if( !preg_match('/^[\w_\-]+$/', $username) ){
            echo "<div class='siteText'><h2 class='messageWording'>Invalid username</h2></div>";
        }

        // Citation for deleting code: https://stackoverflow.com/questions/2371408/how-to-delete-a-file-via-php
        // Basically here we're deleting the files using unlink
        if (unlink($full_path)) {
            echo "<div class='siteText'><h2 class='messageWording'>File <strong>$filename</strong> has been deleted.</h2></div>";

        } else {
            echo "<div class='siteText'><h2 class='messageWording'>Failed to delete the file</h2></div>";
        }
    

    ?>
        <!-- Go Back Button -->
        <div class="buttonDiv">
            <button class="mainPagebutton" onclick="location.href='fileprocessing.php'">Go Back</button>
        </div>
        
</body>
</html>