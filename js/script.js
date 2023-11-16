// Python host
// cmd command (localhost)
// py -m http.server

// Base URL for a random activity
let base_url = "https://www.boredapi.com/api/activity/";
// URL for a random activity selected by type
// education, recreational, social, diy, charity, cooking, relaxation, music, busywork
// http://www.boredapi.com/api/activity?type=
// URL for a random activity selected by number of participants
// http://www.boredapi.com/api/activity?participants=
// URL for a random activity selected by price (range: 0.0 - 1.0, 0.0 = free)
// http://www.boredapi.com/api/activity?price=
// URL for a random activity selected by accesibility (range: 0.0 - 1.0)
// http://www.boredapi.com/api/activity?accessibility=
// Activity not found: {"error":"No activity found with the specified parameters"}

// Activities saved temporarily
let generated_activities = [];

// Activities saved permanently in localStorage
let saved_activities = [];

// Function that loads saved activities
function load_data(){
    let activities = JSON.parse(localStorage.getItem("saved_activities"));
    if(activities == null){
        localStorage.setItem("saved_activities", JSON.stringify(saved_activities));
    }else{
        saved_activities = activities;
    }
    show_saved_activities();
}
load_data();

// Function used to create a delay in ms
function delay(time){
    return new Promise(resolve => setTimeout(resolve, time));
}

// Function that animate the title div
async function slide(){
    await delay(1000);
    let actilist = document.getElementById("actilist");
    let height = window.screen.height;
    actilist.animate(
        [
            {transform: "translateY(0px)"},
            {transform: "translateY(-" + height + "px)"}
        ],
        {duration: 1500}
    );
    actilist.style.transform = "translateY(-" + height + "px)";
}
slide();

// Function that generates an activity based on the filters
async function load(full_url){
    let response = await fetch(full_url);
    let activity = await response.json();
    let icon = document.getElementById("icon");
    let message = document.getElementById("message");
    icon.innerHTML = "";
    message.innerHTML = "";
    await delay(500);
    if(activity.hasOwnProperty("error")){
        icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation info yellow_icon"></i>';
        message.innerHTML = activity.error;
        return;
    }
    icon.innerHTML = '<i class="fa-solid fa-check info orange_icon"></i>';
    message.innerHTML = "Activity added to the generated activity list";
    activity.generated = new Date().toLocaleString();
    generated_activities.splice(0, 0, activity);
    show_generated_activities();
    show_saved_activities();
}

// Function that shows the list of generated activities in the 2nd column
function show_generated_activities(){
    let generated = document.getElementById("generated");
    generated.innerHTML = "";
    for(let i = 0; i < generated_activities.length; i++){
        let activity_data = document.createElement("div");
        let activity = generated_activities[i];
        activity_data.innerHTML = "<div class='activity_name'>" +
        activity.activity + 
        "</div>";
        let activity_table = document.createElement("table");
        activity_table.classList.add("activity_table");
        activity_table.innerHTML = "<tr><td>Type</td><td>" +
        activity.type +
        "<tr><td>Participants</td><td>" +
        activity.participants +
        "</td></tr><tr><td>Price</td><td><i class='fa-solid fa-star info yellow_icon'></i> " +
        (((1 - activity.price) * 4) + 1).toFixed(1) + 
        "</td></tr><tr><td>Accessibility</td><td><i class='fa-solid fa-star info yellow_icon'></i> " +
        ((activity.accessibility * 4) + 1).toFixed(1) +
        "</td></tr><tr><td>Generated</td><td>" +
        activity.generated +
        "</td></tr>";
        activity_data.appendChild(activity_table);
        activity_data.innerHTML += "<div class='buttons'><input type='button' value='Save activity' onclick='save_generated_activity(" +
        i +
        ")'><input type='button' value='Delete activity' onclick='delete_generated_activity(" +
        i +
        ")'></div>";
        generated.appendChild(activity_data);
        if(i == generated_activities.length - 1){
            return;
        }
        generated.appendChild(document.createElement("hr"));
    }
}

