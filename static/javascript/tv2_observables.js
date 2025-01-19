// HTML variables
let id_button_create = document.getElementById('button_create');
let id_button_delete_no = document.getElementById('button_delete_no');
let id_button_delete_yes = document.getElementById('button_delete_yes');
let id_button_obs_create_submit = document.getElementById('button_obs_create_submit');
let id_button_obs_observe_submit = document.getElementById('button_obs_observe_submit');
let id_button_obs_update_submit = document.getElementById('button_obs_update_submit');
let id_button_observe_delete_submit = document.getElementById('button_observe_delete_submit');
let id_button_update_rec_obs_submit = document.getElementById('button_update_rec_obs_submit');
let id_clear_find_obs_by_text = document.getElementById('clear_find_obs_by_text');
let id_find_obs_by_text = document.getElementById('find_obs_by_text');
let id_obs_confirm_delete_container = document.getElementById('obs_confirm_delete_container');
let id_obs_create_container = document.getElementById('obs_create_container');
let id_obs_create_error_message = document.getElementById('obs_create_error_message');
let id_obs_update_error_message = document.getElementById('obs_update_error_message');
let id_observe_obs_container = document.getElementById('observe_obs_container');
let id_observe_obs_id = document.getElementById('observe_obs_id');
let id_observe_obs_title = document.getElementById('observe_obs_title');
let id_obss_container = document.getElementById('obss_container');
let id_select_obs_input = document.getElementById('select_obs_input');
let id_select_sort_by = document.getElementById('select_sort_by');
let id_update_obs_container = document.getElementById('update_obs_container');
let id_update_rec_obs_container = document.getElementById('update_rec_obs_container');

let id_chart_menu_all_time = document.getElementById('chart_menu_all_time');
let id_chart_menu_last_7_days = document.getElementById('chart_menu_last_7_days');
let id_chart_menu_last_month = document.getElementById('chart_menu_last_month');
let id_chart_menu_last_quarter = document.getElementById('chart_menu_last_quarter');
let id_chart_menu_last_year = document.getElementById('chart_menu_last_year');
let id_chart_menu_today = document.getElementById('chart_menu_today');

//
let LAST_SORT_BY = '';
const LCL_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;
let OBSS_OBJ = false;
let VIEWS_OBJ = false;
// const URL_BASE = 'https://alex-haas.com/tv2/api';
const URL_BASE = 'http://127.0.0.1:5000/tv2/api';

function confirm_delete_popup(obs_id) {
    try {
        close_popups();
        id_obs_confirm_delete_container.style.display = 'flex';
        id_button_delete_yes.onclick = function () {
            delete_obs(obs_id)
                .then(() => {
                    id_obs_confirm_delete_container.style.display = 'none';
                    get_obss()
                        .catch(error => handleError("get_obss", error));
                })
        }
    } catch (error) {
        handleError("confirm_delete_popup", error);
    }
}

// async function delete_obs(obs_id) {
//     try {
//         console.log(obs_id);
//         let url = URL_BASE + '/obs_delete/' + obs_id;
//         const response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         get_obss()
//             .catch(error => handleError("get_obss", error));
//     } catch (error) {
//         handleError("delete_obs", error);
//     }
// }
async function delete_obs(obs_id) {
    try {
        // Validate input
        if (!obs_id) {
            console.warn("Invalid obs_id provided:", obs_id);
            return;
        }

        // Construct the API endpoint
        const url = `${URL_BASE}/obs_delete/${obs_id}`;

        // Send the DELETE request
        const response = await fetch(url, { method: 'GET' });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response
        const data = await response.json();

        // Handle non-200 responses
        if (data.statusCode !== 200) {
            console.warn('delete_obs() non-200 Response:', data);
            return;
        }

        // Refresh observables after successful deletion
        await get_obss().catch(error => handleError("get_obss", error));
    } catch (error) {
        handleError("delete_obs", { error, obs_id });
    }
}

// function delete_local_observed(id_and_date_str) {
//     try {
//         if (!id_and_date_str || !id_and_date_str.includes(',') || !OBSS_OBJ) { return; }
//         const temp_array = id_and_date_str.split(',');
//         for (let i = 0; i < OBSS_OBJ['data'].length; i++) {
//             if (OBSS_OBJ['data'][i]['_id'] === temp_array[0]) {
//                 for (let j = 0; j < OBSS_OBJ['data'][i]['recordedObss'].length; j++) {
//                     if (OBSS_OBJ['data'][i]['recordedObss'][j]['dateCreated'] === temp_array[1]) {
//                         OBSS_OBJ['data'][i]['recordedObss'].splice(j, 1);
//                         return;
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         handleError("delete_local_observed", error);
//     }
// }
function delete_local_observed(id_and_date_str) {
    try {
        // Validate input and global object
        if (!id_and_date_str || !id_and_date_str.includes(',') || !OBSS_OBJ || !OBSS_OBJ.data) {
            console.warn("Invalid input or missing OBSS_OBJ:", id_and_date_str);
            return;
        }

        const [obsId, dateCreated] = id_and_date_str.split(',');

        // Find the observable by ID
        const observable = OBSS_OBJ.data.find(obs => obs._id === obsId);
        if (!observable || !observable.recordedObss) {
            console.warn(`Observable or recordedObss not found for ID: ${obsId}`);
            return;
        }

        // Find and remove the recorded observation
        const index = observable.recordedObss.findIndex(recObs => recObs.dateCreated === dateCreated);
        if (index !== -1) {
            observable.recordedObss.splice(index, 1); // Remove the item
        } else {
            console.warn(`Recorded observation with dateCreated: ${dateCreated} not found.`);
        }
    } catch (error) {
        handleError("delete_local_observed", { error, id_and_date_str });
    }
}


// async function delete_observed(id_and_date_str) {
//     try {
//         if (!id_and_date_str || !id_and_date_str.includes(',')) {
//             return;
//         }
//         const temp_array = id_and_date_str.split(',');
//         let url = URL_BASE + '/observe_delete/' + id_and_date_str;
//         const response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.statusCode !== 200) {
//             console.log('delete_observed() non-200 Response:\n', data);
//             return;
//         }
//         delete_local_observed(id_and_date_str);
//         document.getElementById(id_and_date_str).remove();
//         let temp_num = parseInt(document.getElementById(temp_array[0] + '_num').innerText);
//         temp_num--;
//         document.getElementById(temp_array[0]).dataset.recordedobss = temp_num.toString();
//         document.getElementById(temp_array[0] + '_num').innerText = temp_num.toString();
//     } catch (error) {
//         handleError("delete_observed", error);
//     }
// }
async function delete_observed(id_and_date_str) {
    try {
        // Validate the input
        if (!id_and_date_str || !id_and_date_str.includes(',')) {
            console.warn("Invalid ID and date string:", id_and_date_str);
            return;
        }

        const [obsId, dateCreated] = id_and_date_str.split(',');

        // Construct the URL
        const url = `${URL_BASE}/observe_delete/${id_and_date_str}`;
        const response = await fetch(url, { method: 'GET' });

        // Check response status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Handle non-200 responses
        if (data.statusCode !== 200) {
            console.log('delete_observed() non-200 Response:\n', data);
            return;
        }

        // Remove observed item from local storage
        delete_local_observed(id_and_date_str);

        // Update the UI
        const observedElement = document.getElementById(id_and_date_str);
        if (observedElement) {
            observedElement.remove();
        }

        const countElement = document.getElementById(`${obsId}_num`);
        const containerElement = document.getElementById(obsId);
        if (countElement && containerElement) {
            let temp_num = parseInt(countElement.innerText, 10);
            temp_num = Math.max(0, temp_num - 1); // Ensure count doesn't go below 0
            countElement.innerText = temp_num.toString();
            containerElement.dataset.recordedobss = temp_num.toString();
        }
    } catch (error) {
        handleError('delete_observed', { error, id_and_date_str });
    }
}

function get_id_from_title(title) {
    try {
        if (OBSS_OBJ === false || OBSS_OBJ.data.length === 0) { return false; }
        for (let i = 0; i < OBSS_OBJ['data'].length; i++) {
            if (OBSS_OBJ['data'][i]['title'] === title) { return OBSS_OBJ['data'][i]['_id']; }
        }
        return false;
    } catch (error) {
        handleError("get_id_from_title", error);
    }
}

