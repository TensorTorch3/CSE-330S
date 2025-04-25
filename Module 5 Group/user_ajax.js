// Function to handle user login via AJAX
function loginAjax(event) {
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    // Create a data object to send in the POST request
    const data = { 'username': username, 'password': password };

    // Send a POST request to the login.php script
    fetch("login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            if (data.success) {
                // If login is successful, store the CSRF token and update the UI
                document.getElementById("csrf_token").value = data.token;
                
                alert("You've successfully logged in!");
                document.getElementById("user").style.display = "none";
                document.getElementById("calendar").style.display = "block";

                updateCalendar(); // Update the calendar view
            }
            else {
                // If login fails, display an error message
                alert(`You were not able to log in. ${data.message}`);
            }
        })
        .catch(err => console.error(err)); // Log any errors to the console
}

// Function to handle user registration via AJAX
function addUserAjax(event) {
    const username = document.getElementById("create_username").value; // Get the username from the form
    const password = document.getElementById("create_password").value; // Get the password from the form

    // Create a data object to send in the POST request
    const data = {"guessed_username": username, "guessed_password": password};

    // Send a POST request to the add_user.php script
    fetch("add_user.php", {
        method: "POST", 
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => alert(data.success ? "You've successfully registered" : `You did not successfully create a user. ${data.message}`)) // Display success or error message
    .catch(err => console.error(err)); // Log any errors to the console
}

// Function to handle user logout via AJAX
function logOut(event) {
    // Send a GET request to the logout.php script
    fetch ("logout.php", {
        method: "GET",
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
            alert("You've logged out!"); // Display a logout message
            document.getElementById("user").style.display = "block"; // Show the user login/registration section
            document.getElementById("calendar").style.display = "none"; // Hide the calendar section
    })
    .catch(err => console.error(err)); // Log any errors to the console
}

// Function to handle user deletion via AJAX
function deleteUser(event) {
    const username = document.getElementById("delete_username").value; // Get the username from the form
    const password = document.getElementById("delete_password").value; // Get the password from the form

    // Create a data object to send in the POST request
    const data = {"username": username, "password": password};

    // Send a POST request to the delete_user.php script
    fetch("delete_user.php", {
        method: "POST", 
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => alert(data.success ? "You've successfully deleted the user" : `You did not successfully delete the user. ${data.message}`)) // Display success or error message
    .catch(err => console.error(err)); // Log any errors to the console
}

// Bind the AJAX calls to button clicks
document.getElementById("login_btn").addEventListener("click", loginAjax, false); // Bind the login function to the login button
document.getElementById("create_user_btn").addEventListener("click", addUserAjax, false); // Bind the registration function to the create user button
document.getElementById("delete_user_btn").addEventListener("click", deleteUser, false); // Bind the delete user function to the delete user button
document.getElementById("logout_btn").addEventListener("click", logOut, false); // Bind the logout function to the logout button