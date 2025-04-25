<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
        ini_set('display_errors', '1');
        ini_set('display_startup_errors', '1');
        error_reporting(E_ALL);

        session_start();

        require 'database.php';

        // Use a prepared statement
        $stmt = $mysqli->prepare("SELECT COUNT(*), Username, Password FROM Users WHERE Username=?");

        // Bind the parameter
        $user = $_POST['user2'];
        $stmt->bind_param('s', $user);
        $stmt->execute();

        // Bind the results
        $stmt->bind_result($cnt, $user_id, $pwd_hash);
        $stmt->fetch();

        $pwd_guess = $_POST['password2'];
        
        // Compare the submitted password to the actual password hash

        if($cnt == 1 && password_verify($pwd_guess, $pwd_hash)) {
            // Login succeeded!
            $stmt -> close();

            // Delete Comments that the user owns
            $stmt1 = $mysqli -> prepare("DELETE FROM Comments WHERE user1 = ?");
            $stmt1 -> bind_param("s", $user);
            $stmt1 -> execute();
            $stmt1 -> close();

            // Delete Comments Under User-Owned Stories
            $stmt0 = $mysqli -> prepare("SELECT Title FROM Stories WHERE User = ?");
            $stmt0 -> bind_param("s", $user);
            $stmt0 -> execute();
            $stmt0 -> bind_result($title);
            while ($stmt0 -> fetch()) {
                $stmt2 = $mysqli -> prepare("DELETE FROM Comments WHERE title=?");
                $stmt2 -> bind_param("s", $title);
                $stmt2 -> execute();
                $stmt2 -> close();
            }
            $stmt0 -> close();

            // Delete User
            $stmt3 = $mysqli -> prepare("DELETE FROM Users WHERE Username=?");
            $stmt3 -> bind_param("s", $user);
            $stmt3 -> execute();
            $stmt3 -> close();

            header("Location: login.html");
            exit;
            
            // Redirect to your target page
        } 
        else {
            // Login failed; redirect back to the login screen
            echo "User Deletion Failed";
        }    

    ?>

    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='login.html'">Go Back</button>
    </div>

</body>
</html>