<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculator Results</title>
</head>
<body>
    <?php
        $num1 = $_GET['num1'];
        $num2 = $_GET['num2'];
        $operator = $_GET['operator'];
        if ($operator == "+") {
            $result = $num1 + $num2;
        }
        else if ($operator == "-") {
            $result = $num1 - $num2;
        }
        else if ($operator == "*") {
            $result = $num1 * $num2;
        }
        else {
            $result = $num1 / $num2;
        }
        printf("<p>The result of %f %s %f is %f </p>\n", $num1, $operator, $num2, $result);
    ?>    
</body>
</html>