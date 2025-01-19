// HTML variables
let id_button_create = document.getElementById('button_create');
let id_button_delete_no = document.getElementById('button_delete_no');
let id_button_delete_yes = document.getElementById('button_delete_yes');
let id_button_month_next = document.getElementById('button_month_next');
let id_button_month_now = document.getElementById('button_month_now');
let id_button_month_prev = document.getElementById('button_month_prev');
let id_button_t_delete_submit = document.getElementById('button_t_delete_submit');
let id_button_t_update_submit = document.getElementById('button_t_update_submit');
let id_button_task_create_submit = document.getElementById('button_task_create_submit');
let id_button_task_update_submit = document.getElementById('button_task_update_submit');
let id_calendar_title = document.getElementById('calendar_title');
let id_calendar_view = document.getElementById('calendar_view');
let id_choose_month_go_input = document.getElementById('choose_month_go_input');
let id_choose_month_input = document.getElementById('choose_month_input');
let id_clear_find_tasks_by_text = document.getElementById('clear_find_tasks_by_text');
let id_find_tasks_by_text = document.getElementById('find_tasks_by_text');
let id_select_sort_by = document.getElementById('select_sort_by');
let id_t_update_error_message = document.getElementById('t_update_error_message');
let id_task_choose_one = document.getElementById('task_choose_one');
let id_task_choose_series = document.getElementById('task_choose_series');
let id_task_confirm_delete_container = document.getElementById('task_confirm_delete_container');
let id_task_create_container = document.getElementById('task_create_container');
let id_task_create_error_message = document.getElementById('task_create_error_message');
let id_task_edit_container = document.getElementById('task_edit_container');
let id_task_edit_one = document.getElementById('task_edit_one');
let id_task_edit_series = document.getElementById('task_edit_series');
let id_task_update_error_message = document.getElementById('task_update_error_message');
let id_tasks_container = document.getElementById('tasks_container');

// calendar variables
let cal_now_month = new Date().getMonth();
let cal_now_year = new Date().getFullYear();
const WEEK_PRINT_ARRAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_3_ARRAY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// other variables
let LAST_MONTH_INPUT = '';
let LAST_SORT_BY = '';
let TASKS_OBJ = false;
const LCL_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;
let VIEWS_OBJ = false;
// const URL_BASE = 'https://alex-haas.com/tv2/api';
const URL_BASE = 'http://127.0.0.1:5000/tv2/api';

// function confirm_delete_popup(task_id) {
//     try {
//         close_popups();
//         id_task_confirm_delete_container.style.display = 'flex';
//         id_button_delete_yes.onclick = function () {
//             delete_task(task_id)
//                 .then(() => {
//                     id_task_confirm_delete_container.style.display = 'none';
//                     get_tasks()
//                         // .then(() => {})
//                         .catch(error => handleError('get_tasks (confirm_delete_popup)', error));
//                 });
//         }
//     } catch (error) {
//         handleError('confirm_delete_popup', error);
//     }
// }
function confirm_delete_popup(task_id) {
    try {
        // Validate task_id
        if (!task_id || typeof task_id !== 'string') {
            throw new Error('Invalid task_id provided.');
        }

        // Close any existing popups and show the delete confirmation popup
        close_popups();
        id_task_confirm_delete_container.style.display = 'flex';

        // Remove any previously assigned click events to prevent stacking
        id_button_delete_yes.onclick = null;

        // Assign a new click event to handle task deletion
        id_button_delete_yes.onclick = async () => {
            try {
                await delete_task(task_id); // Delete the task
                id_task_confirm_delete_container.style.display = 'none'; // Close popup
                await get_tasks(); // Refresh tasks
            } catch (error) {
                handleError('confirm_delete_popup -> delete_task', { error, task_id });
            }
        };
    } catch (error) {
        handleError('confirm_delete_popup', { error, task_id });
    }
}

// RETURN input string if no date string found || strings converted to local time if found
// function convert_date_strings_to_local(input_string, plus_or_minus) {
//     try {
//         if (input_string.includes('T')) {
//             let OFFSET_AMT = plus_or_minus ? -LCL_OFFSET : LCL_OFFSET;
//             let return_string = input_string.split(',');
//             for (let ii = 0; ii < return_string.length; ii++) {
//                 if (return_string[ii].includes('T')) {
//                     return_string[ii] = new Date(new Date(return_string[ii] + 'Z') - OFFSET_AMT).toISOString().slice(0, -8);
//                 }
//             }
//             return return_string.join(',');
//         }
//         return input_string;
//     } catch (error) {
//         handleError('convert_date_strings_to_local', error);
//     }
// }
function convert_date_strings_to_local(input_string, plus_or_minus) {
    try {
        // Validate input
        if (typeof input_string !== 'string' || !input_string) {
            throw new Error('Invalid input_string provided.');
        }
        if (typeof plus_or_minus !== 'boolean') {
            throw new Error('Invalid plus_or_minus value. Expected a boolean.');
        }
        if (!LCL_OFFSET || typeof LCL_OFFSET !== 'number') {
            throw new Error('Invalid LCL_OFFSET value.');
        }

        const OFFSET_AMT = plus_or_minus ? -LCL_OFFSET : LCL_OFFSET;

        // Check if the input contains 'T' and process it
        if (input_string.includes('T')) {
            const dateParts = input_string.split(',');
            const adjustedDates = dateParts.map(part => {
                if (part.includes('T')) {
                    const utcDate = new Date(part + 'Z');
                    const localDate = new Date(utcDate.getTime() - OFFSET_AMT);
                    return localDate.toISOString().slice(0, -8);
                }
                return part;
            });

            return adjustedDates.join(',');
        }

        // Return unmodified input if no 'T' is found
        return input_string;
    } catch (error) {
        handleError('convert_date_strings_to_local', { error, input_string, plus_or_minus });
        return input_string; // Return the original input as a fallback
    }
}

// async function delete_task(task_id) {
//     try {
//         let url = URL_BASE + '/task_delete/' + task_id;
//         const response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         get_tasks()
//             .then(() => {
//                 draw_month(cal_now_month, cal_now_year);
//             })
//             .catch(error => handleError('get_tasks (delete_task)', error));
//     } catch (error) {
//         handleError('delete_task', error);
//     }
// }
async function delete_task(task_id) {
    try {
        // Validate task_id
        if (!task_id || typeof task_id !== 'string') {
            throw new Error('Invalid task_id provided.');
        }

        const url = `${URL_BASE}/task_delete/${task_id}`;
        const response = await fetch(url, { method: 'GET' });

        // Check response status
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Check response content
        if (!data || data.statusCode !== 200) {
            throw new Error(`Task deletion failed. Server response: ${JSON.stringify(data)}`);
        }

        // Refresh tasks and redraw the calendar
        await get_tasks();
        draw_month(cal_now_month, cal_now_year);
    } catch (error) {
        handleError('delete_task', { error, task_id });
    }
}


// function draw_month_from_input() {
//     try {
//         if (!id_choose_month_input.value || !id_choose_month_input.value.includes('-')) { return; }
//         const choice_array = id_choose_month_input.value.split('-');
//         draw_month(parseInt(choice_array[1]) - 1, parseInt(choice_array[0]));
//         id_calendar_view.dataset.view_config = (parseInt(choice_array[1]) - 1).toString() + ',' + parseInt(choice_array[0]).toString();
//         const TASK_OBJ = {
//             'tasks': {
//                 'calendar_view': id_calendar_view.dataset.view_config,
//                 'choose_month_input': id_choose_month_input.value
//             }
//         };
//         view_update(TASK_OBJ).catch(error => handleError('view_update (draw_month_from_input)', error));
//     } catch (error) {
//         handleError('draw_month_from_input', error);
//     }
// }
function draw_month_from_input() {
    try {
        // Validate input
        const inputValue = id_choose_month_input.value;
        if (!inputValue || !/^\d{4}-\d{2}$/.test(inputValue)) {
            throw new Error('Invalid input format. Expected YYYY-MM.');
        }

        // Extract year and month
        const [year, month] = inputValue.split('-').map(Number);
        if (month < 1 || month > 12) {
            throw new Error('Invalid month value. Expected 1-12.');
        }

        // Draw the selected month
        draw_month(month - 1, year);

        // Update view configuration
        const viewConfig = `${month - 1},${year}`;
        id_calendar_view.dataset.view_config = viewConfig;

        const TASK_OBJ = {
            tasks: {
                calendar_view: viewConfig,
                choose_month_input: inputValue,
            },
        };

        // Update the view asynchronously
        view_update(TASK_OBJ).catch(error => handleError('view_update (draw_month_from_input)', { error, TASK_OBJ }));
    } catch (error) {
        handleError('draw_month_from_input', { error, inputValue: id_choose_month_input.value });
    }
}