// async function get_obss() {
//     try {
//         let url = URL_BASE + '/obss_get_all';
//         const response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         OBSS_OBJ = data;
//         if (parseInt(OBSS_OBJ['statusCode']) === 204) {
//             id_obss_container.innerHTML = 'There are no observables.';
//             console.log('get_obss() non-200 Response:\n', OBSS_OBJ);
//             return;
//         }
//         id_select_obs_input.innerHTML = '<option disabled selected value="">observe...</option>';
//         id_obss_container.innerHTML = '';
//         for (let i = 0; i < OBSS_OBJ['data'].length; i++) {
//             let temp_first_observed = OBSS_OBJ['data'][i]['recordedObss'].length > 0 ? OBSS_OBJ['data'][i]['recordedObss'][0]['dateCreated'] : '';
//             for (let j = 0; j < OBSS_OBJ['data'][i]['recordedObss'].length; j++) {
//                 if (OBSS_OBJ['data'][i]['recordedObss'][j]['dateCreated'] < temp_first_observed) {
//                     temp_first_observed = OBSS_OBJ['data'][i]['recordedObss'][j]['dateCreated'];
//                 }
//             }
//             const first_observed_print = temp_first_observed ? new Date(temp_first_observed + 'Z').toLocaleString() : temp_first_observed;
//             let temp_last_observed = OBSS_OBJ['data'][i]['recordedObss'].length > 0 ? OBSS_OBJ['data'][i]['recordedObss'][0]['dateCreated'] : '';
//             for (let j = 0; j < OBSS_OBJ['data'][i]['recordedObss'].length; j++) {
//                 if (OBSS_OBJ['data'][i]['recordedObss'][j]['dateCreated'] > temp_last_observed) {
//                     temp_last_observed = OBSS_OBJ['data'][i]['recordedObss'][j]['dateCreated'];
//                 }
//             }
//             const last_observed_print = temp_last_observed ? new Date(temp_last_observed + 'Z').toLocaleString() : temp_last_observed;
//             let temp_created_date = new Date(OBSS_OBJ['data'][i]['dateCreated'] + 'Z');
//             const temp_id = `${OBSS_OBJ['data'][i]['_id']},list`;
//             let obs_container = document.createElement('div');
//             let temp_color = OBSS_OBJ['data'][i]['color'];
//             if (temp_color === 'ffffff' || temp_color === "") { obs_container.style.border = '2px dashed black'; }
//             else { obs_container.style.borderColor = '#' + temp_color; }
//             obs_container.className = 'obs_container';
//             obs_container.id = OBSS_OBJ['data'][i]['_id'];
//             obs_container.dataset.datecreated = OBSS_OBJ['data'][i]['dateCreated'];
//             obs_container.dataset.firstobserved = temp_first_observed;
//             obs_container.dataset.lastobserved = temp_last_observed;
//             obs_container.dataset.recordedobss = OBSS_OBJ['data'][i]['recordedObss'].length;
//             obs_container.dataset.tags = OBSS_OBJ['data'][i]['tags'].join(',');
//             obs_container.dataset.textlength = OBSS_OBJ['data'][i]['text'].length;
//             obs_container.dataset.title = OBSS_OBJ['data'][i]['title'];
//             obs_container.innerHTML = `
//                 <div class="observable_menu">
//                     <div class="button button_delete"
//                          onclick="confirm_delete_popup('${OBSS_OBJ['data'][i]['_id']}')">delete</div>
//                     <div class="button button_edit"
//                          onclick="edit_obs_popup('${OBSS_OBJ['data'][i]['_id']}')">edit</div>
//                 </div>
//             `;
//             obs_container.innerHTML += `
//                 ${OBSS_OBJ['data'][i]['_id']}
//                 <div><b>Title: </b>${OBSS_OBJ['data'][i]['title']}</div>
//                 <div><b>Description: </b>${OBSS_OBJ['data'][i]['description']}</div>
//                 <div><b>Created: </b>${temp_created_date.toDateString()}</div>
//                 <div><b>First Observed: </b>${first_observed_print}</div>
//                 <div><b>Last Observed: </b>${last_observed_print}</div>
//                 <div><b>Tags: </b>${OBSS_OBJ['data'][i]['tags']}</div>
//                 <div><b>Text: </b>${OBSS_OBJ['data'][i]['text']}</div>
//                 <div><b>number of recordedObss: </b><span id="${OBSS_OBJ['data'][i]['_id']}_num">${OBSS_OBJ['data'][i]['recordedObss'].length}</span></div>
//                 <div class="recorded_obs_show" onclick="show_recordedObss('${temp_id}')"><b>recordedObss</b></div>
//                 <div class="observed_list" id="${temp_id}" style="display: none;"></div>
//             `;
//             id_obss_container.append(obs_container);
//             let temp_option = document.createElement('option');
//             temp_option.text = OBSS_OBJ['data'][i]['title'];
//             temp_option.value = OBSS_OBJ['data'][i]['title'];
//             id_select_obs_input.append(temp_option);
//         }
//         sort_obss();
//     } catch (error) {
//         handleError("get_obss", error);
//     }
// }
async function get_obss() {
    try {
        // Fetch observables data
        const url = `${URL_BASE}/obss_get_all`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        OBSS_OBJ = data;

        // Handle empty or no observables
        if (parseInt(OBSS_OBJ.statusCode) === 204) {
            id_obss_container.innerHTML = 'There are no observables.';
            console.log('get_obss() non-200 Response:\n', OBSS_OBJ);
            return;
        }

        // Reset UI elements
        id_select_obs_input.innerHTML = '<option disabled selected value="">observe...</option>';
        id_obss_container.innerHTML = '';

        // Populate observables
        OBSS_OBJ.data.forEach(obs => {
            // Determine first and last observed dates
            const recordedObss = obs.recordedObss || [];
            const temp_first_observed = recordedObss.reduce(
                (earliest, record) => (record.dateCreated < earliest ? record.dateCreated : earliest),
                recordedObss.length > 0 ? recordedObss[0].dateCreated : ''
            );
            const temp_last_observed = recordedObss.reduce(
                (latest, record) => (record.dateCreated > latest ? record.dateCreated : latest),
                recordedObss.length > 0 ? recordedObss[0].dateCreated : ''
            );

            const first_observed_print = temp_first_observed
                ? new Date(temp_first_observed + 'Z').toLocaleString()
                : 'N/A';
            const last_observed_print = temp_last_observed
                ? new Date(temp_last_observed + 'Z').toLocaleString()
                : 'N/A';

            const temp_created_date = new Date(obs.dateCreated + 'Z').toDateString();

            // Create observable container
            const obs_container = document.createElement('div');
            obs_container.className = 'obs_container';
            obs_container.id = obs._id;

            // Apply border color
            const temp_color = obs.color || 'ffffff';
            obs_container.style.border = temp_color === 'ffffff' || !temp_color
                ? '2px dashed black'
                : `2px solid #${temp_color}`;

            // Add dataset attributes
            obs_container.dataset.datecreated = obs.dateCreated;
            obs_container.dataset.firstobserved = temp_first_observed;
            obs_container.dataset.lastobserved = temp_last_observed;
            obs_container.dataset.recordedobss = recordedObss.length;
            obs_container.dataset.tags = obs.tags.join(',');
            obs_container.dataset.textlength = obs.text.length;
            obs_container.dataset.title = obs.title;

            // Populate observable content
            obs_container.innerHTML = `
                <div class="observable_menu">
                    <div class="button button_delete" onclick="confirm_delete_popup('${obs._id}')">delete</div>
                    <div class="button button_edit" onclick="edit_obs_popup('${obs._id}')">edit</div>
                </div>
                ${obs._id}
                <div><b>Title: </b>${obs.title}</div>
                <div><b>Description: </b>${obs.description}</div>
                <div><b>Created: </b>${temp_created_date}</div>
                <div><b>First Observed: </b>${first_observed_print}</div>
                <div><b>Last Observed: </b>${last_observed_print}</div>
                <div><b>Tags: </b>${obs.tags.join(', ')}</div>
                <div><b>Text: </b>${obs.text}</div>
                <div><b>Number of Recorded Observables: </b>
                    <span id="${obs._id}_num">${recordedObss.length}</span>
                </div>
                <div class="recorded_obs_show" onclick="show_recordedObss('${obs._id},list')">
                    <b>recordedObss</b>
                </div>
                <div class="observed_list" id="${obs._id},list" style="display: none;"></div>
            `;

            // Append container to the UI
            id_obss_container.append(obs_container);

            // Add to dropdown menu
            const temp_option = document.createElement('option');
            temp_option.text = obs.title;
            temp_option.value = obs.title;
            id_select_obs_input.append(temp_option);
        });

        // Sort observables
        sort_obss();
    } catch (error) {
        handleError('get_obss', error);
    }
}

// function get_obs(obs_id) {
//     try {
//         if (OBSS_OBJ === false || OBSS_OBJ.data.length === 0) { return false; }
//         for (let i = 0; i < OBSS_OBJ['data'].length; i++) {
//             if (OBSS_OBJ['data'][i]['_id'] === obs_id) {
//                 return OBSS_OBJ['data'][i];
//             }
//         }
//         return false;
//     } catch (error) {
//         handleError("get_obs", error);
//     }
// }
function get_obs(obs_id) {
    try {
        // Validate input and global object
        if (!OBSS_OBJ || !OBSS_OBJ.data || OBSS_OBJ.data.length === 0 || !obs_id) {
            return false;
        }

        // Find and return the observable
        const observable = OBSS_OBJ.data.find(obs => obs._id === obs_id);
        return observable || false;
    } catch (error) {
        handleError('get_obs', { error, obs_id });
        return false;
    }
}


