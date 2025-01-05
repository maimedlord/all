/*
Alex Haas
*/

// onload
window.onload = function() {
    ratingGraph();
    header();
}

// header image animation
function header() {
    header_arr = document.getElementsByClassName('header_cell');
    setInterval(function () {
        for (let i = 0; i < header_arr.length; i++) {
            if (Math.random() > 0.66) {
                header_arr.item(i).style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            }
        }
    }, 4000);
}

// uses dataset value to automate creating experience rating
function ratingGraph() {
    var rating_arr = document.getElementsByClassName('rating_wrapper');
    for (let i = 0; i < rating_arr.length; i++) {
        var rating_val = rating_arr[i].dataset.val;
        for (let ii = 0; ii < 10; ii++) {
            var temp_div = document.createElement('div');
            temp_div.classList = 'rating_cell';
            temp_div.innerText = (ii + 1).toString();
            if ((ii + 1) <= rating_val) {
                temp_div.classList.add('rating_cell_a');
                rating_arr.item(i).appendChild(temp_div);
            }
            else {
                temp_div.classList.add('rating_cell_b');
                rating_arr.item(i).appendChild(temp_div);
            }
        }
    }
}

// sorts skills alphabetically ascending and descending
function sortAlpha() {
    var skillset_arr = [];
    var skillset_coll = document.getElementById('skillset');
    var sortFn;
    // prep sorting function based on current state
    if (skillset_coll.dataset.sortdirection == 'asc' && skillset_coll.dataset.sorttype == 'alpha')
    {
        sortFn = function (a, b) {
            if (a.dataset.name.toLowerCase() < b.dataset.name.toLowerCase()) return 1;
            else return -1;
        }
    }
    else {
        sortFn = function (a, b) {
            if (a.dataset.name.toLowerCase() > b.dataset.name.toLowerCase()) return 1;
            else return -1;
        }
    }
    // move unsorted elements to an array for sorting
    for (var i = 0; i < skillset_coll.children.length; i++) skillset_arr.push(skillset_coll.children[i]);
    // sort
    console.log('just before sort');
    skillset_arr.sort(sortFn);
    // update dataset
    if (skillset_coll.dataset.sorttype == 'exp') {
        skillset_coll.dataset.sorttype = 'alpha';
        skillset_coll.dataset.sortdirection = 'asc'
    }
    else {
        if (skillset_coll.dataset.sortdirection == 'asc') skillset_coll.dataset.sortdirection = 'desc';
        else skillset_coll.dataset.sortdirection = 'asc';
    }
    // push sorted array into HTML collection
    skillset_arr.forEach(element => skillset_coll.append(element))
}

// sorts skills by experience rating ascending and descending
function sortExperience() {
    var skillset_arr = [];
    var skillset_coll = document.getElementById('skillset');
    var sortFn;
    // prep sorting function based on current state
    if (skillset_coll.dataset.sortdirection == 'asc' && skillset_coll.dataset.sorttype == 'exp')
    {
        sortFn = function (a, b) {
            if (parseInt(a.dataset.val) < parseInt(b.dataset.val)) return 1;
            else return -1;
        }
    }
    else {
        sortFn = function (a, b) {
            console.log(a.dataset.val);
            if (parseInt(a.dataset.val) > parseInt(b.dataset.val)) return 1;
            else return -1;
        }
    }
    // move unsorted elements to an array for sorting
    for (var i = 0; i < skillset_coll.children.length; i++) skillset_arr.push(skillset_coll.children[i]);
    // sort
    skillset_arr.sort(sortFn);
    // update dataset
    if (skillset_coll.dataset.sorttype == 'alpha') {
        skillset_coll.dataset.sorttype = 'exp';
        skillset_coll.dataset.sortdirection = 'asc'
    }
    else {
        if (skillset_coll.dataset.sortdirection == 'asc') skillset_coll.dataset.sortdirection = 'desc';
        else skillset_coll.dataset.sortdirection = 'asc';
    }
    // push sorted array into HTML collection
    skillset_arr.forEach(element => skillset_coll.append(element))
}