// function edit_task_popup(task_id) {
//     try {
//         close_popups();
//         let id_and_dates = task_id.split(',');
//         let local_task = get_local_task(id_and_dates[0]);
//         if (!local_task) {
//             throw new Error('local_task returned null...');
//         }
//         let temp_start_date = '';
//         if (local_task['dateStart'] !== null) {
//             temp_start_date = new Date(local_task['dateStart'] + 'Z');
//             temp_start_date = new Date(temp_start_date - LCL_OFFSET).toISOString().slice(0, -8);
//         }
//         let temp_end_date = '';
//         if (local_task['dateEnd'] !== null) {
//             temp_end_date = new Date(local_task['dateEnd'] + 'Z');
//             temp_end_date = new Date(temp_end_date - LCL_OFFSET).toISOString().slice(0, -8);
//         }
//         let repeat_vals = convert_date_strings_to_local(local_task['repeat'], true);
//         document.getElementById('update_task_id').value = id_and_dates[0];
//         document.getElementById('update_task_color').value = '#' + local_task['color'];
//         document.getElementById('update_task_title').value = local_task['title'];
//         document.getElementById('update_task_datestart').value = temp_start_date;
//         document.getElementById('update_task_dateend').value = temp_end_date;
//         document.getElementById('update_task_description').value = local_task['description'];
//         document.getElementById('update_task_location').value = local_task['location'];
//         document.getElementById('update_task_guests').value = local_task['guests'];
//         document.getElementById('update_task_priority').value = local_task['priority'];
//         document.getElementById('update_task_reminder').value = local_task['reminder'];
//         document.getElementById('update_task_repeat').value = repeat_vals;
//         document.getElementById('update_task_tags').value = local_task['tags'];
//         document.getElementById('update_task_text').value = local_task['text'];
//         id_task_edit_container.style.display = 'flex';
//         document.getElementById('update_t_id').value = task_id;
//         id_button_t_delete_submit.style.display = 'none';
//
//         if (id_and_dates.length !== 3) {
//             return;
//         }
//         const local_start_date = new Date(new Date(id_and_dates[1] + 'Z') - LCL_OFFSET);
//         document.getElementById('update_t_datestart').value = local_start_date.toISOString().slice(0, -8);
//         if (id_and_dates[2] !== '') {
//             const local_end_date = new Date(new Date(id_and_dates[2] + 'Z') - LCL_OFFSET);
//             document.getElementById('update_t_dateend').value = local_end_date.toISOString().slice(0, -8);
//         }
//         else {
//             document.getElementById('update_t_dateend').value = '';
//         }
//         const found_rTask = get_recordedTask(task_id, local_task['recordedTasks']);
//         if (found_rTask < 0) {
//             document.getElementById('update_t_guests').value = '';
//             document.getElementById('update_t_intensity').value = '';
//             document.getElementById('update_t_location').value = '';
//             document.getElementById('update_t_note').value = '';
//             document.getElementById('update_t_status').value = '';
//             document.getElementById('update_t_tags').value = '';
//             return;
//         }
//         document.getElementById('update_t_guests').value = local_task['recordedTasks'][found_rTask]['guests'];
//         document.getElementById('update_t_intensity').value = local_task['recordedTasks'][found_rTask]['intensity'];
//         document.getElementById('update_t_location').value = local_task['recordedTasks'][found_rTask]['location'];
//         document.getElementById('update_t_note').value = local_task['recordedTasks'][found_rTask]['note'];
//         document.getElementById('update_t_status').value = local_task['recordedTasks'][found_rTask]['status'];
//         document.getElementById('update_t_tags').value = local_task['recordedTasks'][found_rTask]['tags'];
//         id_button_t_delete_submit.style.display = 'block';
//     } catch (error) {
//         handleError('edit_task_popup', error);
//     }
// }
function edit_task_popup(task_id) {
    try {
        close_popups();

        // Validate task_id
        if (!task_id || typeof task_id !== 'string') {
            throw new Error('Invalid task_id provided.');
        }

        const id_and_dates = task_id.split(',');
        if (id_and_dates.length < 1 || !id_and_dates[0]) {
            throw new Error('Invalid task_id format. Expected at least an ID.');
        }

        const taskId = id_and_dates[0];
        const local_task = get_local_task(taskId);

        // Validate local_task
        if (!local_task || typeof local_task !== 'object') {
            throw new Error('local_task returned null or invalid object.');
        }

        if (!Array.isArray(local_task.recordedTasks)) {
            throw new Error('local_task.recordedTasks is not a valid array.');
        }

        // Convert dates with timezone adjustments
        const parseDate = (date) => date ? new Date(new Date(date + 'Z') - LCL_OFFSET).toISOString().slice(0, -8) : '';

        const temp_start_date = parseDate(local_task.dateStart);
        const temp_end_date = parseDate(local_task.dateEnd);
        const repeat_vals = convert_date_strings_to_local(local_task.repeat, true);

        // Populate task fields
        const taskFields = {
            'update_task_id': taskId,
            'update_task_color': `#${local_task.color}`,
            'update_task_title': local_task.title,
            'update_task_datestart': temp_start_date,
            'update_task_dateend': temp_end_date,
            'update_task_description': local_task.description,
            'update_task_location': local_task.location,
            'update_task_guests': local_task.guests,
            'update_task_priority': local_task.priority,
            'update_task_reminder': local_task.reminder,
            'update_task_repeat': repeat_vals,
            'update_task_tags': local_task.tags,
            'update_task_text': local_task.text,
        };

        for (const [fieldId, value] of Object.entries(taskFields)) {
            const element = document.getElementById(fieldId);
            if (!element) {
                throw new Error(`Form field with ID ${fieldId} not found.`);
            }
            element.value = value;
        }

        // Show edit container
        id_task_edit_container.style.display = 'flex';
        document.getElementById('update_t_id').value = task_id;
        id_button_t_delete_submit.style.display = 'none';

        // Handle recorded tasks if present
        if (id_and_dates.length === 3) {
            const local_start_date = parseDate(id_and_dates[1]);
            document.getElementById('update_t_datestart').value = local_start_date;

            const local_end_date = id_and_dates[2] ? parseDate(id_and_dates[2]) : '';
            document.getElementById('update_t_dateend').value = local_end_date;

            const found_rTask = get_recordedTask(task_id, local_task.recordedTasks);

            if (found_rTask >= 0) {
                const rTask = local_task.recordedTasks[found_rTask];

                const rTaskFields = {
                    'update_t_guests': rTask.guests || '',
                    'update_t_intensity': rTask.intensity || '',
                    'update_t_location': rTask.location || '',
                    'update_t_note': rTask.note || '',
                    'update_t_status': rTask.status || '',
                    'update_t_tags': rTask.tags || '',
                };

                for (const [fieldId, value] of Object.entries(rTaskFields)) {
                    const element = document.getElementById(fieldId);
                    if (!element) {
                        throw new Error(`Form field with ID ${fieldId} not found.`);
                    }
                    element.value = value;
                }

                id_button_t_delete_submit.style.display = 'block';
            }
        }
    } catch (error) {
        handleError('edit_task_popup', { error, task_id });
    }
}

// RETURN null if no local task found || task object if found
// function get_local_task(task_id) {
//     try {
//         if (TASKS_OBJ['data'].length < 1) {
//             return null;
//         }
//         for (let i = 0; i < TASKS_OBJ['data'].length; i++) {
//             if (TASKS_OBJ['data'][i]['_id'] === task_id) {
//                 return TASKS_OBJ['data'][i];
//             }
//         }
//         return null;
//     } catch (error) {
//         handleError('get_local_task', error);
//     }
// }
function get_local_task(task_id) {
    try {
        // Validate TASKS_OBJ and its structure
        if (!TASKS_OBJ || !Array.isArray(TASKS_OBJ.data) || TASKS_OBJ.data.length < 1) {
            return null;
        }

        // Use Array.prototype.find for better readability and performance
        const task = TASKS_OBJ.data.find(task => task._id === task_id);

        return task || null;
    } catch (error) {
        handleError('get_local_task', { error, task_id, tasks: TASKS_OBJ });
        return null;
    }
}