// function get_recorded_obs(rec_obs_id) {
//     try {
//         if (OBSS_OBJ === false || OBSS_OBJ.data.length === 0 || !rec_obs_id || !rec_obs_id.includes(',')) { return false; }
//         const temp_array = rec_obs_id.split(',');
//         for (let i = 0; i < OBSS_OBJ['data'].length; i++) {
//             if (OBSS_OBJ['data'][i]['_id'] === temp_array[0]) {
//                 if (OBSS_OBJ['data'][i]['recordedObss'].length === 0) { return false; }
//                 for (let j = 0; j < OBSS_OBJ['data'][i]['recordedObss'].length; j++) {
//                     if (OBSS_OBJ['data'][i]['recordedObss'][j]['dateCreated'] === temp_array[1]) {
//                         return OBSS_OBJ['data'][i]['recordedObss'][j];
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         handleError("get_recorded_obs", error);
//     }
// }
function get_recorded_obs(rec_obs_id) {
    try {
        // Validate the input and the global object
        if (!OBSS_OBJ || !OBSS_OBJ.data || OBSS_OBJ.data.length === 0 || !rec_obs_id || !rec_obs_id.includes(',')) {
            return false;
        }

        // Split the input ID into parts
        const [obsId, dateCreated] = rec_obs_id.split(',');

        // Find the main observable object
        const observable = OBSS_OBJ.data.find(obs => obs._id === obsId);
        if (!observable || !observable.recordedObss || observable.recordedObss.length === 0) {
            return false;
        }

        // Find the specific recorded observation
        const recordedObs = observable.recordedObss.find(recObs => recObs.dateCreated === dateCreated);
        return recordedObs || false;
    } catch (error) {
        handleError('get_recorded_obs', { error, rec_obs_id });
        return false;
    }
}



// async function edit_obs_popup(obs_id) {
//     try {
//         let id_form_id = document.getElementById('update_obs_id');
//         let id_form_color = document.getElementById('update_obs_color');
//         let id_form_description = document.getElementById('update_obs_description');
//         let id_form_tags = document.getElementById('update_obs_tags');
//         let id_form_text = document.getElementById('update_obs_text');
//         let id_form_title = document.getElementById('update_obs_title');
//         let obs_obj = get_obs(obs_id);
//         id_form_id.value = obs_id;
//         id_form_color.value = '#' + obs_obj.color;
//         id_form_description.value = obs_obj.description;
//         id_form_tags.value = obs_obj.tags;
//         id_form_text.value = obs_obj.text;
//         id_form_title.value = obs_obj.title;
//         id_update_obs_container.style.display = 'flex';
//     } catch (error) {
//         handleError("edit_obs_popup", error);
//     }
// }
async function edit_obs_popup(obs_id) {
    try {
        // Retrieve form elements
        const formElements = {
            id: document.getElementById('update_obs_id'),
            color: document.getElementById('update_obs_color'),
            description: document.getElementById('update_obs_description'),
            tags: document.getElementById('update_obs_tags'),
            text: document.getElementById('update_obs_text'),
            title: document.getElementById('update_obs_title'),
        };

        // Get observable object
        const obsObj = get_obs(obs_id);

        // Validate `obsObj`
        if (!obsObj) {
            console.warn(`Observable with ID ${obs_id} not found.`);
            return;
        }

        // Populate form fields with observable data
        formElements.id.value = obs_id;
        formElements.color.value = `#${obsObj.color || '000000'}`; // Default to black if color is missing
        formElements.description.value = obsObj.description || '';
        formElements.tags.value = Array.isArray(obsObj.tags) ? obsObj.tags.join(', ') : obsObj.tags || '';
        formElements.text.value = obsObj.text || '';
        formElements.title.value = obsObj.title || '';

        // Show the update container
        id_update_obs_container.style.display = 'flex';
    } catch (error) {
        handleError('edit_obs_popup', { error, obs_id });
    }
}

// async function edit_observed_popup(id_and_date_str) {
//     try {
//         let id_form_id = document.getElementById('update_rec_obs_id');
//         let id_form_color = document.getElementById('update_rec_obs_color');
//         let id_form_intensity = document.getElementById('update_rec_obs_intensity');
//         let id_form_feeling_before = document.getElementById('update_rec_obs_feeling_before');
//         let id_form_feeling_after = document.getElementById('update_rec_obs_feeling_after');
//         let id_form_duration = document.getElementById('update_rec_obs_duration');
//         let id_form_response = document.getElementById('update_rec_obs_response');
//         let id_form_date = document.getElementById('update_rec_obs_date');
//         let id_form_tags = document.getElementById('update_rec_obs_tags');
//         let id_form_text = document.getElementById('update_rec_obs_text');
//         let id_form_guests = document.getElementById('update_rec_obs_guests');
//         let rec_obs = get_recorded_obs(id_and_date_str);
//         if (!rec_obs) { return; }
//         let temp_date = new Date(rec_obs.dateCreated + 'Z');
//         temp_date.setTime(temp_date.getTime() - LCL_OFFSET);
//         temp_date = temp_date.toISOString().slice(0, -8);
//         id_form_id.value = id_and_date_str;
//         id_form_color.value = '#' + rec_obs.color;
//         id_form_intensity.value = rec_obs.intensity;
//         id_form_feeling_before.value = rec_obs.feelingBefore;
//         id_form_feeling_after.value = rec_obs.feelingAfter;
//         id_form_duration.value = rec_obs.duration;
//         id_form_response.value = rec_obs.response;
//         id_form_date.value = temp_date;
//         id_form_tags.value = rec_obs.tags;
//         id_form_text.value = rec_obs.text;
//         id_form_guests.value = rec_obs.guests;
//         id_update_rec_obs_container.style.display = 'flex';
//     } catch (error) {
//         handleError("edit_observed_popup", error);
//     }
// }
async function edit_observed_popup(id_and_date_str) {
    try {
        // Retrieve form elements
        const formElements = {
            id: document.getElementById('update_rec_obs_id'),
            color: document.getElementById('update_rec_obs_color'),
            intensity: document.getElementById('update_rec_obs_intensity'),
            feelingBefore: document.getElementById('update_rec_obs_feeling_before'),
            feelingAfter: document.getElementById('update_rec_obs_feeling_after'),
            duration: document.getElementById('update_rec_obs_duration'),
            response: document.getElementById('update_rec_obs_response'),
            date: document.getElementById('update_rec_obs_date'),
            tags: document.getElementById('update_rec_obs_tags'),
            text: document.getElementById('update_rec_obs_text'),
            guests: document.getElementById('update_rec_obs_guests'),
        };

        // Get the recorded observation
        const recObs = get_recorded_obs(id_and_date_str);
        if (!recObs) {
            console.warn('No recorded observation found for:', id_and_date_str);
            return;
        }

        // Adjust date to local time
        const tempDate = new Date(recObs.dateCreated + 'Z');
        tempDate.setTime(tempDate.getTime() - LCL_OFFSET);
        const formattedDate = tempDate.toISOString().slice(0, -8);

        // Populate form fields
        formElements.id.value = id_and_date_str;
        formElements.color.value = `#${recObs.color || '000000'}`; // Default to black if no color
        formElements.intensity.value = recObs.intensity || '';
        formElements.feelingBefore.value = recObs.feelingBefore || '';
        formElements.feelingAfter.value = recObs.feelingAfter || '';
        formElements.duration.value = recObs.duration || '';
        formElements.response.value = recObs.response || '';
        formElements.date.value = formattedDate;
        formElements.tags.value = Array.isArray(recObs.tags) ? recObs.tags.join(', ') : recObs.tags || '';
        formElements.text.value = recObs.text || '';
        formElements.guests.value = Array.isArray(recObs.guests) ? recObs.guests.join(', ') : recObs.guests || '';

        // Show the update container
        id_update_rec_obs_container.style.display = 'flex';
    } catch (error) {
        handleError('edit_observed_popup', { error, id_and_date_str });
    }
}

