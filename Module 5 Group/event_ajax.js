// function goToAddEventAjaxPage(event) {
//     document.getElementById("calendar").style.display = "none";
//     document.getElementById("add_event").style.display = "block";
// }

// Function to show the add event form with the selected date pre-filled
function showAddEventForm(date) {
    document.getElementById("popup_event_date").value = date.toISOString().split('T')[0];
    document.getElementById("add_event_popup").style.display = "block";
}

// Function to show the edit event form with the event details pre-filled
function showEditEventForm(evt) {
    document.getElementById("popup_edit_event_title").value = evt.title;
    document.getElementById("popup_edit_event_date").value = evt.date;
    document.getElementById("popup_edit_event_time").value = evt.time;
    document.getElementById("popup_edit_old_title").value = evt.title;
    document.getElementById("popup_edit_old_date").value = evt.date;
    document.getElementById("popup_edit_old_time").value = evt.time;
    document.getElementById("popup_edit_category").value = evt.category || "default";
    document.getElementById("edit_event_popup").style.display = "block";
}

// Function to save the edited event
function savePopupEditedEvent() {
    const eventTitle = document.getElementById("popup_edit_event_title").value;
    const eventDate = document.getElementById("popup_edit_event_date").value;
    const eventTime = document.getElementById("popup_edit_event_time").value;
    const oldTitle = document.getElementById("popup_edit_old_title").value;
    const oldDate = document.getElementById("popup_edit_old_date").value;
    const oldTime = document.getElementById("popup_edit_old_time").value;
    const category = document.getElementById("popup_edit_category").value;
    
    const data = { 
        "event_title": eventTitle, 
        "event_date": eventDate, 
        "event_time": eventTime, 
        "old_title": oldTitle, 
        "old_date": oldDate, 
        "old_time": oldTime,
        "category": category,
        "action": "edit" 
    };
    
    uploader("edit", data);
    document.getElementById("edit_event_popup").style.display = "none";
}

// Function to delete an event
function deletePopupEvent() {
    const oldTitle = document.getElementById("popup_edit_old_title").value;
    const oldDate = document.getElementById("popup_edit_old_date").value;
    const oldTime = document.getElementById("popup_edit_old_time").value;
    
    const data = { 
        "event_title": oldTitle, 
        "event_date": oldDate, 
        "event_time": oldTime, 
        "old_title": oldTitle, 
        "old_date": oldDate, 
        "old_time": oldTime,
        "action": "delete" 
    };
    
    uploader("delete", data);
    document.getElementById("edit_event_popup").style.display = "none";
}

// Function to add a new event
function addPopupEvent() {
    const title = document.getElementById("popup_event_title").value;
    const date = document.getElementById("popup_event_date").value;
    const time = document.getElementById("popup_event_time").value;
    const category = document.getElementById("popup_event_category").value;
    
    const data = {
        "event_title": title, 
        "event_date": date, 
        "event_time": time, 
        "category": category,
        "action": "add"
    };
    
    uploader("add", data);
    document.getElementById("add_event_popup").style.display = "none";
}

// Function to share the calendar with another user
function shareCalendar() {
    const shareUsername = document.getElementById("share_username").value;
    
    const data = {
        "share_with": shareUsername,
        "token": getCSRFToken()
    };
    
    fetch("share_calendar.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"content-type": "application/json"}
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert(`Calendar successfully shared with ${shareUsername}`);
            document.getElementById("share_popup").style.display = "none";
        } else {
            alert(`Failed to share calendar: ${data.message}`);
        }
    })
    .catch(err => {
        console.error("Error sharing calendar:", err);
        alert("Error sharing calendar. Please try again.");
    });
}

// Function to handle add, edit, and delete actions for events
function uploader(decider, data) {
    // Add CSRF token to all requests
    data.token = getCSRFToken();
    
    fetch("add_edit_delete_event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"content-type": "application/json"}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (decider == "edit") {
                alert("You've successfully edited an event");
            }
            else if (decider == "add") {
                alert("You've successfully added an event");
            }
            else {
                alert("You've successfully deleted an event");
            }
            updateCalendar();
        }
        else {
            alert(`You did not successfully ${decider} an event. ${data.message}`);
        }
    })
    .catch(err => {
        console.error("Error in uploader:", err);
        alert(`Error: ${err.message}`);
    });
}

// Function to get the CSRF token
function getCSRFToken() {
    return document.getElementById("csrf_token").value || '';
}

// Function to toggle the visibility of a category
function toggleCategory(category) {
    const categoryElement = document.getElementById(`category-${category}`);
    const isDisabled = categoryElement.classList.contains('disabled');
    
    if (isDisabled) {
        categoryElement.classList.remove('disabled');
    } else {
        categoryElement.classList.add('disabled');
    }
    
    updateCalendar();
}

// Function to show the share calendar popup
function showSharePopup() {
    document.getElementById("share_popup").style.display = "block";
}

// Legacy form support for adding an event
function addEvent(event) {
    const title = document.getElementById("event_title").value;
    const date = document.getElementById("event_date").value;
    const time = document.getElementById("event_time").value;
    const data = {"event_title": title, "event_date": date, "event_time": time, "action": "add"};
    uploader("add", data);
}