// NEED TO ADJUST FOR TIMEZONE!
// async function get_tasks() {
//     try {
//         let url = URL_BASE + '/tasks_get_all';
//         const response = await fetch(url, {method: 'GET'});
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         TASKS_OBJ = data;
//         if (parseInt(TASKS_OBJ['statusCode']) === 204) {
//             id_tasks_container.innerHTML = 'There are no tasks.';
//             console.log('get_tasks() non-200 Response:\n', TASKS_OBJ);
//             return;
//         }
//         id_tasks_container.innerHTML = '';
//         for (let i = 0; i < TASKS_OBJ['data'].length; i++) {
//             let task_container = document.createElement('div');
//             let temp_color = TASKS_OBJ['data'][i]['color'];
//             if (temp_color === 'ffffff' || temp_color === "") { task_container.style.border = '2px dashed black'; }
//             else { task_container.style.borderColor = '#' + temp_color; }
//             task_container.className = 'task_container';
//             task_container.id = TASKS_OBJ['data'][i]['_id'];
//             task_container.dataset.datecreated = TASKS_OBJ['data'][i]['dateCreated'];
//             task_container.dataset.dateend = TASKS_OBJ['data'][i]['dateEnd'];
//             task_container.dataset.datestart = TASKS_OBJ['data'][i]['dateStart'];
//             task_container.dataset.priority = TASKS_OBJ['data'][i]['priority'];
//             task_container.dataset.recordedtasksnum = TASKS_OBJ['data'][i]['recordedTasks'].length;
//             task_container.dataset.tags = TASKS_OBJ['data'][i]['tags'].join(',');
//             task_container.dataset.textlength = TASKS_OBJ['data'][i]['text'].length;
//             task_container.dataset.title = TASKS_OBJ['data'][i]['title'];
//             task_container.innerHTML = `
//                 <div class="task_menu">
//                     <div class="button button_delete"
//                          onclick="confirm_delete_popup('${TASKS_OBJ['data'][i]['_id']}')">delete</div>
//                     <div class="button button_edit"
//                          onclick="edit_task_popup('${TASKS_OBJ['data'][i]['_id']}')">edit</div>
//                 </div>
//             `;
//             let temp_created_date = new Date(TASKS_OBJ['data'][i]['dateCreated']);
//             let temp_end_date = "no end date";
//             let temp_start_date = "no start date";
//             if (TASKS_OBJ['data'][i]['dateEnd'] !== null) {
//                 temp_end_date = new Date(TASKS_OBJ['data'][i]['dateEnd'] + 'Z');
//             }
//             if (TASKS_OBJ['data'][i]['dateStart'] !== null) {
//                 temp_start_date = new Date(TASKS_OBJ['data'][i]['dateStart'] + 'Z');
//             }
//             let repeat_vals = convert_date_strings_to_local(TASKS_OBJ['data'][i]['repeat'], true);
//             task_container.innerHTML += `
//                 ${TASKS_OBJ['data'][i]['_id']}
//                 <div><b>Title:</b> ${TASKS_OBJ['data'][i]['title']}</div>
//                 <div><b>Description:</b> ${TASKS_OBJ['data'][i]['description']}</div>
//                 <div><b>Date Created:</b> ${temp_created_date}</div>
//                 <div><b>Location:</b> ${TASKS_OBJ['data'][i]['location']}</div>
//                 <div><b>Tags:</b> ${TASKS_OBJ['data'][i]['tags']}</div>
//                 <div><b>Text:</b> ${TASKS_OBJ['data'][i]['text']}</div>
//                 <div><b>Priority:</b> ${TASKS_OBJ['data'][i]['priority']}</div>
//                 <div><b>Date Start:</b> ${temp_start_date.toString()}</div>
//                 <div><b>Date End:</b> ${temp_end_date.toString()}</div>
//                 <div><b>reminder:</b> ${TASKS_OBJ['data'][i]['reminder']}</div>
//                 <div><b>repeat:</b> ${repeat_vals}</div>
//                 <div><b>number of recordedTasks:</b> ${TASKS_OBJ['data'][i]['recordedTasks'].length}</div>
//                 <div><b>recordedTasks log drop down goes here</b></div>
//             `;
//             id_tasks_container.append(task_container);
//         }
//     } catch (error) {
//         handleError('get_tasks', error);
//     }
// }
async function get_tasks() {
    try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.textContent = 'Loading tasks...';
        id_tasks_container.innerHTML = '';
        id_tasks_container.appendChild(loadingIndicator);

        const url = `${URL_BASE}/tasks_get_all`;
        const response = await fetch(url, { method: 'GET' });

        // Validate response
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid API response format');
        }

        TASKS_OBJ = data;

        // Handle empty task list
        if (parseInt(TASKS_OBJ.statusCode) === 204) {
            id_tasks_container.innerHTML = '<p>There are no tasks.</p>';
            console.log('get_tasks() non-200 Response:\n', TASKS_OBJ);
            return;
        }

        // Clear the container
        id_tasks_container.innerHTML = '';

        // Render tasks
        TASKS_OBJ.data.forEach(task => {
            const taskContainer = document.createElement('div');
            const color = task.color || 'ffffff';
            taskContainer.style.border = color === 'ffffff' ? '2px dashed black' : `2px solid #${color}`;
            taskContainer.className = 'task_container';
            taskContainer.id = task._id;

            // Add dataset attributes
            const datasetFields = ['dateCreated', 'dateEnd', 'dateStart', 'priority', 'tags', 'text', 'title'];
            datasetFields.forEach(field => {
                taskContainer.dataset[field.toLowerCase()] = task[field];
            });
            taskContainer.dataset.recordedtasksnum = task.recordedTasks.length;

            // Populate task content
            const tempStartDate = task.dateStart ? new Date(task.dateStart + 'Z').toString() : 'no start date';
            const tempEndDate = task.dateEnd ? new Date(task.dateEnd + 'Z').toString() : 'no end date';
            const repeatVals = convert_date_strings_to_local(task.repeat, true);

            taskContainer.innerHTML = `
                <div class="task_menu">
                    <div class="button button_delete" onclick="confirm_delete_popup('${task._id}')">delete</div>
                    <div class="button button_edit" onclick="edit_task_popup('${task._id}')">edit</div>
                </div>
                <div><b>Title:</b> ${task.title}</div>
                <div><b>Description:</b> ${task.description}</div>
                <div><b>Date Created:</b> ${new Date(task.dateCreated)}</div>
                <div><b>Location:</b> ${task.location}</div>
                <div><b>Tags:</b> ${task.tags.join(', ')}</div>
                <div><b>Text:</b> ${task.text}</div>
                <div><b>Priority:</b> ${task.priority}</div>
                <div><b>Date Start:</b> ${tempStartDate}</div>
                <div><b>Date End:</b> ${tempEndDate}</div>
                <div><b>Reminder:</b> ${task.reminder}</div>
                <div><b>Repeat:</b> ${repeatVals}</div>
                <div><b>Number of Recorded Tasks:</b> ${task.recordedTasks.length}</div>
            `;

            id_tasks_container.append(taskContainer);
        });
    } catch (error) {
        handleError('get_tasks', { error, url });
    } finally {
        // Remove loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }
}

// function sort_tasks() {
//     try {
//         if (!id_select_sort_by.value || !id_tasks_container.childNodes.length) {
//             return;
//         }
//         let sorted_arr = Array.from(id_tasks_container.childNodes);
//         const sort_values = id_select_sort_by.value.split(',');
//         const sortMultiplier = sort_values[1] === '0' ? 1 : -1;
//         sorted_arr = sorted_arr.sort((a, b) => {
//             if (/^\d+$/.test(a.dataset[sort_values[0]])) {
//                 return (parseInt(a.dataset[sort_values[0]]) - parseInt(b.dataset[sort_values[0]])) * sortMultiplier;
//             }
//             return a.dataset[sort_values[0]].localeCompare(b.dataset[sort_values[0]]) * sortMultiplier;
//         });
//         id_tasks_container.innerHTML = '';
//         for (let element of sorted_arr) {
//             id_tasks_container.append(element);
//         }
//     } catch (error) {
//         handleError('sort_tasks', error);
//     }
// }
function sort_tasks() {
    try {
        const sortByValue = id_select_sort_by.value;
        const tasks = Array.from(id_tasks_container.childNodes);

        // Validate input and tasks
        if (!sortByValue || tasks.length === 0) {
            return;
        }

        // Extract sorting parameters
        const [sortKey, sortOrder] = sortByValue.split(',');
        if (!sortKey || !sortOrder) {
            throw new Error('Invalid sort value format');
        }

        const sortMultiplier = sortOrder === '0' ? 1 : -1;

        // Perform sorting
        const sortedTasks = tasks.sort((a, b) => {
            const aValue = a.dataset[sortKey];
            const bValue = b.dataset[sortKey];

            if (!aValue || !bValue) {
                throw new Error(`Missing dataset key: ${sortKey}`);
            }

            // Numeric sorting
            if (/^\d+$/.test(aValue) && /^\d+$/.test(bValue)) {
                return (parseInt(aValue) - parseInt(bValue)) * sortMultiplier;
            }

            // String sorting
            return aValue.localeCompare(bValue) * sortMultiplier;
        });

        // Update DOM with sorted tasks
        id_tasks_container.replaceChildren(...sortedTasks);
    } catch (error) {
        handleError('sort_tasks', { error, sortByValue: id_select_sort_by.value });
    }
}

// function getDSTEnd(year) {
//     try {
//         const novemberFirst = new Date(year, 10, 1);
//         const firstSunday = new Date(
//             novemberFirst.getTime() + ((7 - novemberFirst.getDay()) % 7) * 24 * 60 * 60 * 1000
//         );
//         firstSunday.setHours(2, 0, 0, 0);
//         return firstSunday;
//     } catch (error) {
//         handleError('getDSTEnd', error);
//     }
// }
function getDSTEnd(year) {
    try {
        // Validate input
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
            throw new Error('Invalid year input');
        }

        // Calculate first Sunday of November
        const novemberFirst = new Date(year, 10, 1);
        const dayOfWeek = novemberFirst.getDay();
        const firstSunday = new Date(
            novemberFirst.getTime() + ((7 - dayOfWeek) % 7) * 24 * 60 * 60 * 1000
        );
        firstSunday.setHours(2, 0, 0, 0); // Set to 2:00 AM

        return firstSunday;
    } catch (error) {
        handleError('getDSTEnd', { error, year });
        return null;
    }
}

