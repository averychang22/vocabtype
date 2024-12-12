// Music control
document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    // Function to attempt autoplay
    const attemptAutoplay = async () => {
        try {
            await bgMusic.play();
            musicToggle.textContent = '🔊';
            localStorage.setItem('musicPlaying', 'true');
        } catch (err) {
            // If autoplay fails, we'll need user interaction
            musicToggle.textContent = '🔈';
            musicToggle.classList.add('muted');
            
            // Add a one-time click handler to the document
            const startAudio = () => {
                bgMusic.play();
                musicToggle.textContent = '🔊';
                musicToggle.classList.remove('muted');
                localStorage.setItem('musicPlaying', 'true');
                document.removeEventListener('click', startAudio);
            };
            document.addEventListener('click', startAudio);
        }
    };

    // Check if music was playing in previous page
    const musicState = localStorage.getItem('musicPlaying');
    if (musicState !== 'false') {
        attemptAutoplay();
    }

    // Music toggle button functionality
    musicToggle.addEventListener('click', (e) => {
        // Stop event propagation to prevent double-triggering
        e.stopPropagation();
        
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = '🔊';
            musicToggle.classList.remove('muted');
            localStorage.setItem('musicPlaying', 'true');
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🔈';
            musicToggle.classList.add('muted');
            localStorage.setItem('musicPlaying', 'false');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const vocabularyInputs = document.getElementById('vocabulary-inputs');
    const startGameBtn = document.getElementById('start-game');
    const randomGameBtn = document.getElementById('random-game');
    const MAX_WORDS = 10;

    // Create input fields
    function createInputField(index) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'word-input';
        
        const counter = document.createElement('span');
        counter.className = 'input-counter';
        counter.textContent = (index + 1).toString().padStart(2, '0');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter a word';
        
        inputDiv.appendChild(counter);
        inputDiv.appendChild(input);
        vocabularyInputs.appendChild(inputDiv);
    }

    // Add 10 input fields
    for (let i = 0; i < MAX_WORDS; i++) {
        createInputField(i);
    }

    // Function to get random words
    async function getRandomWords() {
        try {
            const response = await fetch('js/vocabulary.json');
            const data = await response.json();
            const allWords = data.c1_words;
            const shuffled = [...allWords].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, MAX_WORDS);
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            return [];
        }
    }

    // Handle custom words game start
    startGameBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.word-input input');
        const words = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(word => word !== '');
        
        if (words.length === MAX_WORDS) {
            localStorage.setItem('vocabularyWords', JSON.stringify(words));
            window.location.href = '/game.html';
        } else {
            alert('Please enter all 10 words before starting the game!');
        }
    });

    // Handle random words game start
    randomGameBtn.addEventListener('click', async () => {
        const randomWords = await getRandomWords();
        if (randomWords.length === MAX_WORDS) {
            localStorage.setItem('vocabularyWords', JSON.stringify(randomWords));
            window.location.href = '/game.html';
        } else {
            alert('Error loading random words. Please try again.');
        }
    });
});