class BirdArcherGame {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.gameActive = true;
        this.birdInterval = null;
        this.specialBirdChance = 0.2; // 20% chance for special bird
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameArea = document.getElementById('gameArea');
        this.archer = document.getElementById('archer');
        this.arrow = document.getElementById('arrow');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.leaderboardElement = document.getElementById('leaderboard');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        // Bind methods
        this.handleGameAreaClick = this.handleGameAreaClick.bind(this);
        this.shootBird = this.shootBird.bind(this);
        this.updateLives = this.updateLives.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.restartGame = this.restartGame.bind(this);
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.gameArea.addEventListener('click', this.handleGameAreaClick);
        this.playAgainBtn.addEventListener('click', this.restartGame);
        
        // Start the game
        this.startBirdGeneration();
        
        // Load leaderboard
        this.loadLeaderboard();
    }
    
    startBirdGeneration() {
        this.birdInterval = setInterval(() => {
            if (this.gameActive) {
                this.createBird();
            }
        }, 1500); // New bird every 1.5 seconds
    }
    
    createBird() {
        const bird = document.createElement('div');
        bird.className = 'bird';
        
        // 20% chance to create a special duck
        if (Math.random() < this.specialBirdChance) {
            bird.classList.add('special');
        }
        
        // Random starting position (from right side)
        const startY = Math.random() * (this.gameArea.clientHeight - 60);
        bird.style.top = startY + 'px';
        bird.style.left = this.gameArea.clientWidth + 'px';
        
        // Create bird HTML
        bird.innerHTML = `
            <div class="bird-body">
                <div class="bird-wing"></div>
                <div class="bird-eye">
                    <div class="bird-pupil"></div>
                </div>
                <div class="bird-beak"></div>
            </div>
        `;
        
        // Add click event
        bird.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shootBird(bird);
        });
        
        this.gameArea.appendChild(bird);
        
        // Animate bird flying left
        let position = this.gameArea.clientWidth;
        const speed = 1 + Math.random() * 2; // Random speed
        
        const flyInterval = setInterval(() => {
            if (!this.gameActive || !bird.parentNode) {
                clearInterval(flyInterval);
                return;
            }
            
            position -= speed;
            bird.style.left = position + 'px';
            
            // Small up and down movement
            const bobY = startY + Math.sin(Date.now() * 0.01) * 5;
            bird.style.top = bobY + 'px';
            
            // Remove bird if it flies off screen
            if (position < -70) {
                clearInterval(flyInterval);
                if (bird.parentNode) {
                    bird.remove();
                    // Only lose life if game is active and bird wasn't shot
                    if (this.gameActive) {
                        this.loseLife();
                    }
                }
            }
        }, 20);
    }
    
    shootBird(bird) {
        if (!this.gameActive) return;
        
        // Play arrow shoot animation
        this.arrow.classList.add('shoot');
        setTimeout(() => {
            this.arrow.classList.remove('shoot');
        }, 400);
        
        // Archer shooting animation
        this.archer.style.transform = 'translateX(-50%) rotate(-5deg)';
        setTimeout(() => {
            this.archer.style.transform = 'translateX(-50%) rotate(0deg)';
        }, 200);
        
        // Check if bird is special (color duck)
        const isSpecial = bird.classList.contains('special');
        
        // Remove bird
        bird.remove();
        
        // Update score/lives
        if (isSpecial) {
            // Special duck gives +1 life
            this.lives = Math.min(this.lives + 1, this.maxLives);
            this.updateLives();
            
            // Visual feedback for special duck
            this.showMessage('+1 LIFE!', '#ff69b4');
        } else {
            // Normal bird gives +1 point
            this.score++;
            this.updateScore();
        }
        
        // Hit effect
        this.showHitEffect();
    }
    
    handleGameAreaClick(e) {
        // If click is on game area but not on a bird, it's a miss
        if (e.target === this.gameArea && this.gameActive) {
            this.loseLife();
            
            // Show miss animation
            this.gameArea.classList.add('miss');
            setTimeout(() => {
                this.gameArea.classList.remove('miss');
            }, 300);
            
            // Archer miss animation
            this.archer.style.transform = 'translateX(-50%) rotate(5deg)';
            setTimeout(() => {
                this.archer.style.transform = 'translateX(-50%) rotate(0deg)';
            }, 200);
            
            // Play arrow shoot animation even on miss
            this.arrow.classList.add('shoot');
            setTimeout(() => {
                this.arrow.classList.remove('shoot');
            }, 400);
        }
    }
    
    loseLife() {
        if (!this.gameActive) return;
        
        this.lives--;
        this.updateLives();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    updateLives() {
        const hearts = this.livesElement.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < this.lives) {
                heart.style.opacity = '1';
            } else {
                heart.style.opacity = '0.2';
            }
        });
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    showHitEffect() {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.top = '50%';
        effect.style.left = '50%';
        effect.style.transform = 'translate(-50%, -50%)';
        effect.style.fontSize = '40px';
        effect.style.fontWeight = 'bold';
        effect.style.color = '#ffd966';
        effect.style.textShadow = '0 0 20px #ff0000';
        effect.style.zIndex = '100';
        effect.style.pointerEvents = 'none';
        effect.textContent = '💥';
        
        this.gameArea.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 300);
    }
    
    showMessage(text, color) {
        const msg = document.createElement('div');
        msg.style.position = 'absolute';
        msg.style.top = '50%';
        msg.style.left = '50%';
        msg.style.transform = 'translate(-50%, -50%)';
        msg.style.fontSize = '24px';
        msg.style.fontWeight = 'bold';
        msg.style.color = color;
        msg.style.textShadow = '0 0 10px white';
        msg.style.zIndex = '100';
        msg.style.pointerEvents = 'none';
        msg.textContent = text;
        
        this.gameArea.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 800);
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.birdInterval);
        
        // Remove all remaining birds
        const birds = this.gameArea.querySelectorAll('.bird');
        birds.forEach(bird => bird.remove());
        
        // Update final score
        this.finalScoreElement.textContent = `Score: ${this.score}`;
        
        // Save score to leaderboard
        this.saveScore();
        
        // Show game over modal
        this.gameOverModal.classList.add('show');
    }
    
    restartGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.gameActive = true;
        
        // Update UI
        this.updateScore();
        this.updateLives();
        
        // Hide modal
        this.gameOverModal.classList.remove('show');
        
        // Remove all birds
        const birds = this.gameArea.querySelectorAll('.bird');
        birds.forEach(bird => bird.remove());
        
        // Restart bird generation
        this.startBirdGeneration();
    }
    
    // Telegram Web App integration simulation
    loadLeaderboard() {
        // Simulated leaderboard data (in real app, this would come from Telegram)
        const mockLeaderboard = [
            { name: '🏹 SARTHAK', score: 45 },
            { name: '🦅 HunterPro', score: 38 },
            { name: '🎯 ArrowKing', score: 32 },
            { name: '🌟 StarShooter', score: 28 },
            { name: '⚡ QuickShot', score: 25 }
        ];
        
        this.displayLeaderboard(mockLeaderboard);
    }
    
    saveScore() {
        // In a real Telegram Web App, you would send the score to your bot
        // This is a simulation
        console.log('Score saved:', this.score);
        
        // For demo, we'll update leaderboard with player's score if it's high enough
        this.updateLeaderboardWithPlayerScore();
    }
    
    updateLeaderboardWithPlayerScore() {
        // Get player name from Telegram Web App if available
        let playerName = 'YOU';
        
        // In real Telegram Web App:
        // if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe.user) {
        //     playerName = Telegram.WebApp.initDataUnsafe.user.first_name;
        // }
        
        // Simulate leaderboard update
        const currentLeaderboard = [
            { name: '🏹 SARTHAK', score: 45 },
            { name: '🦅 HunterPro', score: 38 },
            { name: '🎯 ArrowKing', score: 32 },
            { name: '🌟 StarShooter', score: 28 },
            { name: '⚡ QuickShot', score: 25 }
        ];
        
        // Add player's score
        const newEntry = { name: `👤 ${playerName}`, score: this.score };
        currentLeaderboard.push(newEntry);
        
        // Sort by score descending and take top 5
        const top5 = currentLeaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        this.displayLeaderboard(top5);
    }
    
    displayLeaderboard(players) {
        this.leaderboardElement.innerHTML = '';
        
        players.forEach((player, index) => {
            const rank = index + 1;
            const item = document.createElement('div');
            item.className = `leaderboard-item rank${rank}`;
            
            // Add medal emoji for top 3
            let rankDisplay = rank;
            if (rank === 1) rankDisplay = '🥇';
            else if (rank === 2) rankDisplay = '🥈';
            else if (rank === 3) rankDisplay = '🥉';
            
            item.innerHTML = `
                <span class="rank">${rankDisplay}</span>
                <span class="name">${player.name}</span>
                <span class="score">${player.score}</span>
            `;
            
            this.leaderboardElement.appendChild(item);
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BirdArcherGame();
});