// function getDSTStart(year) {
//     try {
//         const standardOffset = new Date(year, 0, 1).getTimezoneOffset();
//         for (let month = 0; month < 12; month++) {
//             for (let day = 1; day <= 31; day++) {
//                 const date = new Date(year, month, day);
//                 if (date.getMonth() !== month) break;
//                 const currentOffset = date.getTimezoneOffset();
//                 if (currentOffset < standardOffset) {
//                     return new Date(year, month, day, 2, 0, 0);
//                 }
//             }
//         }
//         return null;
//     } catch (error) {
//         handleError('getDSTStart', error);
//         return null;
//     }
// }
function getDSTStart(year) {
    try {
        // Validate input
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
            throw new Error('Invalid year input');
        }

        // U.S. DST typically starts on the second Sunday of March
        const marchFirst = new Date(year, 2, 1);
        const dayOfWeek = marchFirst.getDay();
        const secondSunday = new Date(
            marchFirst.getTime() + ((7 - dayOfWeek) % 7 + 7) * 24 * 60 * 60 * 1000
        );
        secondSunday.setHours(2, 0, 0, 0); // Set to 2:00 AM

        return secondSunday;
    } catch (error) {
        handleError('getDSTStart', { error, year });
        return null;
    }
}

function getFirstDayOfMonth(inputDate) {
    try {
        const date = new Date(inputDate);
        date.setDate(1);
        return date;
    } catch (error) {
        handleError('getFirstDayOfMonth', error);
        return null;
    }
}

function getLastDayOfMonth(inputDate) {
    try {
        const date = new Date(inputDate);
        date.setMonth(date.getMonth() + 1);
        date.setDate(0);
        return date;
    } catch (error) {
        handleError('getLastDayOfMonth', error);
        return null;
    }
}

// function getPreviousSunday(inputDate) {
//     try {
//         const date = new Date(inputDate);
//         const dayOfWeek = date.getDay();
//         if (dayOfWeek === 0) { return date; }
//         const daysToSubtract = dayOfWeek;
//         const previousSunday = new Date(date);
//         previousSunday.setDate(date.getDate() - daysToSubtract);
//         return previousSunday;
//     } catch (error) {
//         handleError('getPreviousSunday', error);
//     }
// }
function getPreviousSunday(inputDate) {
    try {
        // Validate input
        const date = new Date(inputDate);
        if (isNaN(date)) {
            throw new Error('Invalid input date');
        }

        // Calculate previous Sunday
        const dayOfWeek = date.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
        const previousSunday = new Date(date);
        previousSunday.setDate(date.getDate() - daysToSubtract);

        return previousSunday;
    } catch (error) {
        handleError('getPreviousSunday', { error, inputDate });
        return null; // Return null to indicate failure
    }
}

function getWeeksInMonth(date) {
    try {
        if (!(date instanceof Date)) {
            throw new Error("Input must be a valid Date object");
        }
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDayOfMonth.getDay();
        const endDayOfWeek = lastDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();
        const totalDaysCovered = daysInMonth + startDayOfWeek + (6 - endDayOfWeek);
        const weeks = Math.ceil(totalDaysCovered / 7);
        return weeks;
    } catch (error) {
        handleError('getWeeksInMonth', error);
    }
}

function set_cal_month_next(month, year) {
    try {
        if (month === 11) {
            cal_now_month = 0;
            cal_now_year = ++year;
        }
        else {
            cal_now_month = ++month;
        }
        id_calendar_view.dataset.view_config = cal_now_month.toString() + ',' + cal_now_year.toString();
    } catch (error) {
        handleError('set_cal_month_next', error);
    }
}

function set_cal_month_prev(month, year) {
    try {
        if (month === 0) {
            cal_now_month = 11;
            cal_now_year = --year;
        }
        else {
            cal_now_month = --month;
        }
        id_calendar_view.dataset.view_config = cal_now_month.toString() + ',' + cal_now_year.toString();
    } catch (error) {
        handleError('set_cal_month_prev', error);
    }
}

