<?php
    session_start();

    $filename = $_GET["file"];

    // Source: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
    // Doesn't allow file if it has weird special characters in it
    if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
        echo htmlentities("Invalid filename");
    }

    $username = $_SESSION["user"];

    // Source: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
    // Doesn't allow username if it has weird special characters in it
    if( !preg_match('/^[\w_\-]+$/', $username) ){
        echo htmlentities("Invalid username\n");
    }

    $full_path = sprintf("/srv/uploads/%s/%s", htmlentities($username), htmlentities($filename));

    //
    // Source for all the PHP code below: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
    //
    
    // This code gets the content type
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($full_path);

    // Which you can then use to show the file on the page
    header("Content-Type: ".$mime);
    header('content-disposition: inline; filename="'.$filename.'";');
    $readfileworks = readfile($full_path);

    // For this part down here, if the file was not successfully read, that means it doesn't exist so we have relevant output
    // here
    if (!($readfileworks)) {
        echo htmlentities("Nonexistent file");
    }

?>