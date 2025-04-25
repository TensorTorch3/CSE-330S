<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AJAX Calendar</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <!-- Hidden CSRF token field -->
    <input type="hidden" name="token" id="csrf_token" value="<?php echo $_SESSION['token'];?>" >
    
    <!-- User login and registration section -->
    <div id="user">
        <h2>Log In</h2>
        <input type="text" id="username" placeholder="Username" > <br> <br>
        <input type="password" id="password" placeholder="Password" > <br> <br>
        <button id="login_btn">Log In</button>
        
        <h2>Create New User</h2>
        <input type="text" id="create_username" placeholder="Username" > <br> <br>
        <input type="password" id="create_password" placeholder="Password" > <br> <br>
        <button id="create_user_btn">Create User</button>

        <h2>Delete User</h2>
        <input type="text" id="delete_username" placeholder="Username" > <br> <br>
        <input type="password" id="delete_password" placeholder="Password" > <br> <br>
        <button id="delete_user_btn">Delete User</button>
    </div>
    
    <!-- Calendar section -->
    <div id="calendar" style="display: none;">
        <h2>Calendar</h2>
        <div class="calendar-controls">
            <button id="prev_month_btn">Previous Month</button>
            <button id="next_month_btn">Next Month</button>
            <!-- <button id="event_btn">Add Event</button> -->
            <button id="share_btn">Share Calendar</button>
        </div>
        
        <!-- Category filters -->
        <div class="category-filters">
            <h3>Categories:</h3>
            <button id="filter-default" class="category-filter active" onclick="toggleCategoryFilter('default')">Default</button>
            <button id="filter-work" class="category-filter active" onclick="toggleCategoryFilter('work')">Work</button>
            <button id="filter-personal" class="category-filter active" onclick="toggleCategoryFilter('personal')">Personal</button>
            <button id="filter-family" class="category-filter active" onclick="toggleCategoryFilter('family')">Family</button>
        </div>
        
        <!-- Calendar table -->
        <table class="calendar-table">
            <tr id="month">
                <!-- Month header will be inserted here -->
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
            <tr class="weekday-header">
                <th>Sunday</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
            </tr>
            <tr id="0">
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
            <tr id="1">
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
            <tr id="2">
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
            <tr id="3">
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
            <tr id="4">
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
            <tr id="5">
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
                <th>Filler</th>
            </tr>
        </table>
        <br>

        <button id="logout_btn">Log Out</button>
    </div>

    <!-- Add Event Popup Form -->
    <div id="add_event" style="display: none;">
        <h2>Add Event</h2>
        <input type="text" id="event_title" placeholder="Event Title" > <br> <br>
        <input type="date" id="event_date" > <br> <br>
        <input type="time" id="event_time" > <br> <br>
        <button id="add_event_btn">Add Event</button>
        <button id="cancel_add_btn">Cancel</button>
    </div>

    <!-- Edit Event Popup Form -->
    <div id="edit_event" style="display: none;">
        <h2>Edit Event</h2>
        <input type="text" id="edit_event_title" placeholder="Event Title" > <br> <br>
        <input type="date" id="edit_event_date" > <br> <br>
        <input type="time" id="edit_event_time" > <br> <br>
        <input type="hidden" id="old_event_title" >
        <input type="hidden" id="old_event_date" >
        <input type="hidden" id="old_event_time" >
        <button id="save_event_btn">Save Changes</button>
        <button id="cancel_edit_btn">Cancel</button>
        <button id="delete_event_btn">Delete Event</button>
    </div>

    <!-- Popup forms for adding and editing events -->
    <div id="add_event_popup" class="popup-form" style="display: none;">
        <h2>Add Event</h2>
        <input type="text" id="popup_event_title" placeholder="Event Title" >
        <input type="date" id="popup_event_date" >
        <input type="time" id="popup_event_time" >
        <select id="popup_event_category">
            <option value="default">Default</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="family">Family</option>
        </select>
        <div class="popup-buttons">
            <button id="popup_add_event_btn">Add Event</button>
            <button id="popup_cancel_btn">Cancel</button>
        </div>
    </div>

    <div id="edit_event_popup" class="popup-form" style="display: none;">
        <h2>Edit Event</h2>
        <input type="text" id="popup_edit_event_title" placeholder="Event Title" >
        <input type="date" id="popup_edit_event_date" >
        <input type="time" id="popup_edit_event_time" >
        <select id="popup_edit_category">
            <option value="default">Default</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="family">Family</option>
        </select>
        <!-- Hidden fields to store original values -->
        <input type="hidden" id="popup_edit_old_title" >
        <input type="hidden" id="popup_edit_old_date" >
        <input type="hidden" id="popup_edit_old_time" >
        <div class="popup-buttons">
            <button id="popup_save_event_btn">Save Changes</button>
            <button id="popup_delete_event_btn">Delete Event</button>
            <button id="popup_cancel_edit_btn">Cancel</button>
        </div>
    </div>
    
    <!-- Share Calendar Popup Form -->
    <div id="share_popup" class="popup-form" style="display: none;">
        <h2>Share Calendar</h2>
        <p>Enter the username of the person you want to share your calendar with:</p>
        <input type="text" id="share_username" placeholder="Username" >
        <div class="popup-buttons">
            <button id="submit_share_btn">Share</button>
            <button id="cancel_share_btn">Cancel</button>
        </div>
    </div>

    <!-- Include JavaScript files -->
    <script src="user_ajax.js"></script>
    <script src="calendar_ajax.js"></script>
    <script src="event_ajax.js"></script>
    
    <!-- Add console debug output -->
    <script>
        console.log("Page loaded");
        document.addEventListener("DOMContentLoaded", function() {
            console.log("DOM fully loaded");
            console.log("Calendar display: " + document.getElementById("calendar").style.display);
            console.log("User display: " + document.getElementById("user").style.display);
            
            // Force calendar display for testing if needed
            // Uncomment the lines below to force calendar display for testing
            // document.getElementById("user").style.display = "none";
            // document.getElementById("calendar").style.display = "block";
            // updateCalendar();
        });
    </script>
</body>
</html>