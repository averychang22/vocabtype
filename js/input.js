// DOM Elements
const vocabularyInputs = document.getElementById('vocabulary-inputs');
const addWordBtn = document.getElementById('add-word');
const startGameBtn = document.getElementById('start-game');

// Keep track of words
let words = [];

// Create initial input fields
function createInputField() {
    const inputDiv = document.createElement('div');
    inputDiv.className = 'word-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter a word';
    
    inputDiv.appendChild(input);
    vocabularyInputs.appendChild(inputDiv);
}

// Add initial input fields
for (let i = 0; i < 5; i++) {
    createInputField();
}

// Add more input fields when clicked
addWordBtn.addEventListener('click', createInputField);

// Start game when clicked
startGameBtn.addEventListener('click', () => {
    // Collect all words from input fields
    const inputs = document.querySelectorAll('.word-input input');
    words = Array.from(inputs)
        .map(input => input.value.trim())
        .filter(word => word !== ''); // Remove empty inputs

    // Store words in localStorage to access them in game.html
    localStorage.setItem('vocabularyWords', JSON.stringify(words));
    
    // Redirect to game page
    if (words.length > 0) {
        window.location.href = 'game.html';
    } else {
        alert('Please enter at least one word!');
    }
});