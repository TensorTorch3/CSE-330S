<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href= "./styles.css">
    <title>File Processing</title>
</head>
<body>

    <header>
        <h1 class="title">Welcome to Your File Manager</h1>
    </header>

    <!-- Basically a form in order to upload a file -->
    <div id="fileDiv" class="formDiv">
        <h2> Upload File</h2>
        <!-- Source regarding forms: https://devnetwork.net/viewtopic.php?t=20825 -->
        <form class= "formself" enctype = "multipart/form-data" action = "uploader.php" method = "POST">
            <input type = "hidden" name = "MAX_FILE_SIZE" value = "100000000">
            <label for = "uploadfile_input"> Choose a file to upload:</label> <input name = "uploadedfile" type = "file" id = "uploadfile_input">
            <input type = "submit" value = "Upload File">
        </form>
    </div>
    
    <!-- Form to get file directory -->
    <div id="userDirDiv" class="formDiv">
        <h2> File Directory</h2>
        <?php
        session_start();
        $username = $_SESSION['user'];
        
        // If there's no username, bar access from fileprocessing.php
        if ($username == "") {
            header("Location: login.html");
            exit;
        }

        $directory = sprintf("/srv/uploads/%s/", htmlentities($username));
        $files = scandir($directory); // Source: https://www.php.net/manual/en/function.scandir.php
        
        // Lists out each file in the directory
        foreach ($files as $file) { // Source: https://www.php.net/manual/en/control-structures.foreach.php
                if ($file !== "." && $file !== "..") {
                    echo "<div class='fileItem'><a class='fileClass' href='open.php?file=$file' target='_blank'>$file</a></div>";
                }
        }
        ?>
        <br>
    </div>

    <!-- Form to open a file -->
    <div id="openFile" class="formDiv">
        <h2> Open File </h2>
        <form class= "formself" action = "open.php" method = "GET">
            <label>Choose file to open:<input type = "text" name = "file"></label>
            <input type = "submit" value = "Open">
        </form>
    </div>

    <!-- Form to delete a file-->
    <div id="deleteFile" class="formDiv">
        <h2> Delete File </h2>
        <form class= "formself" action = "delete.php" method = "GET">
            <label>Choose file to delete:<input type = "text" name = "file"></label>
            <input type = "submit" value = "Delete">
        </form>       
    </div>

    <!-- Form to log out -->
    <div id = "logOut" class="formDiv">
        <h2> Log Out </h2>
        <form class= "formself" action = "logout.php" method = "GET">
            <input type = "submit" value = "Log Out">
        </form> 
    </div>

</body>
</html>