function draw_month(month, year) {
    try {
        const curr_m = new Date(year, month);
        const curr_m_firstMoment = new Date(year, month, 1, 0, 0, 0, 0);
        const curr_m_lastMoment = new Date(year, month + 1, 0, 23, 59, 59, 999);
        let this_day = new Date(curr_m_firstMoment);
        this_day.setDate(this_day.getDate() - get_weekday_of_month(month, year));
        const top_left_day_lol = new Date(this_day);
        const bottom_right_day_lol = new Date(this_day);
        bottom_right_day_lol.setDate(bottom_right_day_lol.getDate() + (getWeeksInMonth(curr_m) * 7) - 1);
        bottom_right_day_lol.setHours(23, 59, 59, 999);
        const now_date = new Date();
        id_calendar_title.innerText = new Date(year, month).toLocaleString('default', { month: 'long' }) + ': ' + year;
        id_calendar_view.innerHTML = '';
        for (let row = 0; row < getWeeksInMonth(curr_m_firstMoment); row++) {
            let temp_row_div = document.createElement('div');
            temp_row_div.className = 'calendar_month_week';
            temp_row_div.id = 'calendar_month_week' + row.toString();
            for (let col = 0; col < 7; col++) {
                let temp_day_div = document.createElement('div');
                temp_day_div.className += 'calendar_month_day';
                temp_day_div.dataset.col = col.toString();
                temp_day_div.dataset.row = row.toString();
                if (col === 0 && row === 0) {
                    temp_day_div.className += ' calendar_month_day_corner_top_left';
                }
                else if (col === 6 && row === 0) {
                    temp_day_div.className += ' calendar_month_day_corner_top_right';
                }
                else if (col === 0 && row === getWeeksInMonth(curr_m_firstMoment) - 1) {
                    temp_day_div.className += ' calendar_month_day_corner_bottom_left';
                }
                else if (col === 6 && row === getWeeksInMonth(curr_m_firstMoment) - 1) {
                    temp_day_div.className += ' calendar_month_day_corner_bottom_right';
                }
                temp_day_div.textContent += WEEK_PRINT_ARRAY[col] + ' ';
                if (this_day < curr_m_firstMoment) {
                    temp_day_div.className += ' calendar_month_day_prev_month';
                }
                else if (this_day > curr_m_lastMoment) {
                    temp_day_div.className += ' calendar_month_day_next_month';
                }
                temp_day_div.id = this_day.getFullYear() + '-' + (this_day.getMonth() + 1) + '-' + this_day.getDate().toString();
                if (temp_day_div.id === now_date.getFullYear() + '-' + (now_date.getMonth() + 1) + '-' + now_date.getDate().toString()) {
                    temp_day_div.style.borderWidth = '4px';
                    temp_day_div.style.borderColor = 'white';
                }
                temp_day_div.textContent += this_day.getDate().toString();
                this_day.setDate(this_day.getDate() + 1);
                temp_row_div.append(temp_day_div);
            }
            id_calendar_view.append(temp_row_div);
        }
        if (!TASKS_OBJ) { return; }
        let temp_obj = TASKS_OBJ['data'];
        if (!temp_obj || temp_obj.length < 1) { return; }
        for (let i = 0; i < temp_obj.length; i++) {
            let rec_tasks = temp_obj[i]['recordedTasks'];
            if (rec_tasks && rec_tasks.length > 0) {
                for (let ii = 0; ii < rec_tasks.length; ii++) {
                    let id_and_dates = rec_tasks[ii]['id'].split(',');
                    let temp_start_date = '';
                    let start_month = '';
                    let start_year = '';
                    if (id_and_dates[1] !== "") {
                        temp_start_date = new Date(id_and_dates[1] + 'Z');
                        start_month = temp_start_date.getMonth() + 1;
                        start_year = temp_start_date.getFullYear();
                    }
                    if (temp_start_date < top_left_day_lol || temp_start_date > bottom_right_day_lol) { continue; }
                    let temp_end_date = '';
                    if (id_and_dates[2] !== "") {
                        temp_end_date = new Date(id_and_dates[1] + 'Z');
                    }
                    let day_element = document.getElementById(start_year + '-' + start_month + '-' + temp_start_date.getDate());
                    let temp_div = document.createElement('div');
                    let temp_color = temp_obj[i]['color'];
                    if (temp_color === 'ffffff' || temp_color === "") { temp_div.style.border = '2px dashed black'; }
                    else { temp_div.style.border = 'solid ' + '#' + temp_color; }
                    temp_div.id = rec_tasks[ii]['id'];
                    temp_div.onclick = () => edit_task_popup(temp_div.id);
                    temp_div.innerText = temp_obj[i]['title'];
                    day_element.append(temp_div);
                }
            }
            if (!temp_obj[i]['dateStart']) { continue; }
            let start_date_utc = new Date(temp_obj[i]['dateStart'] + 'Z');
            let end_date_utc = temp_obj[i]['dateEnd'] && new Date(temp_obj[i]['dateEnd'] + 'Z');
            let repeat_values = temp_obj[i]['repeat'].split(',');
            if (repeat_values.length === 1) {
                const rec_task_id = temp_obj[i]['_id'] + ',' + temp_obj[i]['dateStart'] + ',' + temp_obj[i]['dateEnd'];
                const found_rTask = get_recordedTask(rec_task_id, temp_obj[i]['recordedTasks']);
                if (found_rTask > -1) {
                    continue;
                }
                let day_element = document.getElementById(start_date_utc.getFullYear() + '-' + (start_date_utc.getMonth() + 1) + '-' + start_date_utc.getDate().toString());
                let temp_div = document.createElement('div');
                let temp_color = temp_obj[i]['color'];
                if (temp_color === 'ffffff' || temp_color === "") { temp_div.style.border = '2px dashed black'; }
                else { temp_div.style.border = 'dotted ' + '#' + temp_color; }
                temp_div.id = temp_obj[i]['_id'] + ',' + temp_obj[i]['dateStart'] + ',' + (end_date_utc !== null ? temp_obj[i]['dateEnd'] : '');
                temp_div.onclick = () => edit_task_popup(temp_div.id);
                temp_div.innerText = temp_obj[i]['title'];
                day_element.append(temp_div);
                continue;
            }
            let is_n = is_all_digits(repeat_values[2]);
            let is_never = repeat_values[2] === 'never';
            let skip_amt = parseInt(repeat_values[1]);
            let final_date = null;
            let occurrences = 0;
            if (repeat_values[0] === 'daily') {
                if (!is_never) {
                    if (is_n) {
                        occurrences = parseInt(repeat_values[2]);
                        final_date = new Date(start_date_utc);
                        final_date.setDate(final_date.getDate() + (skip_amt * occurrences));
                    }
                    else { final_date = new Date(repeat_values[2] + 'Z'); }
                }
                if (final_date && final_date < top_left_day_lol) { continue; }
                for (let ii = 0; is_never || final_date || ii < occurrences; ii++) {
                    let temp_start_date = new Date(start_date_utc);
                    temp_start_date.setDate(temp_start_date.getDate() + (skip_amt * ii));
                    if (final_date && temp_start_date > final_date) { break; }
                    let temp_end_date = '';
                    if (end_date_utc) {
                        temp_end_date = new Date(end_date_utc);
                        temp_end_date.setDate(temp_end_date.getDate() + (skip_amt * ii));
                    }
                    const dst_end = getDSTEnd(temp_start_date.getFullYear());
                    const dst_start = getDSTStart(temp_start_date.getFullYear());
                    if (temp_start_date > dst_start && temp_start_date < dst_end) {
                        temp_start_date.setHours(temp_start_date.getHours() + 1);
                        if (temp_end_date) {
                            temp_end_date.setHours(temp_end_date.getHours() + 1);
                        }
                    }
                    if (temp_start_date > bottom_right_day_lol) { break; }
                    if (temp_start_date < top_left_day_lol) { continue; }
                    if (temp_end_date) { temp_end_date = temp_end_date.toISOString().slice(0, -8); }
                    const rec_task_id = temp_obj[i]['_id'] + ',' + temp_start_date.toISOString().slice(0, -8) + ',' + temp_end_date;
                    const found_rTask = get_recordedTask(rec_task_id, temp_obj[i]['recordedTasks']);
                    if (found_rTask > -1) { continue; }
                    let month_day = temp_start_date.getDate();
                    let day_element = document.getElementById(temp_start_date.getFullYear() + '-' + (temp_start_date.getMonth() + 1) + '-' + month_day.toString());
                    let temp_div = document.createElement('div');
                    temp_div.id = rec_task_id;
                    temp_div.onclick = () => edit_task_popup(temp_div.id);
                    let temp_color = temp_obj[i]['color'];
                    if (temp_color === 'ffffff' || temp_color === "") { temp_div.style.border = '2px dashed black'; }
                    else { temp_div.style.border = 'dotted ' + '#' + temp_color; }
                    temp_div.innerText = temp_obj[i]['title'];
                    day_element.append(temp_div);
                }
            }
            else if (repeat_values[0] === 'monthly') {
                if (start_date_utc > bottom_right_day_lol) { continue; }
                if (!is_never) {
                    if (is_n) {
                        occurrences = parseInt(repeat_values[2]);
                        final_date = new Date(start_date_utc);
                        final_date.setMonth(final_date.getMonth() + (skip_amt * occurrences));
                    }
                    else { final_date = new Date(repeat_values[2] + 'Z'); }
                }
                const first_month_day_start = getFirstDayOfMonth(start_date_utc);
                if (final_date && final_date < top_left_day_lol) { continue; }
                outerLoop: for (let ii = 0; is_never || final_date || ii < occurrences; ii++) {
                    const chosen_month_days = repeat_values[3].split('-');
                    let month_first_day_end = '';
                    if (end_date_utc) {
                        month_first_day_end = new Date(end_date_utc);
                        month_first_day_end.setMonth(month_first_day_end.getMonth() + (skip_amt * ii));
                    }
                    let month_first_day_start = new Date(first_month_day_start);
                    month_first_day_start.setMonth(month_first_day_start.getMonth() + (skip_amt * ii));
                    const this_month_last_day = getLastDayOfMonth(month_first_day_start).getDate();
                    if (repeat_values[4] === '1') {
                        const last_day_string = this_month_last_day.toString();
                        if (!chosen_month_days.includes(last_day_string)) {
                            chosen_month_days.push(last_day_string);
                        }
                    }
                    for (let iii = 0; iii < chosen_month_days.length; iii++) {
                        let temp_end_date = '';
                        if (month_first_day_end) {
                            temp_end_date = new Date(month_first_day_end);
                            temp_end_date.setDate(month_first_day_end.getDate() + parseInt(chosen_month_days[iii]) - 1);
                        }
                        let temp_start_date = new Date(month_first_day_start);
                        temp_start_date.setDate(temp_start_date.getDate() + parseInt(chosen_month_days[iii]) - 1);
                        if (final_date && temp_start_date > final_date) { break outerLoop; }
                        if (temp_start_date > bottom_right_day_lol) { break outerLoop; }
                        if (temp_start_date < top_left_day_lol) { continue; }
                        const dst_end = getDSTEnd(temp_start_date.getFullYear());
                        const dst_start = getDSTStart(temp_start_date.getFullYear());
                        if (temp_start_date > dst_start && temp_start_date < dst_end) {
                            temp_start_date.setHours(temp_start_date.getHours() + 1);
                            if (temp_end_date) {
                                temp_end_date.setHours(temp_end_date.getHours() + 1);
                            }
                        }
                        if (temp_end_date) { temp_end_date = temp_end_date.toISOString().slice(0, -8); }
                        const rec_task_id = temp_obj[i]['_id'] + ',' + temp_start_date.toISOString().slice(0, -8)
                            + ',' + temp_end_date;
                        const found_rTask = get_recordedTask(rec_task_id, temp_obj[i]['recordedTasks']);
                        if (found_rTask > -1) { continue; }
                        let month_day = temp_start_date.getDate();
                        let day_element = document.getElementById(temp_start_date.getFullYear() + '-' + (temp_start_date.getMonth() + 1) + '-' + month_day.toString());
                        let temp_div = document.createElement('div');
                        let temp_color = temp_obj[i]['color'];
                        if (temp_color === 'ffffff' || temp_color === "") { temp_div.style.border = '2px dashed black'; }
                        else { temp_div.style.border = 'dotted ' + '#' + temp_color; }
                        temp_div.id = rec_task_id;
                        temp_div.onclick = () => edit_task_popup(temp_div.id);
                        temp_div.innerText = temp_obj[i]['title'];
                        day_element.append(temp_div);
                    }
                }
            }
            else if (repeat_values[0] === 'trigger') {
                const days_skip = parseInt(repeat_values[1]);
                let rec_tasks = temp_obj[i]['recordedTasks'];
                let due_date = false;
                let last_completed = false;
                for (let ii = 0; ii < rec_tasks.length; ii++) {
                    if (!last_completed && rec_tasks[ii]['status'].includes('completed')) {
                        last_completed = new Date(rec_tasks[ii]['id'].split(',')[1] + 'Z');
                        continue;
                    }
                    if (last_completed && rec_tasks[ii]['status'].includes('completed')) {
                        let temp_date = new Date(rec_tasks[ii]['id'].split(',')[1] + 'Z');
                        if (temp_date > last_completed) { last_completed = temp_date; }
                    }
                }
                if (!last_completed) {
                    due_date = new Date(temp_obj[i]['dateStart'] + 'Z');
                    due_date.setDate(due_date.getDate() + days_skip);
                }
                else {
                    due_date = new Date(last_completed);
                    due_date.setDate(due_date.getDate() + days_skip);
                }
                if (due_date > bottom_right_day_lol) { continue; }
                let too_late = false;
                if (due_date <= new Date()) {
                    too_late = true;
                    due_date = new Date();
                }
                let day_element = document.getElementById(due_date.getFullYear() + '-' + (due_date.getMonth() + 1) + '-' + due_date.getDate().toString());
                let temp_div = document.createElement('div');
                let temp_color = temp_obj[i]['color'];
                temp_div.style.border = 'dotted ' + '#' + temp_color;
                temp_div.id = temp_obj[i]['_id'] + ',' + due_date.toISOString().slice(0, -8) + ',' + due_date.toISOString().slice(0, -8);
                temp_div.onclick = () => edit_task_popup(temp_div.id);
                temp_div.innerText = temp_obj[i]['title'];
                if (too_late) {
                    temp_div.style.backgroundColor = 'red';
                    temp_div.style.color = 'white';
                }
                day_element.append(temp_div);
            }
            else if (repeat_values[0] === 'weekly') {
                if (!is_never) {
                    if (is_n) {
                        occurrences = parseInt(repeat_values[2]);
                        final_date = new Date(start_date_utc);
                        final_date.setDate(final_date.getDate() + (skip_amt * occurrences * 7));
                    }
                    else { final_date = new Date(repeat_values[2] + 'Z'); }
                }
                const first_sunday = new Date(getPreviousSunday(start_date_utc));
                if (final_date && final_date < top_left_day_lol) { continue; }
                outerLoop: for (let ii = 0; is_never || final_date || ii < occurrences; ii++) {
                    const chosen_weekdays = repeat_values[3].split('-');
                    let this_sunday = new Date(first_sunday);
                    this_sunday.setDate(this_sunday.getDate() + (skip_amt * ii * 7));
                    for (let iii = 0; iii < chosen_weekdays.length; iii++) {
                        let temp_start_date = new Date(this_sunday);
                        temp_start_date.setDate(temp_start_date.getDate() + WEEK_3_ARRAY.indexOf(chosen_weekdays[iii]));
                        if (final_date && temp_start_date > final_date) { break outerLoop; }
                        if (temp_start_date > bottom_right_day_lol) { break outerLoop; }
                        if (temp_start_date < top_left_day_lol) { continue; }
                        let temp_end_date = '';
                        if (end_date_utc) {
                            temp_end_date = new Date(end_date_utc);
                            temp_end_date.setDate(temp_end_date.getDate() + (skip_amt * ii * 7) + WEEK_3_ARRAY.indexOf(chosen_weekdays[iii]));
                        }
                        const dst_end = getDSTEnd(temp_start_date.getFullYear());
                        const dst_start = getDSTStart(temp_start_date.getFullYear());
                        if (temp_start_date > dst_start && temp_start_date < dst_end) {
                            temp_start_date.setHours(temp_start_date.getHours() + 1);
                            if (temp_end_date) {
                                temp_end_date.setHours(temp_end_date.getHours() + 1);
                            }
                        }
                        if (temp_end_date) { temp_end_date = temp_end_date.toISOString().slice(0, -8); }
                        const rec_task_id = temp_obj[i]['_id'] + ',' + temp_start_date.toISOString().slice(0, -8)
                            + ',' + temp_end_date;
                        const found_rTask = get_recordedTask(rec_task_id, temp_obj[i]['recordedTasks']);
                        if (found_rTask > -1) { continue; }
                        let month_day = temp_start_date.getDate();
                        let day_element = document.getElementById(temp_start_date.getFullYear() + '-' + (temp_start_date.getMonth() + 1) + '-' + month_day.toString());
                        let temp_div = document.createElement('div');
                        let temp_color = temp_obj[i]['color'];
                        if (temp_color === 'ffffff' || temp_color === "") { temp_div.style.border = '2px dashed black'; }
                        else { temp_div.style.border = 'dotted ' + '#' + temp_color; }
                        temp_div.id = rec_task_id;
                        temp_div.onclick = () => edit_task_popup(temp_div.id);
                        temp_div.innerText = temp_obj[i]['title'];
                        day_element.append(temp_div);
                    }
                }
            }
        }
    } catch (error) {
        handleError('draw_month', error);
    }
}

