<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Validation Page</title>
</head>
<body>
    <?php
        // This is a *good* example of how you can implement password-based user authentication in your web application.

        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);

        session_start();

        require 'database.php';

        // Use a prepared statement
        $stmt = $mysqli->prepare("SELECT COUNT(*), Username, Password FROM Users WHERE Username=?");

        // Bind the parameter
        $user = $_POST['user'];
        $stmt->bind_param('s', $user);
        $stmt->execute();

        // Bind the results
        $stmt->bind_result($cnt, $user_id, $pwd_hash);
        $stmt->fetch();

        $pwd_guess = $_POST['password'];
        
        // Compare the submitted password to the actual password hash

        if($cnt == 1 && password_verify($pwd_guess, $pwd_hash)) {
            // Login succeeded!
            $_SESSION['user'] = $user_id;
            $_SESSION['token'] = bin2hex(random_bytes(32));
            header("Location: news.php");
            exit;
            // Redirect to your target page
        } 
        else {
            // Login failed; redirect back to the login screen
            echo "Login Failed";
        }
    ?>

    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='login.html'">Go Back</button>
    </div>

</body>
</html>