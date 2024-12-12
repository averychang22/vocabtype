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
    // Get game results from localStorage
    const score = localStorage.getItem('gameScore');
    const gameTime = parseInt(localStorage.getItem('gameTime')) || 0;
    const wordResults = JSON.parse(localStorage.getItem('wordResults') || '[]');

    console.log('Retrieved score from localStorage:', score); // Debug log

    // Check if we have data (if not, redirect to index)
    if (!wordResults.length) {
        window.location.href = './index.html';
        return;
    }

    // Display score
    const scoreDisplay = document.querySelector('.score-value');
    if (scoreDisplay) {
        // Create score elements
        const scoreNumber = document.createElement('span');
        scoreNumber.className = 'score-number';
        scoreNumber.textContent = score || '0';
        
        const scoreDenominator = document.createElement('span');
        scoreDenominator.className = 'score-denominator';
        scoreDenominator.textContent = ' /100';
        
        // Clear existing content and add new elements
        scoreDisplay.innerHTML = '';
        scoreDisplay.appendChild(scoreNumber);
        scoreDisplay.appendChild(scoreDenominator);
    }

    // Display time
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    document.getElementById('time').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Separate correct and wrong words
    const correctWords = wordResults.filter(result => result.isCorrect);
    const wrongWords = wordResults.filter(result => !result.isCorrect);

    // Display correct words
    const correctWordsContainer = document.getElementById('correct-words');
    correctWords.forEach(result => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';
        wordElement.textContent = result.word;
        correctWordsContainer.appendChild(wordElement);
    });

    // Display wrong words
    const wrongWordsContainer = document.getElementById('wrong-words');
    wrongWords.forEach(result => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';
        wordElement.textContent = result.word;
        wrongWordsContainer.appendChild(wordElement);
    });

    // Add pixel art confetti effect
    createPixelConfetti();

    // Clear localStorage when starting a new game
    const tryAgainButton = document.querySelector('.pixel-button');
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', () => {
            localStorage.clear();
        });
    }
});

function createPixelConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '-1';
    document.body.appendChild(confettiContainer);

    const colors = ['#FFD700', '#FF6B6B', '#4CAF50', '#5C94FC'];
    
    for (let i = 0; i < 50; i++) {
        const pixel = document.createElement('div');
        pixel.style.position = 'absolute';
        pixel.style.width = '8px';
        pixel.style.height = '8px';
        pixel.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        pixel.style.left = Math.random() * 100 + '%';
        pixel.style.top = -20 + 'px';
        pixel.style.animation = `fall ${2 + Math.random() * 3}s linear infinite`;
        confettiContainer.appendChild(pixel);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(-20px) rotate(0deg);
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}