function get_days_in_month(month, year) {
    try {
        return new Date(year, month + 1, 0).getDate();
    } catch (error) {
        handleError('get_days_in_month', error);
    }
}

// RETURN -1 if not found or num of element
function get_recordedTask(recorded_task_id, rec_task_array) {
    try {
        if (!rec_task_array || rec_task_array.length === 0) {
            return -1;
        }
        for (let i = 0; i < rec_task_array.length; i++) {
            if (recorded_task_id === rec_task_array[i].id) {
                return i;
            }
        }
        return -1;
    } catch (error) {
        handleError('get_recordedTask', error);
    }
}

// RETURN day of week: 0..6 starting with Sunday
function get_weekday_of_month(month, year) {
    try {
        const firstDay = new Date(year, month, 1);
        return firstDay.getDay();
    } catch (error) {
        handleError('get_weekday_of_month', error);
    }
}

id_button_create.onclick = () => {
    try {
        close_popups();
        id_task_create_container.style.display = 'flex';
    } catch (error) {
        handleError('id_button_create.onclick', error);
    }
};

id_button_delete_no.onclick = () => {
    try {
        close_popups();
    } catch (error) {
        handleError('id_button_delete_no.onclick', error);
    }
};

id_button_month_next.onclick = () => {
    try {
        set_cal_month_next(cal_now_month, cal_now_year);
        draw_month(cal_now_month, cal_now_year);
        const TASK_KEY = 'tasks';
        const SORT_KEY = 'calendar_view';
        const TASK_OBJ = {
            [TASK_KEY]: {
                [SORT_KEY]: id_calendar_view.dataset.view_config
            }
        };
        view_update(TASK_OBJ).catch(error => handleError('view_update (id_button_month_next)', error));
    } catch (error) {
        handleError('id_button_month_next.onclick', error);
    }
};

id_button_month_now.onclick = () => {
    try {
        const now_date = new Date();
        draw_month(cal_now_month = now_date.getMonth(), cal_now_year = now_date.getFullYear());
        id_calendar_view.dataset.view_config = cal_now_month.toString() + ',' + cal_now_year.toString();
        const TASK_KEY = 'tasks';
        const SORT_KEY = 'calendar_view';
        const TASK_OBJ = {
            [TASK_KEY]: {
                [SORT_KEY]: id_calendar_view.dataset.view_config
            }
        };
        view_update(TASK_OBJ).catch(error => handleError('view_update (id_button_month_now)', error));
    } catch (error) {
        handleError('id_button_month_now.onclick', error);
    }
};

id_button_month_prev.onclick = () => {
    try {
        set_cal_month_prev(cal_now_month, cal_now_year);
        draw_month(cal_now_month, cal_now_year);
        const TASK_KEY = 'tasks';
        const SORT_KEY = 'calendar_view';
        const TASK_OBJ = {
            [TASK_KEY]: {
                [SORT_KEY]: id_calendar_view.dataset.view_config
            }
        };
        view_update(TASK_OBJ).catch(error => handleError('view_update (id_button_month_prev)', error));
    } catch (error) {
        handleError('id_button_month_prev.onclick', error);
    }
};

// id_button_t_delete_submit.onclick = async () => {
//     try {
//         let id_form_id = document.getElementById('update_t_id');
//         let id_form_dateend = document.getElementById('update_t_dateend');
//         let id_form_datestart = document.getElementById('update_t_datestart');
//         let id_form_guests = document.getElementById('update_t_guests');
//         let id_form_intensity = document.getElementById('update_t_intensity');
//         let id_form_location = document.getElementById('update_t_location');
//         let id_form_status = document.getElementById('update_t_status');
//         let id_form_tags = document.getElementById('update_t_tags');
//         let id_form_note = document.getElementById('update_t_note');
//         let url = URL_BASE + '/t_delete/' + id_form_id.value;
//         let response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         let data = await response.json();
//         if (data.statusCode !== 200) {
//             id_t_update_error_message.textContent = 'Error deleting recordedTask: non-200 response received...';
//             id_t_update_error_message.style.display = 'flex';
//             return;
//         }
//         close_popups();
//         id_form_dateend.value = '';
//         id_form_datestart.value = '';
//         id_form_guests.value = '';
//         id_form_intensity.value = '';
//         id_form_location.value = '';
//         id_form_status.value = '';
//         id_form_tags.value = '';
//         id_form_note.value = '';
//         get_tasks()
//             .then(() => {
//                 draw_month(cal_now_month, cal_now_year);
//             })
//             .catch(error => handleError('get_tasks (id_button_t_delete_submit)', error));
//     } catch (error) {
//         handleError('id_button_t_delete_submit.onclick', error);
//     }
// };
id_button_t_delete_submit.onclick = async () => {
    try {
        // Dynamically collect form fields
        const formFields = [
            'update_t_id',
            'update_t_dateend',
            'update_t_datestart',
            'update_t_guests',
            'update_t_intensity',
            'update_t_location',
            'update_t_status',
            'update_t_tags',
            'update_t_note',
        ].reduce((fields, id) => {
            fields[id.replace('update_t_', '')] = document.getElementById(id).value;
            return fields;
        }, {});

        // Validate task ID
        if (!formFields.id) {
            throw new Error('Task ID is required for deletion.');
        }

        // API Call
        const url = `${URL_BASE}/t_delete/${formFields.id}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.statusCode !== 200) {
            id_t_update_error_message.textContent = 'Error deleting recordedTask: non-200 response received...';
            id_t_update_error_message.style.display = 'flex';
            return;
        }

        // Success - Reset form and refresh tasks
        close_popups();
        Object.keys(formFields).forEach(key => {
            document.getElementById(`update_t_${key}`).value = '';
        });

        await get_tasks();
        draw_month(cal_now_month, cal_now_year);
    } catch (error) {
        handleError('id_button_t_delete_submit.onclick', { error });
    }
};


// id_button_t_update_submit.onclick = async () => {
//     try {
//         let id_form_id = document.getElementById('update_t_id');
//         let id_form_dateend = document.getElementById('update_t_dateend');
//         let id_form_datestart = document.getElementById('update_t_datestart');
//         let id_form_guests = document.getElementById('update_t_guests');
//         let id_form_intensity = document.getElementById('update_t_intensity');
//         let id_form_location = document.getElementById('update_t_location');
//         let id_form_status = document.getElementById('update_t_status');
//         let id_form_tags = document.getElementById('update_t_tags');
//         let id_form_note = document.getElementById('update_t_note');
//         let date_end = null;
//         let date_start = null;
//         if (id_form_dateend.value !== "") {
//             date_end = new Date(id_form_dateend.value + 'Z');
//             date_end.setTime(date_end.getTime() + LCL_OFFSET);
//             date_end = date_end.toISOString().slice(0, -8);
//         }
//         if (id_form_datestart.value !== "") {
//             date_start = new Date(id_form_datestart.value + 'Z');
//             date_start.setTime(date_start.getTime() + LCL_OFFSET);
//             date_start = date_start.toISOString().slice(0, -8);
//         }
//         let recorded_task_obj = {
//             'id': id_form_id.value,
//             'dateEnd': date_end,
//             'dateStart': date_start,
//             'guests': id_form_guests.value,
//             'intensity': id_form_intensity.value,
//             'location': id_form_location.value,
//             'note': id_form_note.value,
//             'status': id_form_status.value,
//             'tags': id_form_tags.value,
//         };
//         let url = URL_BASE + '/t_update/' + JSON.stringify(recorded_task_obj);
//         let response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         let data = await response.json();
//         if (data.statusCode != 200) {
//             id_t_update_error_message.textContent = 'Error updating recordedTask: non-200 response received...';
//             id_t_update_error_message.style.display = 'flex';
//             return;
//         }
//         close_popups();
//         id_form_dateend.value = '';
//         id_form_datestart.value = '';
//         id_form_guests.value = '';
//         id_form_intensity.value = '';
//         id_form_location.value = '';
//         id_form_status.value = '';
//         id_form_tags.value = '';
//         id_form_note.value = '';
//         get_tasks()
//             .then(() => {
//                 draw_month(cal_now_month, cal_now_year);
//             })
//             .catch(error => handleError('get_tasks (id_button_t_update_submit)', error));
//     } catch (error) {
//         handleError('id_button_t_update_submit.onclick', error);
//     }
// };
id_button_t_update_submit.onclick = async () => {
    try {
        // Dynamically collect form fields
        const formFields = [
            'update_t_id',
            'update_t_dateend',
            'update_t_datestart',
            'update_t_guests',
            'update_t_intensity',
            'update_t_location',
            'update_t_status',
            'update_t_tags',
            'update_t_note',
        ].reduce((fields, id) => {
            fields[id.replace('update_t_', '')] = document.getElementById(id).value;
            return fields;
        }, {});

        // Convert date fields with local offset
        const date_end = formFields.dateend
            ? new Date(formFields.dateend + 'Z').toISOString().slice(0, -8)
            : null;
        const date_start = formFields.datestart
            ? new Date(formFields.datestart + 'Z').toISOString().slice(0, -8)
            : null;

        // Construct task object
        const recorded_task_obj = {
            id: formFields.id,
            dateEnd: date_end,
            dateStart: date_start,
            guests: formFields.guests,
            intensity: formFields.intensity,
            location: formFields.location,
            note: formFields.note,
            status: formFields.status,
            tags: formFields.tags,
        };

        // API Call
        const url = `${URL_BASE}/t_update/${JSON.stringify(recorded_task_obj)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.statusCode !== 200) {
            id_t_update_error_message.textContent = 'Error updating recordedTask: non-200 response received...';
            id_t_update_error_message.style.display = 'flex';
            return;
        }

        // Success - Clear form and refresh tasks
        close_popups();
        Object.keys(formFields).forEach(key => {
            document.getElementById(`update_t_${key}`).value = '';
        });

        await get_tasks();
        draw_month(cal_now_month, cal_now_year);
    } catch (error) {
        handleError('id_button_t_update_submit.onclick', { error });
    }
};