// function show_recordedObss(obs_id) {
//     try {
//         if (!obs_id || !obs_id.includes(',')) { return; }
//         let obs_container = document.getElementById(obs_id);
//         if (obs_container.style.display === 'flex') {
//             obs_container.style.display = 'none';
//             obs_container.innerHTML = '';
//             return;
//         }
//         const temp_id_only = obs_id.split(',')[0];
//         let obs_obj = get_obs(temp_id_only);
//         if (!obs_obj.recordedObss || obs_obj.recordedObss.length === 0) { return; }
//         for (let i = obs_obj.recordedObss.length - 1; i >= 0; i--) {
//             let temp_div = document.createElement('div');
//             let temp_created_date = new Date(obs_obj.recordedObss[i].dateCreated + 'Z');
//             temp_created_date.setTime(temp_created_date.getTime() - LCL_OFFSET);
//             temp_created_date = temp_created_date.toISOString().slice(0, -5);
//             let temp_color = obs_obj.recordedObss[i].color;
//             if (temp_color === 'ffffff' || temp_color === "") { temp_div.style.border = '2px dashed black'; }
//             else { temp_div.style.borderColor = '#' + temp_color; }
//             temp_div.className = 'observed_container';
//             temp_div.id = obs_obj.recordedObss[i].id + ',' + obs_obj.recordedObss[i].dateCreated;
//             temp_div.innerText = `datetime-utc: ${temp_created_date}
//                 duration: ${obs_obj.recordedObss[i].duration}
//                 feeling before: ${obs_obj.recordedObss[i].feelingBefore}
//                 feeling after: ${obs_obj.recordedObss[i].feelingAfter}
//                 guests: ${obs_obj.recordedObss[i].guests}
//                 response: ${obs_obj.recordedObss[i].response}
//                 tags: ${obs_obj.recordedObss[i].tags}
//                 intensity: ${obs_obj.recordedObss[i].intensity}
//                 text: ${obs_obj.recordedObss[i].text}`;
//             let temp_div2 = document.createElement('div');
//             temp_div2.className = 'rrow10 padding5';
//             temp_div2.innerHTML += `<div class="button button_delete" onclick="delete_observed('${temp_div.id}')">delete</div>`;
//             temp_div2.innerHTML += `<div class="button button_edit" onclick="edit_observed_popup('${temp_div.id}')">edit</div>`;
//             temp_div.append(temp_div2);
//             obs_container.append(temp_div);
//         }
//         obs_container.style.display = 'flex';
//     } catch (error) {
//         handleError("show_recordedObss", error);
//     }
// }
function show_recordedObss(obs_id) {
    try {
        // Validate `obs_id` input
        if (!obs_id || !obs_id.includes(',')) return;

        const obs_container = document.getElementById(obs_id);

        // Toggle visibility
        if (obs_container.style.display === 'flex') {
            obs_container.style.display = 'none';
            obs_container.innerHTML = '';
            return;
        }

        const temp_id_only = obs_id.split(',')[0];
        const obs_obj = get_obs(temp_id_only);

        // Validate `recordedObss`
        if (!obs_obj || !obs_obj.recordedObss || obs_obj.recordedObss.length === 0) return;

        // Generate and append observed elements
        obs_obj.recordedObss.reverse().forEach(observed => {
            const temp_created_date = new Date(observed.dateCreated + 'Z');
            temp_created_date.setTime(temp_created_date.getTime() - LCL_OFFSET);

            // Create observed container
            const temp_div = document.createElement('div');
            temp_div.className = 'observed_container';
            temp_div.id = `${observed.id},${observed.dateCreated}`;
            temp_div.style.borderColor = observed.color && observed.color !== 'ffffff' ? `#${observed.color}` : 'black';
            if (observed.color === 'ffffff' || !observed.color) {
                temp_div.style.border = '2px dashed black';
            }

            // Populate content
            temp_div.innerText = `
                datetime-utc: ${temp_created_date.toISOString().slice(0, -5)}
                duration: ${observed.duration || 'N/A'}
                feeling before: ${observed.feelingBefore || 'N/A'}
                feeling after: ${observed.feelingAfter || 'N/A'}
                guests: ${observed.guests || 'N/A'}
                response: ${observed.response || 'N/A'}
                tags: ${observed.tags || 'N/A'}
                intensity: ${observed.intensity || 'N/A'}
                text: ${observed.text || 'N/A'}
            `;

            // Create action buttons container
            const temp_div2 = document.createElement('div');
            temp_div2.className = 'rrow10 padding5';
            temp_div2.innerHTML = `
                <div class="button button_delete" onclick="delete_observed('${temp_div.id}')">delete</div>
                <div class="button button_edit" onclick="edit_observed_popup('${temp_div.id}')">edit</div>
            `;

            // Append buttons to observed container
            temp_div.appendChild(temp_div2);

            // Append observed container to the main container
            obs_container.appendChild(temp_div);
        });

        // Show container
        obs_container.style.display = 'flex';
    } catch (error) {
        handleError('show_recordedObss', { error, obs_id });
    }
}

// function sort_obss() {
//     try {
//         if (!id_select_sort_by.value || !id_obss_container.childNodes.length) {
//             return;
//         }
//         let sorted_arr = Array.from(id_obss_container.childNodes);
//         const sort_values = id_select_sort_by.value.split(',');
//         const sortMultiplier = sort_values[1] === '0' ? 1 : -1;
//         sorted_arr = sorted_arr.sort((a, b) => {
//             if (/^\d+$/.test(a.dataset[sort_values[0]])) {
//                 return (parseInt(a.dataset[sort_values[0]]) - parseInt(b.dataset[sort_values[0]])) * sortMultiplier;
//             }
//             return a.dataset[sort_values[0]].localeCompare(b.dataset[sort_values[0]]) * sortMultiplier;
//         });
//         id_obss_container.innerHTML = '';
//         for (let element of sorted_arr) {
//             id_obss_container.append(element);
//         }
//     } catch (error) {
//         handleError("sort_obss", error);
//     }
// }
function sort_obss() {
    try {
        // Validate inputs
        const sortBy = id_select_sort_by.value;
        if (!sortBy || !id_obss_container.childNodes.length) return;

        const [attribute, order] = sortBy.split(',');
        const sortMultiplier = order === '0' ? 1 : -1;

        // Convert childNodes to an array and sort
        const sortedArray = Array.from(id_obss_container.childNodes).sort((a, b) => {
            const aValue = a.dataset[attribute];
            const bValue = b.dataset[attribute];

            // Handle numeric sorting
            if (/^\d+$/.test(aValue) && /^\d+$/.test(bValue)) {
                return (parseInt(aValue) - parseInt(bValue)) * sortMultiplier;
            }

            // Handle string sorting
            return aValue.localeCompare(bValue) * sortMultiplier;
        });

        // Update the container with sorted elements
        id_obss_container.replaceChildren(...sortedArray);
    } catch (error) {
        handleError('sort_obss', {
            error,
            sortValue: id_select_sort_by.value,
            containerChildren: id_obss_container.childNodes.length,
        });
    }
}

/// addEventListener and onclick:
id_button_create.onclick=function (){
    try {
        close_popups();
        id_obs_create_container.style.display = 'flex';
    } catch (error) {
        handleError("id_button_create.onclick", error);
    }
}

id_button_delete_no.onclick=function () {
    try {
        close_popups();
    } catch (error) {
        handleError("id_button_delete_no.onclick", error);
    }
}

