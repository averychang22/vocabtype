// Sound Effect
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

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-value');
        this.timerElement = document.getElementById('timer-value');
        
        // Timer setup
        this.startTime = null;
        this.endTime = null;
        this.gameTime = 0;
        this.isTimerRunning = false;
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-value');
        
        // Make canvas fullscreen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
        
        // Smaller pixel size for more detail
        this.pixelSize = 2;
        
        // Game state initialization
        this.score = 0;
        this.currentWordIndex = 0;
        this.words = JSON.parse(localStorage.getItem('vocabularyWords') || '[]');
        this.shuffledWords = this.shuffleWords(this.words);
        this.currentTyping = '';
        this.typingState = [];
        this.wordResults = [];
        
        // Scroll position and animation
        this.scrollOffset = 0;
        this.targetScrollOffset = 0;
        this.isScrolling = false;
        
        // Colors configuration
        this.colors = {
            background: '#87CEEB',
            dog: {
                brown: '#C4A484',
                white: '#FFFFFF',
                black: '#000000',
                pink: '#FFB6C1',
                red: '#FF6B6B',
                dark: '#8B4513'
            },
            stick: '#8B4513',
            bone: '#F8F8FF',
            text: '#FFFFFF',
            correct: '#4CAF50',
            incorrect: '#FF6B6B'
        };
        
        // Animation properties
        this.jumpAnimation = {
            frame: 0,
            maxFrames: 30,
            height: 0,
            maxHeight: 80
        };
        
        // Dog properties
        this.dog = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 120,
            width: 32 * this.pixelSize,
            height: 32 * this.pixelSize,
            targetY: this.canvas.height - 120,
            isJumping: false
        };
        
        // Create sticks
        this.sticks = this.createSticks();
        
        // Add keyboard event listener
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Start game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    shuffleWords(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createSticks() {
        const sticks = [];
        const numSticks = 11;
        const spacing = 200;
        const stickWidth = 400; // Width of each stick
        
        for (let i = 0; i < numSticks; i++) {
            sticks.push({
                // Center the stick by calculating from screen center
                x: (this.canvas.width / 2) - (stickWidth / 2),
                y: this.canvas.height - 120 - (i * spacing),
                width: stickWidth,
                height: 8 * this.pixelSize,
                word: i > 0 ? this.shuffledWords[i - 1] || '' : ''
            });
        }
        return sticks;
    }

    updateScroll() {
        if (this.isScrolling) {
            const scrollSpeed = 10;
            const difference = this.targetScrollOffset - this.scrollOffset;
            
            if (Math.abs(difference) > scrollSpeed) {
                this.scrollOffset += Math.sign(difference) * scrollSpeed;
            } else {
                this.scrollOffset = this.targetScrollOffset;
                this.isScrolling = false;
            }
        }
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.pixelSize,
            y * this.pixelSize,
            this.pixelSize,
            this.pixelSize
        );
    }

    drawDog() {
        const baseX = Math.floor(this.dog.x / this.pixelSize);
        const baseY = Math.floor(this.dog.y / this.pixelSize);
        
        let jumpOffset = 0;
        if (this.dog.isJumping) {
            const progress = this.jumpAnimation.frame / this.jumpAnimation.maxFrames;
            jumpOffset = Math.sin(progress * Math.PI) * this.jumpAnimation.maxHeight;
        }
        
        // Your existing dog pattern
        const dogPattern = [
            "     kkkk      kkkk       ",
            "   kkbbbbkkkkkkbbbbkk     ",
            "  kbbbbbbbbbbbbbbbbbbk    ",
            "  kbbbbkbbbbbbbbkbbbbk    ",
            "  kbbbbkbbbbbbbbkbbbbk    ",
            "  kbbbkbbbbbbbbbbkbbbk    ",
            "  kbkkbwkbbwwbbkwbkkbk    ",
            "  kk kbkkbbwwbbkkbk kk    ",
            "     kbkkbwwwwbkkbk       ",
            "     kbbbwkkkkwbbbk       ",
            "     kbbwwwkkwwwbbk       ",
            "      kbwwppppwwbk        ",
            "       kwwwkkwwwkbk       ",
            "        kkkwwkkkbb  kk    ",
            "       kbbbkkbbbbkbk kwk  ",
            "       kbbwwwwwbbkbk  kwk ",
            "       kbwwwwwwwbkbbk kwk ",
            "       kbbwwkwwbbkbbk kbk ",
            "        kbbwkwbbkbbbbkbbk ",
            "        kbbbkbbbkkkbbkbbk ",
            "        kbbbkbbbkbbbbkbk  ",
            "       kwbbkbkbbwkbbbkbk  ",
            "      kwwwbkkkbwwwkbbkk   ",
            "      kkkkk   kkkkkkkk"
        ];
        
        dogPattern.forEach((row, y) => {
            [...row].forEach((pixel, x) => {
                let color = null;
                switch(pixel) {
                    case 'b': color = this.colors.dog.brown; break;
                    case 'w': color = this.colors.dog.white; break;
                    case 'p': color = this.colors.dog.pink; break;
                    case 'k': color = this.colors.dog.dark; break;
                }
                if (color) {
                    this.drawPixel(
                        baseX + x - 12,
                        baseY + y - 24 - Math.floor(jumpOffset / this.pixelSize),
                        color
                    );
                }
            });
        });
    }

    drawStick(x, y, width) {
        const stickHeight = 4;
        const baseX = Math.floor(x / this.pixelSize);
        const baseY = Math.floor(y / this.pixelSize);
        const pixelWidth = Math.floor(width / this.pixelSize);
        
        for (let h = 0; h < stickHeight; h++) {
            for (let w = 0; w < pixelWidth; w++) {
                this.drawPixel(baseX + w, baseY + h, this.colors.stick);
            }
        }
    }

    drawSticks() {
        const visibleSticks = this.sticks.filter(stick => {
            const adjustedY = stick.y + this.scrollOffset;
            return adjustedY < this.canvas.height + 200 && adjustedY > -200;
        });

        visibleSticks.forEach(stick => {
            this.drawStick(stick.x, stick.y + this.scrollOffset, stick.width);
        });
    }

    drawCurrentWord() {
        const currentStick = this.sticks[this.currentWordIndex + 1];
        if (!currentStick || !currentStick.word) return;

        const word = currentStick.word;
        const baseX = currentStick.x + currentStick.width/2-50;
        const baseY = currentStick.y + this.scrollOffset - 10;

        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 20px "Press Start 2P", monospace';

        let xOffset = -(word.length * 12) / 2;
        
        for (let i = 0; i < word.length; i++) {
            if (i < this.currentTyping.length) {
                this.ctx.fillStyle = this.typingState[i] ? this.colors.correct : this.colors.incorrect;
            } else {
                this.ctx.fillStyle = this.colors.text;
            }
            this.ctx.fillText(word[i], baseX + xOffset + (i * 24), baseY);
        }
    }

    updateTimer() {
        if (!this.isTimerRunning) return;
        
        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.startTime) / 1000);
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    drawBone() {
        const bonePattern = [
            "  ####  ####  ",
            " ###### ##### ",
            "############  ",
            " ###### ##### ",
            "  ####  ####  "
        ];

        // Calculate bone position relative to the last stick
        const lastStick = this.sticks[this.sticks.length - 1];
        const boneX = Math.floor(this.canvas.width / (2 * this.pixelSize)) - 6;
        const boneY = Math.floor((lastStick.y - 100) / this.pixelSize);

        bonePattern.forEach((row, y) => {
            [...row].forEach((pixel, x) => {
                if (pixel === '#') {
                    this.drawPixel(boneX + x, boneY + y, this.colors.bone);
                }
            });
        });
    }

    updateDog() {
        if (this.dog.isJumping) {
            this.jumpAnimation.frame++;
            
            if (this.jumpAnimation.frame >= this.jumpAnimation.maxFrames) {
                this.dog.isJumping = false;
                this.jumpAnimation.frame = 0;
                this.dog.y = this.dog.targetY;
            }
        }
    }

    handleKeyPress(event) {
        if (!event.key.match(/^[a-zA-Z]$/) || this.dog.isJumping || this.isScrolling) {
            return;
        }

        // Start timer on first keypress
        if (!this.startTime) {
            this.startTime = Date.now();
            this.isTimerRunning = true;
        }

        const currentWord = this.sticks[this.currentWordIndex + 1].word;
        const pressedKey = event.key.toLowerCase();
        const expectedChar = currentWord[this.currentTyping.length].toLowerCase();

        if (this.currentTyping.length < currentWord.length) {
            this.currentTyping += pressedKey;
            this.typingState[this.currentTyping.length - 1] = (pressedKey === expectedChar);

            if (this.currentTyping.length === currentWord.length) {
                const isWordCorrect = !this.typingState.includes(false);
                this.wordResults.push({
                    word: currentWord,
                    isCorrect: isWordCorrect
                });

                setTimeout(() => {
                    if (isWordCorrect) {
                        // Play correct sound
                        const correctSound = document.getElementById('correctSound');
                        if (correctSound) {
                            correctSound.currentTime = 0; // Reset sound to start
                            correctSound.play().catch(error => console.log('Sound play failed:', error));
                        }
                        this.score += 10;
                        this.scoreElement.textContent = this.score;
                        this.dog.isJumping = true;
                        
                        this.targetScrollOffset += 200;
                        this.isScrolling = true;
                        
                        this.currentWordIndex++;
                    }
                    this.currentTyping = '';
                    this.typingState = [];
                    
                    // Check if this was the last word
                    if (this.currentWordIndex >= this.shuffledWords.length) {
                        this.endTime = Date.now();
                        this.isTimerRunning = false;
                        this.gameComplete();
                    }
                }, 500);
            }
        }
    }

    gameComplete() {
        // Calculate final time
        this.endTime = Date.now();
        const finalTime = Math.floor((this.endTime - this.startTime) / 1000);

        // Store all results in localStorage
        localStorage.setItem('gameScore', this.score.toString());
        localStorage.setItem('gameTime', finalTime.toString());
        localStorage.setItem('wordResults', JSON.stringify(this.wordResults));

        // Add a small delay before redirecting
        setTimeout(() => {
            // Using absolute path from root
            window.location.href = '/results.html';
        }, 1000);
    }

    gameLoop() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateTimer();
        this.updateScroll();
        this.updateDog();
        this.drawSticks();
        this.drawCurrentWord();
        this.drawDog();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.onload = () => {
    new Game();
};