// id_button_task_create_submit.onclick = async () => {
//     try {
//         let id_form_color = document.getElementById('create_task_color');
//         let id_form_dateend = document.getElementById('create_task_dateend');
//         let id_form_datestart = document.getElementById('create_task_datestart');
//         let id_form_description = document.getElementById('create_task_description');
//         let id_form_guests = document.getElementById('create_task_guests');
//         let id_form_location = document.getElementById('create_task_location');
//         let id_form_priority = document.getElementById('create_task_priority');
//         let id_form_reminder = document.getElementById('create_task_reminder');
//         let id_form_repeat = document.getElementById('create_task_repeat');
//         let id_form_tags = document.getElementById('create_task_tags');
//         let id_form_title = document.getElementById('create_task_title');
//         let id_form_text = document.getElementById('create_task_text');
//         if (id_form_title.value.toString() === "") {
//             id_task_create_error_message.style.display = 'flex';
//             return;
//         }
//         let date_end = "";
//         let date_start = "";
//         if (id_form_dateend.value === "") {
//             date_end = null;
//         } else {
//             date_end = new Date(id_form_dateend.value).toISOString().slice(0, -8);
//         }
//         if (id_form_datestart.value === "") {
//             date_start = null;
//         } else {
//             date_start = new Date(id_form_datestart.value).toISOString().slice(0, -8);
//         }
//         let task_obj = {
//             'color': id_form_color.value.substring(1, id_form_color.value.length),
//             'children': [],
//             'dateEnd': date_end,
//             'dateStart': date_start,
//             'description': id_form_description.value,
//             'guests': id_form_guests.value,
//             'location': id_form_location.value,
//             'parents': [],
//             'priority': id_form_priority.value,
//             'reminder': id_form_reminder.value,
//             'repeat': id_form_repeat.value,
//             'tags': id_form_tags.value,
//             'text': id_form_text.value,
//             'title': id_form_title.value,
//         };
//         let url = URL_BASE + '/task_create/' + JSON.stringify(task_obj);
//         const response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.statusCode != 200) {
//             id_task_create_error_message.textContent = 'Error updating task: non-200 response received...';
//             id_task_create_error_message.style.display = 'flex';
//             return;
//         }
//         close_popups();
//         id_form_color.value = '#FFFFFF';
//         id_form_dateend.value = '';
//         id_form_datestart.value = '';
//         id_form_description.value = '';
//         id_form_guests.value = '';
//         id_form_location.value = '';
//         id_form_priority.value = '';
//         id_form_repeat.value = '';
//         id_form_tags.value = '';
//         id_form_title.value = '';
//         id_form_text.value = '';
//         get_tasks()
//             .then(() => {
//                 draw_month(cal_now_month, cal_now_year);
//             })
//             .catch(error => handleError('get_tasks (id_button_task_create_submit)', error));
//     } catch (error) {
//         handleError('id_button_task_create_submit.onclick', error);
//     }
// };
id_button_task_create_submit.onclick = async () => {
    try {
        // Dynamically collect form fields
        const formFields = [
            'create_task_color',
            'create_task_dateend',
            'create_task_datestart',
            'create_task_description',
            'create_task_guests',
            'create_task_location',
            'create_task_priority',
            'create_task_reminder',
            'create_task_repeat',
            'create_task_tags',
            'create_task_title',
            'create_task_text',
        ].reduce((fields, id) => {
            fields[id.replace('create_task_', '')] = document.getElementById(id).value;
            return fields;
        }, {});

        // Validate required fields
        if (!formFields.title) {
            id_task_create_error_message.style.display = 'flex';
            return;
        }

        // Convert date fields
        const date_end = formFields.dateend ? new Date(formFields.dateend).toISOString().slice(0, -8) : null;
        const date_start = formFields.datestart ? new Date(formFields.datestart).toISOString().slice(0, -8) : null;

        // Create task object
        const task_obj = {
            color: formFields.color.substring(1), // Remove leading #
            dateEnd: date_end,
            dateStart: date_start,
            description: formFields.description,
            guests: formFields.guests,
            location: formFields.location,
            priority: formFields.priority,
            reminder: formFields.reminder,
            repeat: formFields.repeat,
            tags: formFields.tags,
            text: formFields.text,
            title: formFields.title,
            children: [], // Keeping for potential future use
            parents: [],  // Keeping for potential future use
        };

        // API Call
        const url = `${URL_BASE}/task_create/${JSON.stringify(task_obj)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.statusCode !== 200) {
            id_task_create_error_message.textContent = 'Error creating task: non-200 response received...';
            id_task_create_error_message.style.display = 'flex';
            return;
        }

        // Success - Reset form and refresh tasks
        close_popups();
        Object.keys(formFields).forEach(key => {
            if (key === 'color') {
                document.getElementById(`create_task_${key}`).value = '#FFFFFF';
            } else {
                document.getElementById(`create_task_${key}`).value = '';
            }
        });

        await get_tasks();
        draw_month(cal_now_month, cal_now_year);
    } catch (error) {
        handleError('id_button_task_create_submit.onclick', { error });
    }
};

// id_button_task_update_submit.onclick = async () => {
//     try {
//         let id_form_id = document.getElementById('update_task_id');
//         let id_form_color = document.getElementById('update_task_color');
//         let id_form_dateend = document.getElementById('update_task_dateend');
//         let id_form_datestart = document.getElementById('update_task_datestart');
//         let id_form_description = document.getElementById('update_task_description');
//         let id_form_guests = document.getElementById('update_task_guests');
//         let id_form_location = document.getElementById('update_task_location');
//         let id_form_priority = document.getElementById('update_task_priority');
//         let id_form_reminder = document.getElementById('update_task_reminder');
//         let id_form_repeat = document.getElementById('update_task_repeat');
//         let id_form_tags = document.getElementById('update_task_tags');
//         let id_form_text = document.getElementById('update_task_text');
//         let id_form_title = document.getElementById('update_task_title');
//         if (id_form_title.value === "") {
//             id_t_update_error_message.style.display = 'flex';
//             return;
//         }
//         let date_end = null;
//         let date_start = null;
//         if (id_form_dateend.value !== "") {
//             date_end = new Date(id_form_dateend.value).toISOString().slice(0, -8);
//         }
//         if (id_form_datestart.value !== "") {
//             date_start = new Date(id_form_datestart.value).toISOString().slice(0, -8);
//         }
//         let repeat_vals = convert_date_strings_to_local(id_form_repeat.value, false);
//         let task_obj = {
//             'id': id_form_id.value,
//             'color': id_form_color.value.substring(1, id_form_color.value.length),
//             'children': [],
//             'description': id_form_description.value,
//             'dateEnd': date_end,
//             'dateStart': date_start,
//             'guests': id_form_guests.value,
//             'location': id_form_location.value,
//             'parents': [],
//             'priority': id_form_priority.value,
//             'reminder': id_form_reminder.value,
//             'repeat': repeat_vals,
//             'tags': id_form_tags.value,
//             'text': id_form_text.value,
//             'title': id_form_title.value,
//         };
//         let url = URL_BASE + '/task_update/' + JSON.stringify(task_obj);
//         let response = await fetch(url, { method: 'GET' });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         let data = await response.json();
//         if (data.statusCode != 200) {
//             id_task_create_error_message.textContent = 'Error creating task: non-200 response received...';
//             id_task_create_error_message.style.display = 'flex';
//             return;
//         }
//         close_popups();
//         get_tasks()
//             .then(() => {
//                 draw_month(cal_now_month, cal_now_year);
//             })
//             .catch(error => handleError('get_tasks (id_button_task_update_submit)', error));
//     } catch (error) {
//         handleError('id_button_task_update_submit.onclick', error);
//     }
// };
id_button_task_update_submit.onclick = async () => {
    try {
        // Collect form fields dynamically
        const formFields = [
            'update_task_id',
            'update_task_color',
            'update_task_dateend',
            'update_task_datestart',
            'update_task_description',
            'update_task_guests',
            'update_task_location',
            'update_task_priority',
            'update_task_reminder',
            'update_task_repeat',
            'update_task_tags',
            'update_task_text',
            'update_task_title',
        ].reduce((fields, id) => {
            fields[id.replace('update_task_', '')] = document.getElementById(id).value;
            return fields;
        }, {});

        if (!formFields.title) {
            id_task_create_error_message.style.display = 'flex';
            return;
        }

        const date_end = formFields.dateend ? new Date(formFields.dateend).toISOString().slice(0, -8) : null;
        const date_start = formFields.datestart ? new Date(formFields.datestart).toISOString().slice(0, -8) : null;

        const task_obj = {
            id: formFields.id,
            color: formFields.color.substring(1),
            children: [],
            description: formFields.description,
            dateEnd: date_end,
            dateStart: date_start,
            guests: formFields.guests,
            location: formFields.location,
            parents: [],
            priority: formFields.priority,
            reminder: formFields.reminder,
            repeat: convert_date_strings_to_local(formFields.repeat, false),
            tags: formFields.tags,
            text: formFields.text,
            title: formFields.title,
        };

        const url = `${URL_BASE}/task_update/${JSON.stringify(task_obj)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.statusCode !== 200) {
            id_task_create_error_message.textContent = 'Error updating task: non-200 response received...';
            id_task_create_error_message.style.display = 'flex';
            return;
        }

        close_popups();

        await get_tasks();
        draw_month(cal_now_month, cal_now_year);
    } catch (error) {
        handleError('id_button_task_update_submit.onclick', error);
    }
};