// id_button_obs_create_submit.onclick=async function () {
//     try {
//         let id_form_color = document.getElementById('create_obs_color');
//         let id_form_description = document.getElementById('create_obs_description');
//         let id_form_tags = document.getElementById('create_obs_tags');
//         let id_form_text = document.getElementById('create_obs_text');
//         let id_form_title = document.getElementById('create_obs_title');
//         if (id_form_title.value.toString() === "") {
//             id_obs_create_error_message.style.display = 'flex';
//             return;
//         }
//         let obs_obj = {
//             'color': id_form_color.value.substring(1,id_form_color.value.length),
//             'children': [],
//             'description': id_form_description.value,
//             'parents': [],
//             'tags': id_form_tags.value,
//             'text': id_form_text.value,
//             'title': id_form_title.value,
//         }
//         let url = URL_BASE + '/obs_create/' + JSON.stringify(obs_obj);
//         const response = await fetch(url, {method: 'GET'});
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.statusCode != 200) {
//             id_obs_create_error_message.textContent = 'Error updating obs: non-200 response received...';
//             id_obs_create_error_message.style.display = 'flex';
//             return;
//         }
//         close_popups();
//         id_form_color.value = '#000000';
//         id_form_description.value = '';
//         id_form_tags.value = '';
//         id_form_text.value = '';
//         id_form_title.value = '';
//         get_obss()
//             .then(() => {})
//             .catch(error => console.error("Error in get_obss():", error));
//     } catch (error) {
//         handleError("id_button_obs_create_submit.onclick", error);
//     }
// }
id_button_obs_create_submit.onclick = async function () {
    try {
        // Retrieve form elements
        const formElements = {
            color: document.getElementById('create_obs_color'),
            description: document.getElementById('create_obs_description'),
            tags: document.getElementById('create_obs_tags'),
            text: document.getElementById('create_obs_text'),
            title: document.getElementById('create_obs_title'),
        };

        // Validate required fields
        if (!formElements.title.value.trim()) {
            id_obs_create_error_message.textContent = 'Title is required.';
            id_obs_create_error_message.style.display = 'flex';
            return;
        }

        // Process optional fields
        const tags = formElements.tags.value
            ? formElements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        // Construct the observable object
        const obsObj = {
            color: formElements.color.value.substring(1), // Remove "#" from color
            children: [],
            description: formElements.description.value.trim(),
            parents: [],
            tags: tags,
            text: formElements.text.value.trim(),
            title: formElements.title.value.trim(),
        };

        // Make the API call
        const url = `${URL_BASE}/obs_create/${JSON.stringify(obsObj)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode !== 200) {
            id_obs_create_error_message.textContent = 'Error creating obs: non-200 response received.';
            id_obs_create_error_message.style.display = 'flex';
            return;
        }

        // Reset form fields
        Object.values(formElements).forEach(element => {
            element.value = element.id === 'create_obs_color' ? '#000000' : '';
        });

        // Close popup and refresh observables
        close_popups();
        await get_obss();
    } catch (error) {
        handleError('id_button_obs_create_submit.onclick', { error });
    }
};

id_select_obs_input.onchange=function () {
    try {
        close_popups();
        if (id_select_obs_input.value === "") { return; }
        id_observe_obs_title.innerText = id_select_obs_input.value;
        id_observe_obs_id.value = get_id_from_title(id_select_obs_input.value);
        id_observe_obs_container.style.display = 'flex';
    } catch (error) {
        handleError("id_select_obs_input.onclick", error);
    }
}

// id_button_obs_observe_submit.onclick=async function () {
//     try {
//         const now_date = new Date();
//         let id_form_id = document.getElementById('observe_obs_id');
//         let id_form_color = document.getElementById('observe_obs_color');
//         let id_form_intensity = document.getElementById('observe_obs_intensity');
//         let id_form_feeling_before = document.getElementById('observe_obs_feeling_before');
//         let id_form_feeling_after = document.getElementById('observe_obs_feeling_after');
//         let id_form_duration = document.getElementById('observe_obs_duration');
//         let id_form_response = document.getElementById('observe_obs_response');
//         let id_form_date = document.getElementById('observe_obs_date');
//         let id_form_tags = document.getElementById('observe_obs_tags');
//         let id_form_text = document.getElementById('observe_obs_text');
//         let id_form_guests = document.getElementById('observe_obs_guests');
//         let temp_id_form_duration = id_form_duration.value === "" ? null : id_form_duration.value;
//         let temp_id_form_intensity = id_form_intensity.value === "" ? null : id_form_intensity.value;
//         let temp_id_form_tags = id_form_tags.value === "" ? [] : (id_form_tags.value + ',').split(',');
//         let temp_id_form_guests = id_form_guests.value === "" ? [] : (id_form_guests.value + ',').split(',');
//         if (id_form_date.value === "") {
//             id_form_date.value = now_date.toISOString().slice(0, -8);
//         } else {
//             id_form_date.value = new Date(id_form_date.value).toISOString().slice(0, -5);
//         }
//         let obs_obj = {
//             'color': id_form_color.value.substring(1,id_form_color.value.length),
//             'dateCreated': id_form_date.value,
//             'duration': temp_id_form_duration,
//             'guests': temp_id_form_guests,
//             'id': id_form_id.value,
//             'intensity': temp_id_form_intensity,
//             'feelingBefore': id_form_feeling_before.value,
//             'feelingAfter': id_form_feeling_after.value,
//             'response': id_form_response.value,
//             'tags': temp_id_form_tags,
//             'text': id_form_text.value
//         }
//         let url = URL_BASE + '/obs_observe/' + JSON.stringify(obs_obj);
//         const response = await fetch(url, {method: 'GET'});
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.statusCode != 200) {
//             console.log('Error updating observable: non-200 response received...');
//             return;
//         }
//         close_popups();
//         id_form_id.value = '';
//         id_form_color.value = '#000000';
//         id_form_guests.value = '';
//         id_form_intensity.value = '';
//         id_form_feeling_before.value = '';
//         id_form_feeling_after.value = '';
//         id_form_duration.value = '';
//         id_form_response.value = '';
//         id_form_date.value = '';
//         id_form_tags.value = '';
//         id_form_text.value = '';
//         get_obss()
//             .then(() => { sort_obss(); })
//             .catch(error => console.error("Error in get_obss():", error));
//     } catch (error) {
//         handleError("id_button_obs_observe_submit.onclick", error);
//     }
// }
id_button_obs_observe_submit.onclick = async function () {
    try {
        // Get the current date
        const nowDate = new Date();

        // Retrieve form elements
        const formElements = {
            id: document.getElementById('observe_obs_id'),
            color: document.getElementById('observe_obs_color'),
            intensity: document.getElementById('observe_obs_intensity'),
            feelingBefore: document.getElementById('observe_obs_feeling_before'),
            feelingAfter: document.getElementById('observe_obs_feeling_after'),
            duration: document.getElementById('observe_obs_duration'),
            response: document.getElementById('observe_obs_response'),
            date: document.getElementById('observe_obs_date'),
            tags: document.getElementById('observe_obs_tags'),
            text: document.getElementById('observe_obs_text'),
            guests: document.getElementById('observe_obs_guests'),
        };

        // Process optional fields
        const processedValues = {
            duration: formElements.duration.value || null,
            intensity: formElements.intensity.value || null,
            tags: formElements.tags.value
                ? formElements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [],
            guests: formElements.guests.value
                ? formElements.guests.value.split(',').map(guest => guest.trim()).filter(guest => guest)
                : [],
        };

        // Process date field
        if (!formElements.date.value) {
            formElements.date.value = nowDate.toISOString().slice(0, -8);
        } else {
            formElements.date.value = new Date(formElements.date.value).toISOString().slice(0, -5);
        }

        // Construct the observable object
        const obsObj = {
            color: formElements.color.value.substring(1),
            dateCreated: formElements.date.value,
            duration: processedValues.duration,
            guests: processedValues.guests,
            id: formElements.id.value,
            intensity: processedValues.intensity,
            feelingBefore: formElements.feelingBefore.value,
            feelingAfter: formElements.feelingAfter.value,
            response: formElements.response.value,
            tags: processedValues.tags,
            text: formElements.text.value,
        };

        // Make the API call
        const url = `${URL_BASE}/obs_observe/${JSON.stringify(obsObj)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode !== 200) {
            console.error('Error updating observable: non-200 response received.', data);
            return;
        }

        // Reset form fields
        Object.values(formElements).forEach(element => {
            element.value = element.id === 'observe_obs_color' ? '#000000' : '';
        });

        // Close popup and refresh observables
        close_popups();
        await get_obss();
        sort_obss();
    } catch (error) {
        handleError('id_button_obs_observe_submit.onclick', { error });
    }
};

// id_button_obs_update_submit.onclick=async function () {
//     try {
//         let id_form_id = document.getElementById('update_obs_id');
//         let id_form_color = document.getElementById('update_obs_color');
//         let id_form_description = document.getElementById('update_obs_description');
//         let id_form_tags = document.getElementById('update_obs_tags');
//         let id_form_text = document.getElementById('update_obs_text');
//         let id_form_title = document.getElementById('update_obs_title');
//         if (id_form_title.value.toString() === "") {
//             id_obs_update_error_message.style.display = 'flex';
//             return;
//         }
//         let temp_tags = []
//         if (id_form_tags.value.toString() !== "") {
//             temp_tags = (id_form_tags.value + ',').split(',');
//         }
//         let obs_obj = {
//             '_id': id_form_id.value,
//             'color': id_form_color.value.substring(1,id_form_color.value.length),
//             'children': [],
//             'description': id_form_description.value,
//             'parents': [],
//             'tags': temp_tags,
//             'text': id_form_text.value,
//             'title': id_form_title.value,
//         }
//         let url = URL_BASE + '/obs_update/' + JSON.stringify(obs_obj);
//         const response = await fetch(url, {method: 'GET'});
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.statusCode != 200) {
//             id_obs_update_error_message.textContent = 'Error updating obs: non-200 response received...';
//             id_obs_update_error_message.style.display = 'flex';
//             return;
//         }
//         close_popups();
//         id_form_id.value = '';
//         id_form_color.value = '#000000';
//         id_form_description.value = '';
//         id_form_tags.value = '';
//         id_form_text.value = '';
//         id_form_title.value = '';
//         get_obss()
//             .catch(error => console.error("Error in get_obss():", error));
//     } catch (error) {
//         handleError("id_button_obs_update_submit.onclick", error);
//     }
// }
id_button_obs_update_submit.onclick = async function () {
    try {
        // Retrieve form elements
        const id_form_id = document.getElementById('update_obs_id');
        const id_form_color = document.getElementById('update_obs_color');
        const id_form_description = document.getElementById('update_obs_description');
        const id_form_tags = document.getElementById('update_obs_tags');
        const id_form_text = document.getElementById('update_obs_text');
        const id_form_title = document.getElementById('update_obs_title');

        // Validate required fields
        if (!id_form_title.value.trim()) {
            id_obs_update_error_message.textContent = 'Title is required.';
            id_obs_update_error_message.style.display = 'flex';
            return;
        }

        // Process optional fields
        const tags = id_form_tags.value
            ? id_form_tags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
            : [];

        // Construct the observable object
        const obs_obj = {
            _id: id_form_id.value,
            color: id_form_color.value.substring(1),
            children: [],
            description: id_form_description.value.trim(),
            parents: [],
            tags: tags,
            text: id_form_text.value.trim(),
            title: id_form_title.value.trim(),
        };

        // Make API call
        const url = `${URL_BASE}/obs_update/${JSON.stringify(obs_obj)}`;
        const response = await fetch(url, { method: 'GET' });

        // Handle response
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode !== 200) {
            id_obs_update_error_message.textContent = 'Error updating obs: non-200 response received.';
            id_obs_update_error_message.style.display = 'flex';
            return;
        }

        // Reset form fields
        ['update_obs_id', 'update_obs_color', 'update_obs_description', 'update_obs_tags', 'update_obs_text', 'update_obs_title'].forEach(id => {
            const element = document.getElementById(id);
            element.value = id === 'update_obs_color' ? '#000000' : '';
        });

        // Close popups and refresh observables
        close_popups();
        await get_obss();
    } catch (error) {
        handleError('id_button_obs_update_submit.onclick', { error });
    }
};