// Legacy form support for saving an edited event
function saveEditedEvent(evt) {
    const eventTitle = document.getElementById("edit_event_title").value;
    const eventDate = document.getElementById("edit_event_date").value;
    const eventTime = document.getElementById("edit_event_time").value;
    const oldTitle = document.getElementById("old_event_title").value;
    const oldDate = document.getElementById("old_event_date").value;
    const oldTime = document.getElementById("old_event_time").value;
    const category = document.getElementById("edit_category").value || "default";
    
    const data = { 
        "event_title": eventTitle, 
        "event_date": eventDate, 
        "event_time": eventTime, 
        "old_title": oldTitle, 
        "old_date": oldDate, 
        "old_time": oldTime,
        "category": category,
        "action": "edit" 
    };
    
    uploader("edit", data);
    document.getElementById("edit_event").style.display = "none";
    document.getElementById("calendar").style.display = "block";
}

// Legacy form support for deleting an event
function deleteEvent() {
    const oldTitle = document.getElementById("old_event_title").value;
    const oldDate = document.getElementById("old_event_date").value;
    const oldTime = document.getElementById("old_event_time").value;
    
    const data = { 
        "event_title": oldTitle, 
        "event_date": oldDate, 
        "event_time": oldTime, 
        "old_title": oldTitle, 
        "old_date": oldDate, 
        "old_time": oldTime,
        "action": "delete" 
    };
    
    uploader("delete", data);
    document.getElementById("edit_event").style.display = "none";
    document.getElementById("calendar").style.display = "block";
}

// Event listeners for legacy forms
// document.getElementById("event_btn").addEventListener("click", goToAddEventAjaxPage, false);
document.getElementById("add_event_btn").addEventListener("click", addEvent, false);
document.getElementById("save_event_btn").addEventListener("click", saveEditedEvent, false);
document.getElementById("delete_event_btn").addEventListener("click", deleteEvent, false);
document.getElementById("cancel_edit_btn").addEventListener("click", function() {
    document.getElementById("edit_event").style.display = "none";
    document.getElementById("add_event").style.display = "none";
    document.getElementById("calendar").style.display = "block";
}, false);

// Popup event listeners
document.getElementById("popup_add_event_btn").addEventListener("click", addPopupEvent, false);
document.getElementById("popup_save_event_btn").addEventListener("click", savePopupEditedEvent, false);
document.getElementById("popup_delete_event_btn").addEventListener("click", deletePopupEvent, false);
document.getElementById("popup_cancel_btn").addEventListener("click", function() {
    document.getElementById("add_event_popup").style.display = "none";
}, false);
document.getElementById("popup_cancel_edit_btn").addEventListener("click", function() {
    document.getElementById("edit_event_popup").style.display = "none";
}, false);
document.getElementById("share_btn").addEventListener("click", showSharePopup, false);
document.getElementById("submit_share_btn").addEventListener("click", shareCalendar, false);
document.getElementById("cancel_share_btn").addEventListener("click", function() {
    document.getElementById("share_popup").style.display = "none";
}, false);

// Add event listener for the share button if it exists
document.addEventListener("DOMContentLoaded", function() {
    const shareBtn = document.getElementById("share_btn");
    if (shareBtn) {
        shareBtn.addEventListener("click", showSharePopup, false);
    }
    
    const submitShareBtn = document.getElementById("submit_share_btn");
    if (submitShareBtn) {
        submitShareBtn.addEventListener("click", shareCalendar, false);
    }
    
    const cancelShareBtn = document.getElementById("cancel_share_btn");
    if (cancelShareBtn) {
        cancelShareBtn.addEventListener("click", function() {
            document.getElementById("share_popup").style.display = "none";
        }, false);
    }
    
    // Also add a cancel button for add event form
    const cancelAddBtn = document.getElementById("cancel_add_btn");
    if (cancelAddBtn) {
        cancelAddBtn.addEventListener("click", function() {
            document.getElementById("add_event").style.display = "none";
            document.getElementById("calendar").style.display = "block";
        }, false);
    }
});

// Clean up duplicate event listeners in DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
    // Only add these event listeners if they haven't been added yet
    const shareBtn = document.getElementById("share_btn");
    if (shareBtn && !shareBtn._hasShareListener) {
        shareBtn._hasShareListener = true;
        shareBtn.addEventListener("click", showSharePopup, false);
    }
    
    const cancelAddBtn = document.getElementById("cancel_add_btn");
    if (cancelAddBtn && !cancelAddBtn._hasListener) {
        cancelAddBtn._hasListener = true;
        cancelAddBtn.addEventListener("click", function() {
            document.getElementById("add_event").style.display = "none";
            document.getElementById("calendar").style.display = "block";
        }, false);
    }
});

// Remove duplicate event listeners in DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
    // Remove the duplicate event listener block to avoid conflicts
    
    // Make sure all popup elements exist before attaching event listeners
    const popups = document.querySelectorAll('.popup-form');
    if (popups.length === 0) {
        console.error("No popup forms found!");
    }
    
    if (document.getElementById("calendar").style.display !== "none") {
        updateCalendar();
    }
});