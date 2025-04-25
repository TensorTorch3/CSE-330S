// Credit to Shane Carr for helper methods

(function () {
    "use strict";

    /* Date.prototype.deltaDays(n)
     * 
     * Returns a Date object n days in the future.
     */
    Date.prototype.deltaDays = function (n) {
        // relies on the Date object to automatically wrap between months for us
        return new Date(this.getFullYear(), this.getMonth(), this.getDate() + n);
    };

    /* Date.prototype.getSunday()
     * 
     * Returns the Sunday nearest in the past to this date (inclusive)
     */
    Date.prototype.getSunday = function () {
        return this.deltaDays(-1 * this.getDay());
    };
}());

/** Week
 * 
 * Represents a week.
 * 
 * Functions (Methods):
 *  .nextWeek() returns a Week object sequentially in the future
 *  .prevWeek() returns a Week object sequentially in the past
 *  .contains(date) returns true if this week's sunday is the same
 *      as date's sunday; false otherwise
 *  .getDates() returns an Array containing 7 Date objects, each representing
 *      one of the seven days in this month
 */
function Week(initial_d) {
    "use strict";

    this.sunday = initial_d.getSunday();
        
    
    this.nextWeek = function () {
        return new Week(this.sunday.deltaDays(7));
    };
    
    this.prevWeek = function () {
        return new Week(this.sunday.deltaDays(-7));
    };
    
    this.contains = function (d) {
        return (this.sunday.valueOf() === d.getSunday().valueOf());
    };
    
    this.getDates = function () {
        let dates = [];
        for(let i=0; i<7; i++){
            dates.push(this.sunday.deltaDays(i));
        }
        return dates;
    };
}


/** Month
 * 
 * Represents a month.
 * 
 * Properties:
 *  .year == the year associated with the month
 *  .month == the month number (January = 0)
 * 
 * Functions (Methods):
 *  .nextMonth() returns a Month object sequentially in the future
 *  .prevMonth() returns a Month object sequentially in the past
 *  .getDateObject(d) returns a Date object representing the date
 *      d in the month
 *  .getWeeks() returns an Array containing all weeks spanned by the
 *      month; the weeks are represented as Week objects
 */
function Month(year, month) {
    "use strict";
    
    this.year = year;
    this.month = month;
    
    this.nextMonth = function () {
        return new Month( year + Math.floor((month+1)/12), (month+1) % 12);
    };
    
    this.prevMonth = function () {
        return new Month( year + Math.floor((month-1)/12), (month+11) % 12);
    };
    
    this.getDateObject = function(d) {
        return new Date(this.year, this.month, d);
    };
    
    this.getWeeks = function () {
        let firstDay = this.getDateObject(1);
        let lastDay = this.nextMonth().getDateObject(0);
        
        let weeks = [];
        let currweek = new Week(firstDay);
        weeks.push(currweek);
        while(!currweek.contains(lastDay)){
            currweek = currweek.nextWeek();
            weeks.push(currweek);
        }
        
        return weeks;
    };
}

// For our purposes, we can keep the current month in a variable in the global scope
let currentMonth = new Month(new Date().getFullYear(), new Date().getMonth()); // Start with current month/year
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let activeCategories = ["default", "work", "personal", "family"]; // Default categories

// Change the month when the "next" button is pressed
document.getElementById("next_month_btn").addEventListener("click", function(event){
    currentMonth = currentMonth.nextMonth(); // Move to the next month
    updateCalendar(); // Re-render the calendar in HTML
}, false);

// Change the month when the "prev" button pressed
document.getElementById("prev_month_btn").addEventListener("click", function(event){
    currentMonth = currentMonth.prevMonth(); // Move to the previous month
    updateCalendar(); // Re-render the calendar in HTML
}, false);