id_choose_month_go_input.onclick = () => {
    try {
        draw_month_from_input();
    } catch (error) {
        handleError('id_choose_month_go_input.onclick', error);
    }
};

id_choose_month_input.onchange = () => {
    try {
        draw_month_from_input();
    } catch (error) {
        handleError('id_choose_month_input.change', error);
    }
};

// id_clear_find_tasks_by_text.onclick = () => {
//     try {
//         id_find_tasks_by_text.value = '';
//         let visible_obss = Array.from(id_tasks_container.childNodes);
//         for (let i = 0; i < visible_obss.length; i++) {
//             visible_obss[i].style.display = 'flex';
//         }
//         id_tasks_container.innerHTML = '';
//         for (let i = 0; i < visible_obss.length; i++) {
//             id_tasks_container.appendChild(visible_obss[i]);
//         }
//     } catch (error) {
//         handleError('id_clear_find_tasks_by_text.onclick', error);
//     }
// }
id_clear_find_tasks_by_text.onclick = () => {
    try {
        // Clear the search input
        id_find_tasks_by_text.value = '';

        // Reset visibility of all tasks
        Array.from(id_tasks_container.childNodes).forEach(task => {
            task.style.display = 'flex';
        });

        // No need to clear and re-append child nodes
    } catch (error) {
        handleError('id_clear_find_tasks_by_text.onclick', error);
    }
};

// id_find_tasks_by_text.onkeyup = () => {
//     try {
//         let visible_obss = Array.from(id_tasks_container.childNodes);
//         for (let i = 0; i < visible_obss.length; i++) {
//             let reason_to_flex = false;
//             let temp_val_array = id_find_tasks_by_text.value.toLowerCase().split(',');
//             let compare_array = visible_obss[i].dataset.tags.toLowerCase().split(',');
//             compare_array.push(visible_obss[i].dataset.title.toLowerCase());
//             for (let j = 0; j < temp_val_array.length; j++) {
//                 for (let k = 0; k < compare_array.length; k++) {
//                     if (compare_array[k].includes(temp_val_array[j])) {
//                         reason_to_flex = true;
//                         break;
//                     }
//                 }
//             }
//             if (reason_to_flex) {
//                 visible_obss[i].style.display = 'flex';
//             } else {
//                 visible_obss[i].style.display = 'none';
//             }
//         }
//         id_tasks_container.innerHTML = '';
//         for (let i = 0; i < visible_obss.length; i++) {
//             id_tasks_container.appendChild(visible_obss[i]);
//         }
//     } catch (error) {
//         handleError('id_find_tasks_by_text.onkeyup', error);
//     }
// };
id_find_tasks_by_text.onkeyup = () => {
    try {
        const inputValues = id_find_tasks_by_text.value.toLowerCase().split(',').map(val => val.trim());
        const taskNodes = Array.from(id_tasks_container.childNodes);

        taskNodes.forEach(task => {
            const tags = task.dataset.tags ? task.dataset.tags.toLowerCase().split(',') : [];
            const title = task.dataset.title ? [task.dataset.title.toLowerCase()] : [];
            const compareArray = tags.concat(title);

            const isVisible = inputValues.some(inputVal =>
                compareArray.some(compareVal => compareVal.includes(inputVal))
            );

            task.style.display = isVisible ? 'flex' : 'none';
        });

    } catch (error) {
        handleError('id_find_tasks_by_text.onkeyup', error);
    }
};


// id_select_sort_by.onchange = () => {
//     try {
//         if (!id_select_sort_by.value || id_select_sort_by.value === LAST_SORT_BY) {
//             return;
//         }
//         LAST_SORT_BY = id_select_sort_by.value;
//         sort_tasks();
//         const TASK_KEY = 'tasks';
//         const SORT_KEY = 'select_sort_by';
//         const TASK_OBJ = {
//             [TASK_KEY]: {
//                 [SORT_KEY]: id_select_sort_by.value
//             }
//         };
//         view_update(TASK_OBJ).catch(error => handleError('view_update (id_select_sort_by)', error));
//     } catch (error) {
//         handleError('id_select_sort_by.change', error);
//     }
// };
id_select_sort_by.onchange = () => {
    try {
        if (!id_select_sort_by.value || id_select_sort_by.value === LAST_SORT_BY) {
            return;
        }
        LAST_SORT_BY = id_select_sort_by.value;
        sort_tasks();

        const TASK_KEY = 'tasks';
        const SORT_KEY = 'select_sort_by';
        const TASK_OBJ = {
            [TASK_KEY]: {
                [SORT_KEY]: id_select_sort_by.value,
            },
        };

        view_update(TASK_OBJ).catch(error => {
            console.error('Error during view_update:', error);
            handleError('view_update (id_select_sort_by)', error);
        });
    } catch (error) {
        handleError('id_select_sort_by.change', error);
    }
};

id_task_choose_one.onclick = () => {
    try {
        id_task_edit_series.style.display = 'none';
        id_task_edit_one.style.display = 'flex';
    } catch (error) {
        handleError('id_task_choose_one.onclick', error);
    }
};

id_task_choose_series.onclick = () => {
    try {
        id_task_edit_one.style.display = 'none';
        id_task_edit_series.style.display = 'flex';
    } catch (error) {
        handleError('id_task_choose_series.onclick', error);
    }
};

window.onload = function () {
    try {
        get_tasks()
            .then(() => { return view_configs_get('tasks'); })
            .then(() => {
                view_apply();
                if (id_select_sort_by.value !== "") {
                    sort_tasks();
                }
                if (id_calendar_view.dataset.view_config !== "") {
                    let temp_array = id_calendar_view.dataset.view_config.split(',');
                    if (temp_array.length === 2) {
                        cal_now_month = parseInt(temp_array[0]);
                        cal_now_year = parseInt(temp_array[1]);
                    }
                }
                draw_month(cal_now_month, cal_now_year);
            })
            .catch(error => handleError('window.onload chain', error));
    } catch (error) {
        handleError('window.onload', error);
    }
}