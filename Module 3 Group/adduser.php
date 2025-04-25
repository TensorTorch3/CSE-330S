<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add User</title>
</head>
<body>
    <p>User creation failed </p>
    <div class="buttonDiv">
        <button class="loginButton" onclick="location.href='login.html'">Go Back</button>
    </div>
    <?php

        // Also all code that is relevant to PHP/MySQL querying can be credited to CSE 330S Wiki
        require 'database.php'; // ensures connection to SQL server

        $username = $_POST['user1'];
        $password = $_POST['password1']; // get username and password
        
        $password_hashed = password_hash($password, PASSWORD_DEFAULT); // hash password

        $stmt = $mysqli->prepare("insert into Users (username, password) values (?, ?)"); // prepare SQL statement to insert into Users
        // table
        
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error); // in the case query prepping fails you want some output
            exit;
        }

        $stmt->bind_param('ss', $username, $password_hashed); // add username and password_hashed variables into SQL statement
        $successful = $stmt->execute();

        $stmt->close(); // Execute and close the statement
        
        if ($successful) {
            header("Location: login.html");
            exit;
        }
    
    ?>
    <!-- Anytime you see this code at the bottom, it's just a back button -->
    

</body>
</html>