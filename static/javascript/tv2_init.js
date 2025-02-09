// const API_URL_BASE = 'https://alex-haas.com/tv2/api';
const API_URL_BASE = 'http://127.0.0.1:5000/tv2/api';
// let VIEWS_OBJ = false;

function close_popups() {
    try {
        // Select all divs with the class 'popup'
        const divsToHide = document.querySelectorAll(".popup");
        // Loop through each div and set display to 'none'
        divsToHide.forEach(div => {
            div.style.display = "none";
        });
    } catch (error) {
        handleError("close_popups", error);
    }
}

function handleError(functionName, error) {
    console.error(`Error in ${functionName}:`, error);
}

function is_all_digits(str) {
    try {
        return /^\d+$/.test(str);
    } catch (error) {
        handleError("is_all_digits", error);
    }
}

function view_apply() {
    try {
        if (!VIEWS_OBJ) { return; }
        let object_keys = Object.keys(VIEWS_OBJ);
        for (let i = 0; i < object_keys.length; i++) {
            let temp_doc = document.getElementById(object_keys[i]);
            // skip assigning value if id cannot be found
            if (temp_doc) {
                temp_doc.value = VIEWS_OBJ[object_keys[i]];
                temp_doc.dataset.view_config = VIEWS_OBJ[object_keys[i]];
            }
        }
    } catch (error) {
        handleError("view_apply", error);
    }
}

async function view_configs_get(target) {
    try {
        let url = API_URL_BASE + '/view_get/' + target
        // Make an asynchronous GET request to the API
        const response = await fetch(url, {method: 'GET'});
        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the JSON data from the response
        const data = await response.json();
        VIEWS_OBJ = data.data;
    } catch (error) {
        // Handle errors
        console.error("There was an error with the fetch request: get_view_configs(): ", error);
    }
}

async function view_update(view_obj) {
    try {
        let url = API_URL_BASE + '/view_update/' + JSON.stringify(view_obj);
        // make asynchronous POST request to the API
        const response = await fetch(url, {method: 'GET'});
        // check if response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the JSON data from the response
        const data = await response.json();
        if (data.status !== 200) {
            console.log('view_update: ' + data.statusCode);
        }
    } catch (error) {
        // Handle errors
        console.error("There was an error with the fetch request: view_update: ", error);
    }
}