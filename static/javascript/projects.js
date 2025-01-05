/*
Alex Haas
*/

//
window.onload = function() {
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