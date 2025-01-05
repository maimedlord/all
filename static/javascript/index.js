// GLOBALS
var CIRCLE_DIAMETER = 200;
var MAX_CIRCLES = 400;
var MOVEMENT_AMT = 5;

window.onload = function () {
    drawCircles();
}

function drawCircles() {
    // set starting values for first circle
    var bottomValue = 50;
    var leftValue = 50;
    // loop infinitely
    const interval = setInterval(function () {
        var circle_divs = document.getElementById('circle_divs');
        // generate random values that determine movement
        var bottom = Math.round(Math.random() * (2 - 1) + 1);
        var left = Math.round(Math.random() * (2 - 1) + 1);
        // move from bottom
        if (bottom == 1) {bottomValue += MOVEMENT_AMT;}
        else {bottomValue -= MOVEMENT_AMT;}
        // move from left
        if (left == 1) {leftValue += MOVEMENT_AMT;}
        else {leftValue -= MOVEMENT_AMT;}
        // if circles are about to be drawn off-screen
        if (bottomValue >= 101 || bottomValue <= 0 || leftValue >= 101 || leftValue <= 0) {
            bottomValue = 50;
            leftValue = 50;
        }
        // remove circle if 400 already exist
        if (circle_divs.children.length >= MAX_CIRCLES) {
            circle_divs.removeChild(circle_divs.children[0]);
        }
        // create div with new color and position properties
        var temp_div;
        temp_div = document.createElement('div');
        temp_div.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        temp_div.style.borderRadius = '50%';
        temp_div.style.bottom = bottomValue.toString() + '%';
        temp_div.style.height = CIRCLE_DIAMETER.toString() + 'px';
        temp_div.style.left = 'calc(' + leftValue.toString() + '% - ' + CIRCLE_DIAMETER.toString() + 'px)';
        temp_div.style.position = 'absolute';
        temp_div.style.width = CIRCLE_DIAMETER.toString() + 'px';
        temp_div.style.zIndex = '-2';
        // draw on page
        circle_divs.append(temp_div);
    }, 500)
}