// This updateCalendar() function modifies the DOM to display the days and weeks in the current month.
function updateCalendar(){
    let weeks = currentMonth.getWeeks();

    // Removing children
    document.getElementById("month").replaceChildren();

    for (let i = 0; i <= 5; i++) {
        document.getElementById(i).replaceChildren();
    }
    
    // Adding month header that spans all columns
    let month_year_entry = document.createElement("th");
    month_year_entry.setAttribute("colspan", "7"); // Span across all days
    let month_index = currentMonth.getDateObject(1).getMonth();
    let year = currentMonth.getDateObject(1).getFullYear();
    let month_year_text = months[month_index] + " " + year;
    month_year_entry.textContent = month_year_text;

    document.getElementById("month").appendChild(month_year_entry);

    // Add calendar days
    for(let w in weeks){
        let days = weeks[w].getDates();
        
        for(let d in days){
            let day_cell = document.createElement("td");
            let day_button = document.createElement("button");
            
            // Create a div for the day number and a container for events
            let day_number = document.createElement("div");
            day_number.className = "day-number";
            day_number.textContent = days[d].getDate();
            
            let events_container = document.createElement("div");
            events_container.className = "events-container";
            
            // Create a unique ID based on the date
            const dateStr = `${year}-${String(month_index+1).padStart(2, '0')}-${String(days[d].getDate()).padStart(2, '0')}`;
            day_button.setAttribute("data-date", dateStr);
            
            // Mark whether this day belongs to the current month
            if (days[d].getMonth() === month_index) {
                day_button.appendChild(day_number);
                day_button.appendChild(events_container);
                day_cell.appendChild(day_button);
            }
            
            // Add click handler to show add event form
            day_button.addEventListener("click", function(e) {
                // Prevent triggering when clicking on an event
                if (e.target.classList.contains('event-button')) return;
                showAddEventForm(days[d]);
            });
            
            document.getElementById(w).appendChild(day_cell);
        }
    }
 
    // Fetch personal events
    fetchEvents(year, month_index);
    
    // Fetch shared events
    fetchSharedEvents(year, month_index);
}

// Function to fetch personal events
function fetchEvents(year, month_index) {
    const data = {
        "year": year, 
        "month": month_index + 1,
        "token": document.getElementById("csrf_token").value || ''
    };
    
    fetch("display_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"content-type": "application/json"}
    })
    .then(response => response.json())
    .then(data => {
        displayEvents(data, year, month_index);
    })
    .catch(err => console.error("Error fetching events:", err));
}

// Function to fetch shared events
function fetchSharedEvents(year, month_index) {
    const data = {
        "year": year, 
        "month": month_index + 1,
        "token": document.getElementById("csrf_token").value || ''
    };
    
    fetch("display_shared_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"content-type": "application/json"}
    })
    .then(response => response.json())
    .then(data => {
        displaySharedEvents(data, year, month_index);
    })
    .catch(err => console.error("Error fetching shared events:", err));
}

// Function to display events
function displayEvents(data, year, month_index) {
    console.log("Events received:", data.length);
    
    // Sort events by time
    data.sort((a, b) => a.time.localeCompare(b.time));
    
    for (let i = 0; i < data.length; i++) {
        let eventData = data[i];
        
        // Only display events from active categories
        if (!activeCategories.includes(eventData.category || "default")) {
            continue; // Skip this event if its category is not active
        }
        
        // Get the date string from the event data
        const day = parseInt(eventData.day);
        const dateStr = `${year}-${String(month_index+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Find the button for this date
        const dayButton = document.querySelector(`button[data-date="${dateStr}"]`);
        if (dayButton) {
            // Create event button
            const eventButton = document.createElement("button");
            eventButton.textContent = `${eventData.time} - ${eventData.title}`;
            eventButton.className = `event-button category-${eventData.category || 'default'}`;
            
            // Add click event to open edit form
            eventButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Stop event from bubbling up to the day button
                showEditEventForm(eventData);
            });
            
            // Add to the day's cell
            dayButton.appendChild(eventButton);
        }
    }
}

// Function to display shared events
function displaySharedEvents(data, year, month_index) {
    console.log("Shared events received:", data.length);
    
    // Sort events by time
    data.sort((a, b) => a.time.localeCompare(b.time));
    
    for (let i = 0; i < data.length; i++) {
        let eventData = data[i];
        
        // Only display events from active categories
        if (!activeCategories.includes(eventData.category || "default")) {
            continue; // Skip this event if its category is not active
        }
        
        // Get the date string from the event data
        const day = parseInt(eventData.day);
        const dateStr = `${year}-${String(month_index+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Find the button for this date
        const dayButton = document.querySelector(`button[data-date="${dateStr}"]`);
        if (dayButton) {
            // Create event button with owner indication
            const eventButton = document.createElement("button");
            eventButton.textContent = `${eventData.time} - ${eventData.title} (${eventData.owner})`;
            eventButton.className = `event-button category-${eventData.category || 'default'}`;
            // Shared events can't be edited/deleted
            eventButton.style.opacity = "0.8";
            
            // Add to the day's cell
            dayButton.appendChild(eventButton);
        }
    }
}

// Function to toggle category filter
function toggleCategoryFilter(category) {
    const index = activeCategories.indexOf(category);
    const filterButton = document.getElementById(`filter-${category}`);
    
    if (index > -1) {
        // Remove category from active list
        activeCategories.splice(index, 1);
        filterButton.classList.remove("active");
    } else {
        // Add category to active list
        activeCategories.push(category);
        filterButton.classList.add("active");
    }
    
    updateCalendar();
}

// Initialize when document is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Only update if user is logged in
    if (document.getElementById("calendar").style.display !== "none") {
        updateCalendar();
    }
});