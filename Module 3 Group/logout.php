<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Log Out</title>
</head>
<body>
    
    <?php

    // Source: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP
    // Logs out by destroying session
    session_start();
    session_destroy();


    // Source for switching location code: https://classes.engineering.wustl.edu/cse330/index.php?title=PHP#Other_PHP_Tips
    // Same for other instances of header exit combo
    // Basically just redirects to login.html after you log out which is the log in page
    header("Location: login.html");
    exit;
    ?>

</body>
</html>