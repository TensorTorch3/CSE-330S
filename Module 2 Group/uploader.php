<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uploader</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <?php

        session_start();
        function upload() {
            // Source upload large files: https://www.sitepoint.com/upload-large-files-in-php/
            // Allows for up to 10 MB file upload by giving enough file size and execution time
            ini_set('upload_max_filesize', '10M');
            ini_set('post_max_size', '10M');
            ini_set('max_input_time', 300);
            ini_set('max_execution_time', 300);

            $filename = basename($_FILES['uploadedfile']['name']);

            // Source for FIEO: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // Makes sure filename has no weird characters
            if (!preg_match("/^[\w_\.\-]+$/", $filename)) {
                echo "<div class='siteText'><h2 class='messageWording'>Invalid filename b/c it has special character like space, $, etc.</h2></div>";
                return;
            }

            $username = $_SESSION["user"];

            // Source for FIEO: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // Makes sure that username has no weird characters
            if (!preg_match("/^[\w_\-]+$/", $username)) {
                echo "<div class='siteText'><h2 class='messageWording'>Invalid username</h2></div>";
                return;
            }

            $full_path = sprintf("/srv/uploads/%s/%s", htmlentities($username), htmlentities($filename));

            // Source of block of code below: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
            // if statement that checks if the file was successfully uploaded to the correct path
            // if so, go to upload_success.html otherwise go to upload_failure.html

            if( copy($_FILES['uploadedfile']['tmp_name'], $full_path) ){
                header("Location: upload_success.html");
                exit;
            }
            else {
                header("Location: upload_failure.html");
                exit;
            }
        }

        // Call function
        upload();

        ?>
        
        <!-- Back button -->
        <div class="buttonDiv">
            <button class="mainPagebutton" onclick="location.href='fileprocessing.php'">Go Back</button>
        </div>
        
    </body>
</html>