// Function that shows the list of saved activities in the 3rd column
function show_saved_activities(){
    let saved = document.getElementById("saved");
    saved.innerHTML = "";
    for(let i = 0; i < saved_activities.length; i++){
        let activity_data = document.createElement("div");
        let activity = saved_activities[i];
        activity_data.innerHTML = "<div class='activity_name'>" +
        activity.activity + 
        "</div>";
        let activity_table = document.createElement("table");
        activity_table.classList.add("activity_table");
        activity_table.innerHTML = "<tr><td>Type</td><td>" +
        activity.type +
        "<tr><td>Participants</td><td>" +
        activity.participants +
        "</td></tr><tr><td>Price</td><td><i class='fa-solid fa-star info yellow_icon'></i> " +
        (((1 - activity.price) * 4) + 1).toFixed(1) + 
        "</td></tr><tr><td>Accessibility</td><td><i class='fa-solid fa-star info yellow_icon'></i> " +
        ((activity.accessibility * 4) + 1).toFixed(1) +
        "</td></tr><tr><td>Generated</td><td>" +
        activity.generated +
        "</td></tr><tr><td>Saved</td><td>" +
        activity.saved +
        "</td></tr>";
        if(activity.finished){
            activity_table.innerHTML += "<tr><td>Finished</td><td>" +
            activity.finished +
            "</td></tr>";
        }
        activity_data.appendChild(activity_table);
        if(activity.finished){
            activity_data.innerHTML += "<div class='buttons'><input type='button' value='Delete activity' onclick='delete_saved_activity(" +
            i +
            ")'></div>";
        }else{
            activity_data.innerHTML += "<div class='buttons'><input type='button' value='Finish activity' onclick='finish_saved_activity(" +
            i +
            ")'><input type='button' value='Delete activity' onclick='delete_saved_activity(" +
            i +
            ")'></div>";
        }
        saved.appendChild(activity_data);
        if(i == saved_activities.length - 1){
            return;
        }
        saved.appendChild(document.createElement("hr"));
    }
}

// Function that sets the orange background before the dot in the range inputs
function set_scroll(id){
    let slider = document.getElementById(id);
    let value = slider.value;
    let max = slider.getAttribute("max");
    let progress = (value / max) * 100;
    slider.style.background = `linear-gradient(to right, #ff7247 ${progress}%, #f5cb5c ${progress}%, #f5cb5c 100%)`;
}

// Function that saves the generated activities
function save_generated_activity(index){
    let saved_activity = generated_activities[index];
    saved_activity.saved = new Date().toLocaleString();
    saved_activities.splice(0, 0, saved_activity);
    localStorage.setItem("saved_activities", JSON.stringify(saved_activities));
    show_generated_activities();
    show_saved_activities();
    delete_generated_activity(index);
}

// Function that deletes a generated activity
function delete_generated_activity(index){
    generated_activities.splice(index, 1);
    show_generated_activities();
}

// Function that save when the activity is finished
function finish_saved_activity(index){
    saved_activities[index].finished = new Date().toLocaleString();
    localStorage.setItem("saved_activities", JSON.stringify(saved_activities));
    show_saved_activities();
}

// Function that delete a saved activity
function delete_saved_activity(index){
    saved_activities.splice(index, 1);
    localStorage.setItem("saved_activities", JSON.stringify(saved_activities));
    show_saved_activities();
}

// Function that hides all the filters
function hide_filters(){
    let filters = document.getElementsByClassName("filter");
    for(let i = 0; i < filters.length; i++){
        let filter = filters[i];
        if(!filter.classList.contains("hidden")){
            filter.classList.add("hidden");
        }
    }
}

// Function that show the active filter
function show_filter(){
    hide_filters();
    let checked = document.querySelector("input[name='filter']:checked").value;
    let selected_filter = document.getElementById("selected_filter");
    selected_filter.innerHTML = checked.charAt(0).toUpperCase() + checked.slice(1);
    if(checked == "random"){
        return;
    }
    let filter = document.getElementById(checked + "_filter");
    if(filter.classList.contains("hidden")){
        filter.classList.remove("hidden");
    }
}
show_filter();

// Function that search an activity based on the selected filter
function search_activity(){
    let checked = document.querySelector("input[name='filter']:checked").value;
    let full_url = base_url;
    if(checked != "random"){
        let filter = document.getElementById(checked + "_filter");
        full_url += "?" + checked + "=" + filter.value;
    }
    load(full_url);
}