// id_button_update_rec_obs_submit.onclick=async function () {
//     try {
//         const now_date = new Date();
//         let id_form_id = document.getElementById('update_rec_obs_id');
//         let id_form_color = document.getElementById('update_rec_obs_color');
//         let id_form_intensity = document.getElementById('update_rec_obs_intensity');
//         let id_form_feeling_before = document.getElementById('update_rec_obs_feeling_before');
//         let id_form_feeling_after = document.getElementById('update_rec_obs_feeling_after');
//         let id_form_duration = document.getElementById('update_rec_obs_duration');
//         let id_form_response = document.getElementById('update_rec_obs_response');
//         let id_form_date = document.getElementById('update_rec_obs_date');
//         let id_form_tags = document.getElementById('update_rec_obs_tags');
//         let id_form_text = document.getElementById('update_rec_obs_text');
//         let id_form_guests = document.getElementById('update_rec_obs_guests');
//
//         const temp_array = id_form_id.value.split(',');
//         const original_date = temp_array[1];
//         let temp_id_form_duration = id_form_duration.value === "" ? null : id_form_duration.value;
//         let temp_id_form_intensity = id_form_intensity.value === "" ? null : id_form_intensity.value;
//         let temp_id_form_tags = id_form_tags.value === "" ? [] : (id_form_tags.value + ',').split(',');
//         let temp_id_form_guests = id_form_guests.value === "" ? [] : (id_form_guests.value + ',').split(',');
//
//         if (id_form_date.value === "") {
//             let temp_date = new Date(now_date);
//             temp_date.setTime(temp_date.getTime() + LCL_OFFSET);
//             id_form_date.value = temp_date.toISOString().slice(0, -5);
//         } else {
//             let temp_date = new Date(id_form_date.value + 'Z');
//             temp_date.setTime(temp_date.getTime() + LCL_OFFSET);
//             id_form_date.value = temp_date.toISOString().slice(0, -5);
//         }
//
//         let obs_obj = {
//             'color': id_form_color.value.substring(1,id_form_color.value.length),
//             'dateCreated': id_form_date.value,
//             'duration': temp_id_form_duration,
//             'guests': temp_id_form_guests,
//             'id': temp_array[0],
//             'intensity': temp_id_form_intensity,
//             'feelingBefore': id_form_feeling_before.value,
//             'feelingAfter': id_form_feeling_after.value,
//             'response': id_form_response.value,
//             'tags': temp_id_form_tags,
//             'text': id_form_text.value,
//             'originalDate': original_date
//         }
//
//         let url = URL_BASE + '/obs_rec_update/' + JSON.stringify(obs_obj);
//         const response = await fetch(url, {method: 'GET'});
//
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//
//         const data = await response.json();
//         if (data.statusCode !== 200) {
//             console.log('Error updating observable: non-200 response received...');
//             return;
//         }
//
//         close_popups();
//         id_form_id.value = '';
//         id_form_color.value = '#000000';
//         id_form_guests.value = '';
//         id_form_intensity.value = '';
//         id_form_feeling_before.value = '';
//         id_form_feeling_after.value = '';
//         id_form_duration.value = '';
//         id_form_response.value = '';
//         id_form_date.value = '';
//         id_form_tags.value = '';
//         id_form_text.value = '';
//
//         get_obss()
//             .then(() => {})
//             .catch(error => console.error("Error in get_obss():", error));
//     } catch (error) {
//         handleError("id_button_update_rec_obs_submit.onclick", error);
//     }
// }
id_button_update_rec_obs_submit.onclick = async function () {
    try {
        const nowDate = new Date();

        // Retrieve form values
        const formValues = {
            id: document.getElementById('update_rec_obs_id').value,
            color: document.getElementById('update_rec_obs_color').value,
            intensity: document.getElementById('update_rec_obs_intensity').value,
            feelingBefore: document.getElementById('update_rec_obs_feeling_before').value,
            feelingAfter: document.getElementById('update_rec_obs_feeling_after').value,
            duration: document.getElementById('update_rec_obs_duration').value,
            response: document.getElementById('update_rec_obs_response').value,
            date: document.getElementById('update_rec_obs_date').value,
            tags: document.getElementById('update_rec_obs_tags').value,
            text: document.getElementById('update_rec_obs_text').value,
            guests: document.getElementById('update_rec_obs_guests').value,
        };

        // Validate required fields
        if (!formValues.id) {
            throw new Error('ID is required.');
        }

        const [obsId, originalDate] = formValues.id.split(',');
        if (!obsId || !originalDate) {
            throw new Error('Invalid ID format.');
        }

        // Process optional fields
        const processedValues = {
            duration: formValues.duration || null,
            intensity: formValues.intensity || null,
            tags: formValues.tags ? formValues.tags.split(',').map(tag => tag.trim()) : [],
            guests: formValues.guests ? formValues.guests.split(',').map(guest => guest.trim()) : [],
        };

        // Handle date field
        let tempDate = formValues.date
            ? new Date(new Date(formValues.date + 'Z').getTime() + LCL_OFFSET)
            : new Date(nowDate.getTime() + LCL_OFFSET);
        formValues.date = tempDate.toISOString().slice(0, -5);

        // Construct the observable object
        const obsObj = {
            id: obsId,
            color: formValues.color.substring(1),
            dateCreated: formValues.date,
            duration: processedValues.duration,
            guests: processedValues.guests,
            intensity: processedValues.intensity,
            feelingBefore: formValues.feelingBefore,
            feelingAfter: formValues.feelingAfter,
            response: formValues.response,
            tags: processedValues.tags,
            text: formValues.text,
            originalDate,
        };

        // Make API call
        const url = `${URL_BASE}/obs_rec_update/${JSON.stringify(obsObj)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.statusCode !== 200) {
            console.error('Error updating observable: non-200 response received.', data);
            return;
        }

        // Reset form fields
        [
            'update_rec_obs_id',
            'update_rec_obs_color',
            'update_rec_obs_intensity',
            'update_rec_obs_feeling_before',
            'update_rec_obs_feeling_after',
            'update_rec_obs_duration',
            'update_rec_obs_response',
            'update_rec_obs_date',
            'update_rec_obs_tags',
            'update_rec_obs_text',
            'update_rec_obs_guests',
        ].forEach(id => (document.getElementById(id).value = id === 'update_rec_obs_color' ? '#000000' : ''));

        // Close popup and refresh observables
        close_popups();
        await get_obss();
    } catch (error) {
        handleError('id_button_update_rec_obs_submit.onclick', { error });
    }
};

// id_select_sort_by.onchange=function () {
//     try {
//         if (!id_select_sort_by.value || id_select_sort_by.value === LAST_SORT_BY) { return; }
//         LAST_SORT_BY = id_select_sort_by.value;
//         sort_obss();
//         const OBSS_OBJ = {
//             'obss': {
//                 'select_sort_by': id_select_sort_by.value
//             }
//         };
//         view_update(OBSS_OBJ).catch(error =>
//             handleError("id_select_sort_by.onclick", error)
//         );
//     } catch (error) {
//         handleError("id_select_obs_input.onchange", error);
//     }
// }
id_select_sort_by.onchange = function () {
    try {
        // Validate input
        const sortValue = id_select_sort_by.value;
        if (!sortValue || sortValue === LAST_SORT_BY) return;

        // Update the last used sort value
        LAST_SORT_BY = sortValue;

        // Perform sorting
        sort_obss();

        // Update view configuration
        const OBSS_OBJ = {
            obss: {
                select_sort_by: sortValue,
            },
        };

        view_update(OBSS_OBJ).catch(error => handleError("id_select_sort_by.onchange", { error, OBSS_OBJ }));
    } catch (error) {
        handleError("id_select_sort_by.onchange", error);
    }
};

id_find_obs_by_text.onkeyup =function () {
    try {
        let visible_obss = Array.from(id_obss_container.childNodes);
        for (let i = 0; i < visible_obss.length; i++) {
            let reason_to_flex = false;
            let temp_val_array = id_find_obs_by_text.value.toLowerCase().split(',');
            let compare_array = visible_obss[i].dataset.tags.toLowerCase().split(',');
            compare_array.push(visible_obss[i].dataset.title.toLowerCase());
            for (let j = 0; j < temp_val_array.length; j++) {
                for (let k = 0; k < compare_array.length; k++) {
                    if (compare_array[k].includes(temp_val_array[j])) {
                        reason_to_flex = true;
                        break;
                    }
                }
            }
            if (reason_to_flex) { visible_obss[i].style.display = 'flex'; }
            else { visible_obss[i].style.display = 'none'; }
        }
        id_obss_container.innerHTML = '';
        for (let i = 0; i < visible_obss.length; i++) {
            id_obss_container.appendChild(visible_obss[i]);
        }
    } catch (error) {
        handleError("id_find_obs_by_text.onkeyup", error);
    }
}

id_clear_find_obs_by_text.onclick=function () {
    try {
        id_find_obs_by_text.value = '';
        let visible_obss = Array.from(id_obss_container.childNodes);
        for (let i = 0; i < visible_obss.length; i++) {
            visible_obss[i].style.display = 'flex';
        }
        id_obss_container.innerHTML = '';
        for (let i = 0; i < visible_obss.length; i++) {
            id_obss_container.appendChild(visible_obss[i]);
        }
    } catch (error) {
        handleError("id_clear_find_obs_by_text.onclick", error);
    }
}

id_chart_menu_all_time.onclick = () => {
    try {
        drawObservablesChart("#chart", OBSS_OBJ.data, "all time");
    }  catch (error) {
        handleError("id_chart_menu_all_time.onclick", error);
    }
}

id_chart_menu_last_7_days.onclick = () => {
    try {
        drawObservablesChart("#chart", OBSS_OBJ.data, "last 7 days");
    }  catch (error) {
        handleError("id_chart_menu_last_7_days.onclick", error);
    }
}

id_chart_menu_last_month.onclick = () => {
    try {
        drawObservablesChart("#chart", OBSS_OBJ.data, "last month");
    } catch (error) {
        handleError("id_chart_menu_last_month.onclick", error);
    }
}

id_chart_menu_last_quarter.onclick = () => {
    try {
        drawObservablesChart("#chart", OBSS_OBJ.data, "last quarter");
    } catch (error) {
        handleError("id_chart_menu_last_quarter.onclick", error);
    }
}

id_chart_menu_last_year.onclick = () => {
    try {
        drawObservablesChart("#chart", OBSS_OBJ.data, "last year");
    } catch (error) {
        handleError("id_chart_menu_last_year.onclick", error);
    }
}

id_chart_menu_today.onclick = () => {
    try {
        drawObservablesChart("#chart", OBSS_OBJ.data, "today");
    } catch (error) {
        handleError("id_chart_menu_today.onclick", error);
    }
}


/**
 * Draw a time-vs-hour scatter plot for an array of objects (each with recordedObss),
 * with:
 *   - Vertical day-grid lines
 *   - Horizontal hour-grid lines
 *   - X-axis with daily or monthly tick labels (daily ≤ 31 days, otherwise monthly)
 *   - Staggered (rotated) x-axis labels for daily ticks
 *   - 0 hr at bottom, 24 hr at top
 *
 * @param {string|Element} containerSelector - Chart container (CSS selector or DOM element)
 * @param {Array} data                       - Array of objects, each with recordedObss
 * @param {string} period                    - "today", "last 7 days", "last month",
 *                                             "last quarter", "last year", or "all time"
 * @param {Object} [config]                  - optional config overrides
 *    e.g. { width: 900, height: 500, margin: { top: 20, right: 30, bottom: 50, left: 60 } }
 */
function drawObservablesChart(containerSelector, data, period, config = {}) {
  // 1) Basic config
  const defaultConfig = {
    width: 900,
    height: 500,
    margin: { top: 20, right: 30, bottom: 50, left: 60 },
  };
  const { width, height, margin } = { ...defaultConfig, ...config };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 2) Select container
  let container;
  if (typeof containerSelector === "string") {
    container = d3.select(containerSelector);
  } else {
    container = d3.select(containerSelector);
  }
  if (container.empty()) {
    console.error("No container found for:", containerSelector);
    return;
  }
  container.html(""); // clear existing content if any

  // 3) Flatten all recordedObss (no .flatMap to avoid older JS issues)
  function parseUTCtoLocal(dateStr) {
    if (!dateStr) return null;
    const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
    const dateObj = new Date(utcStr); // local time in JS
    return isNaN(dateObj) ? null : dateObj;
  }

  const allEntries = data.reduce((acc, item) => {
    if (!Array.isArray(item.recordedObss)) return acc;

    item.recordedObss.forEach((obs) => {
      const dateObj = parseUTCtoLocal(obs.dateCreated);
      if (!dateObj) return;

      const rawIntensity = parseFloat(obs.intensity);
      const intensity = isNaN(rawIntensity) ? 5 : rawIntensity;

      const hourDecimal =
        dateObj.getHours() +
        dateObj.getMinutes() / 60 +
        dateObj.getSeconds() / 3600;

      acc.push({
        date: dateObj,
        hourDecimal,
        intensity,
        color: obs.color || "888888",
        title: item.title
      });
    });
    return acc;
  }, []);

  if (!allEntries.length) {
    console.warn("No valid data found in recordedObss.");
    return;
  }

  // 4) Filter data by 'period'
  const now = new Date();
  let startDate = null;
  let endDate = now;
  const oneDayMs = 24 * 60 * 60 * 1000;

  function setStartDaysAgo(days) {
    startDate = new Date(endDate.getTime() - days * oneDayMs);
  }

  switch (period.toLowerCase()) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      break;
    case "last 7 days":
      setStartDaysAgo(7);
      break;
    case "last month":
      setStartDaysAgo(31);
      break;
    case "last quarter":
      setStartDaysAgo(90);
      break;
    case "last year":
      setStartDaysAgo(365);
      break;
    case "all time":
      startDate = d3.min(allEntries, (d) => d.date);
      endDate = d3.max(allEntries, (d) => d.date);
      break;
    default:
      console.warn(`Unrecognized period "${period}" - using "all time".`);
      startDate = d3.min(allEntries, (d) => d.date);
      endDate = d3.max(allEntries, (d) => d.date);
      break;
  }

  const filtered = allEntries.filter((d) => d.date >= startDate && d.date <= endDate);
  if (!filtered.length) {
    console.warn(`No data in the period "${period}".`);
    return;
  }

  // 5) x-domain (time) & y-domain (0..24, reversed)
  const xDomain = d3.extent(filtered, (d) => d.date);
  const yDomain = [0, 24];

  // 6) Build scales
  const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);

  // 7) Decide daily vs. monthly x-axis ticks
  const [dMin, dMax] = xDomain;
  const totalDays = (dMax - dMin) / oneDayMs;

  let xTickInterval;
  if (totalDays <= 31) {
    xTickInterval = d3.timeDay.every(1);
  } else {
    xTickInterval = d3.timeMonth.every(1);
  }

  const dateFormat = d3.timeFormat("%b %d"); // e.g. "Jan 10"

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(xTickInterval)
    .tickFormat(dateFormat);

  const yAxis = d3.axisLeft(yScale).ticks(25);

  // 8) Create SVG
  const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("font-family", "sans-serif");

  // Main group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // ------------------------------------------------------------------
  // A) Horizontal lines for each hour (0..24)
  // ------------------------------------------------------------------
  const hourBoundaries = d3.range(0, 25); // [0..24]
  g.selectAll(".hour-grid-line")
    .data(hourBoundaries)
    .enter()
    .append("line")
    .attr("class", "hour-grid-line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", (h) => yScale(h))
    .attr("y2", (h) => yScale(h))
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    // .attr("stroke-dasharray", "1,3");

  // ------------------------------------------------------------------
  // B) Vertical day lines
  // ------------------------------------------------------------------
  const dayBoundaries = d3.timeDay.range(
    d3.timeDay.floor(dMin),
    d3.timeDay.offset(d3.timeDay.floor(dMax), 1)
  );

  g.selectAll(".day-boundary-line")
    .data(dayBoundaries)
    .enter()
    .append("line")
    .attr("class", "day-boundary-line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    // .attr("stroke-dasharray", "2,2");

  // ------------------------------------------------------------------
  // C) Render the Axes (on top of the grid lines)
  // ------------------------------------------------------------------
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

  // If daily ticks, rotate the date labels to avoid overlap
  if (totalDays <= 31) {
    xAxisGroup
      .selectAll("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-45)")
      .attr("dy", "-3")
      .attr("dx", "-5");
  }

  g.append("g").call(yAxis);

  // Axis Labels
  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Date");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 15)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Hour of Day (0–24)");

  // ------------------------------------------------------------------
  // D) Plot the circles
  // ------------------------------------------------------------------
  const circleMinRadius = 3;
  const circleMaxRadius = 25;

  g.selectAll("circle")
    .data(filtered)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScale(d.hourDecimal))
    .attr("r", (d) => {
      const r = Math.max(circleMinRadius, Math.min((d.intensity * 0.5), circleMaxRadius));
      return r;
    })
    .attr("fill", (d) => (d.color.startsWith("#") ? d.color : `#${d.color}`))
    .attr("fill-opacity", 0.28)
    .attr("stroke", "#333")
    .attr("stroke-width", 1)
    .append("title")
    .text((d) => {
      const fmt = d3.timeFormat("%Y-%m-%d %H:%M");
      return `${d.title}\nTime: ${fmt(d.date)}\nIntensity: ${d.intensity}`;
    });
}



// /**
//  * Draw a time-vs-hour scatter plot for an array of objects (each with recordedObss),
//  * with vertical day lines behind the data.
//  *
//  * @param {string|Element} containerSelector - CSS selector or DOM element for the chart container
//  * @param {Array} data                       - Array of objects, each with a recordedObss array
//  * @param {string} period                    - "today", "last 7 days", "last month",
//  *                                             "last quarter", "last year", or "all time"
//  * @param {Object} [config]                  - optional config overrides
//  *   Example: { width: 900, height: 500, margin: { top: 20, ... } }
//  */
// function drawObservablesChart(containerSelector, data, period, config = {}) {
//   // 1) Default configs
//   const defaultConfig = {
//     width: 900,
//     height: 500,
//     margin: { top: 20, right: 30, bottom: 50, left: 60 },
//   };
//   const { width, height, margin } = { ...defaultConfig, ...config };
//   const innerWidth = width - margin.left - margin.right;
//   const innerHeight = height - margin.top - margin.bottom;
//
//   // 2) Select container
//   let container;
//   if (typeof containerSelector === "string") {
//     container = d3.select(containerSelector);
//   } else {
//     // assume it's already a selection or DOM element
//     container = d3.select(containerSelector);
//   }
//   if (container.empty()) {
//     console.error("No container found for:", containerSelector);
//     return;
//   }
//   container.html(""); // clear existing content if any
//
//   // 3) Flatten recordedObss (without using .flatMap to avoid older-ES issues)
//   function parseUTCtoLocal(dateStr) {
//     if (!dateStr) return null;
//     // If date string does not end with 'Z', append it so it's treated as UTC
//     const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
//     const dateObj = new Date(utcStr); // local time in JS
//     return isNaN(dateObj) ? null : dateObj;
//   }
//
//   const allEntries = data.reduce((acc, item) => {
//     if (!Array.isArray(item.recordedObss)) return acc;
//
//     item.recordedObss.forEach((obs) => {
//       const dateObj = parseUTCtoLocal(obs.dateCreated);
//       if (!dateObj) return;
//
//       const rawIntensity = parseFloat(obs.intensity);
//       const intensity = isNaN(rawIntensity) ? 5 : rawIntensity;
//
//       // hourDecimal, 0..24 in local time
//       const hourDecimal =
//         dateObj.getHours() +
//         dateObj.getMinutes() / 60 +
//         dateObj.getSeconds() / 3600;
//
//       acc.push({
//         date: dateObj,
//         hourDecimal,
//         intensity,
//         color: obs.color || "888888",
//       });
//     });
//
//     return acc;
//   }, []);
//
//   if (!allEntries.length) {
//     console.warn("No valid data found in recordedObss.");
//     return;
//   }
//
//   // 4) Filter by period
//   const now = new Date();
//   let startDate = null;
//   let endDate = now;
//   const oneDayMs = 24 * 60 * 60 * 1000;
//
//   function setStartDaysAgo(days) {
//     startDate = new Date(endDate.getTime() - days * oneDayMs);
//   }
//
//   switch (period.toLowerCase()) {
//     case "today":
//       // from local midnight to now
//       startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
//       break;
//     case "last 7 days":
//       setStartDaysAgo(7);
//       break;
//     case "last month":
//       setStartDaysAgo(30);
//       break;
//     case "last quarter":
//       setStartDaysAgo(90);
//       break;
//     case "last year":
//       setStartDaysAgo(365);
//       break;
//     case "all time":
//       startDate = d3.min(allEntries, (d) => d.date);
//       endDate = d3.max(allEntries, (d) => d.date);
//       break;
//     default:
//       console.warn(`Unrecognized period "${period}". Using "all time".`);
//       startDate = d3.min(allEntries, (d) => d.date);
//       endDate = d3.max(allEntries, (d) => d.date);
//       break;
//   }
//
//   const filtered = allEntries.filter((d) => d.date >= startDate && d.date <= endDate);
//   if (!filtered.length) {
//     console.warn(`No data in the period "${period}".`);
//     return;
//   }
//
//   // 5) Determine x-domain from filtered data
//   const xDomain = d3.extent(filtered, (d) => d.date);
//   // Y domain: 0 at the bottom, 24 at the top => reversed range
//   const yDomain = [0, 24];
//
//   // 6) Build scales
//   const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);
//   const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);
//
//   // 7) Decide daily vs monthly ticks
//   const [dMin, dMax] = xDomain;
//   const totalDays = (dMax - dMin) / oneDayMs;
//   const xTickInterval = totalDays <= 31 ? d3.timeDay.every(1) : d3.timeMonth.every(1);
//   const dateFormat = d3.timeFormat("%b %d"); // e.g. "Jan 10"
//
//   const xAxis = d3.axisBottom(xScale).ticks(xTickInterval).tickFormat(dateFormat);
//   const yAxis = d3.axisLeft(yScale).ticks(25);
//
//   // 8) Create SVG
//   const svg = container
//     .append("svg")
//     .attr("width", "100%")
//     .attr("height", "100%")
//     .attr("viewBox", `0 0 ${width} ${height}`)
//     .style("font-family", "sans-serif");
//
//   const g = svg
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);
//
//   // --------------------------------------------------------------------
//   // ADDING VERTICAL LINES FOR EACH DAY
//   // --------------------------------------------------------------------
//   // We'll generate daily "ticks" from the earliest day to the latest day
//   // and draw a line at each day boundary from top to bottom of the chart.
//   // This helps visually separate days.
//   const dayBoundaries = d3.timeDay.range(
//     // start from midnight of the first day
//     d3.timeDay.floor(dMin),
//     // up to midnight of the day after the last day
//     d3.timeDay.offset(d3.timeDay.floor(dMax), 1)
//   );
//
//   // lines for day boundaries
//   g.selectAll(".day-boundary-line")
//     .data(dayBoundaries)
//     .enter()
//     .append("line")
//     .attr("class", "day-boundary-line")
//     .attr("x1", (d) => xScale(d))
//     .attr("x2", (d) => xScale(d))
//     .attr("y1", 0)
//     .attr("y2", innerHeight)
//     .attr("stroke", "#ccc")
//     .attr("stroke-width", 1)
//     .attr("stroke-dasharray", "2,2");
//
//   // Then we render the axes AFTER so the lines are behind the axis lines
//   g.append("g")
//     .attr("transform", `translate(0, ${innerHeight})`)
//     .call(xAxis);
//
//   g.append("g").call(yAxis);
//
//   // Axis Labels
//   g.append("text")
//     .attr("x", innerWidth / 2)
//     .attr("y", innerHeight + margin.bottom - 5)
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .style("font-weight", "bold")
//     .text("Date");
//
//   g.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -innerHeight / 2)
//     .attr("y", -margin.left + 15)
//     .attr("dy", "1em")
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .style("font-weight", "bold")
//     .text("Hour of Day (0–24)");
//
//   // 9) Draw circles
//   const circleMinRadius = 3;
//   const circleMaxRadius = 25;
//
//   g.selectAll("circle")
//     .data(filtered)
//     .enter()
//     .append("circle")
//     .attr("cx", (d) => xScale(d.date))
//     .attr("cy", (d) => yScale(d.hourDecimal))
//     .attr("r", (d) => {
//       const r = Math.max(circleMinRadius, Math.min((d.intensity * 0.5), circleMaxRadius));
//       return r;
//     })
//     .attr("fill", (d) => (d.color.startsWith("#") ? d.color : `#${d.color}`))
//     .attr("fill-opacity", 0.3)
//     .attr("stroke", "#333")
//     .attr("stroke-width", 1)
//     .append("title")
//     .text((d) => {
//       const fmt = d3.timeFormat("%Y-%m-%d %H:%M");
//       return `Time: ${fmt(d.date)}\nIntensity: ${d.intensity + ' * 0.5'}`;
//     });
// }

// ???
window.onload=function () {
    get_obss()
        .then(() => { return view_configs_get('obss'); })
        .then(() => {
            view_apply();
            sort_obss();
            // For "last month" example:
            drawObservablesChart("#chart", OBSS_OBJ.data, "last month");
            // Or "today", "last 7 days", "last quarter", etc.
        })
        .catch((error) => { console.error("There was an error with the fetch request: get_obss(): ", error); });
}