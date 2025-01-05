/*
Alex Haas
*/

// changes displayed div
function choose_flashcards() {
    console.log('flashcards clicked!');
    document.getElementById('flashcards').style.display = 'flex';
    document.getElementById('tuts').style.display = 'none';
}

// changes displayed div
function choose_tuts() {
    console.log('tuts clicked!');
    document.getElementById('flashcards').style.display = 'none';
    document.getElementById('tuts').style.display = 'flex';
}