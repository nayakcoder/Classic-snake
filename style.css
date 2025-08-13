
class NeonSerpentGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = 40;
        
        // Game state
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        // Advanced features
        this.phaseCharges = 3;
        this.maxPhaseCharges = 3;
        this.phaseActive = false;
        this.magnetActive = false;
        this.magnetDuration = 0;
        this.currentBiome = 'normal';
        this.biomeTimer = 0;
        this.speedMultiplier = 1;
        this.critters = [];
        this.obstacles = [];
        this.particles = [];
        
        // Abilities cooldowns
        this.magnetCooldown = 0;
        this.explosionCooldown = 0;
        
        this.setupEventListeners();
        this.generateCritters();
        this.generateObstacles();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('phase-btn').addEventListener('click', () => this.activatePhase());
        document.getElementById('magnet-btn').addEventListener('click', () => this.activateMagnet());
        document.getElementById('explosion-btn').addEventListener('click', () => this.tailExplosion());
        
        
        
        // Touch controls for swipe gestures
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: false });
        
        // Prevent scrolling when touching the canvas
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return; // Not a swipe, might be a tap
        }
        
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
            return;
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && this.dx === 0) {
                this.changeDirection(1, 0); // Right
            } else if (deltaX < 0 && this.dx === 0) {
                this.changeDirection(-1, 0); // Left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0 && this.dy === 0) {
                this.changeDirection(0, 1); // Down
            } else if (deltaY < 0 && this.dy === 0) {
                this.changeDirection(0, -1); // Up
            }
        }
    }
    
    changeDirection(newDx, newDy) {
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        }
        
        // Prevent reverse direction
        if ((newDx === 1 && this.dx === -1) || (newDx === -1 && this.dx === 1) ||
            (newDy === 1 && this.dy === -1) || (newDy === -1 && this.dy === 1)) {
            return;
        }
        
        this.dx = newDx;
        this.dy = newDy;
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        }
        
        if (this.gameOver && e.key === 'r') {
            this.restartGame();
            return;
        }
        
        // Movement controls
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.dy === 0) {
                    this.changeDirection(0, -1);
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.dy === 0) {
                    this.changeDirection(0, 1);
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.dx === 0) {
                    this.changeDirection(-1, 0);
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.dx === 0) {
                    this.changeDirection(1, 0);
                }
                break;
            case ' ':
                e.preventDefault();
                this.activatePhase();
                break;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.dx = 1;
        this.dy = 0;
    }
    
    restartGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.phaseCharges = 3;
        this.phaseActive = false;
        this.magnetActive = false;
        this.magnetDuration = 0;
        this.currentBiome = 'normal';
        this.biomeTimer = 0;
        this.speedMultiplier = 1;
        this.critters = [];
        this.obstacles = [];
        this.particles = [];
        this.magnetCooldown = 0;
        this.explosionCooldown = 0;
        
        this.generateCritters();
        this.generateObstacles();
        document.getElementById('game-over').style.display = 'none';
        this.updateUI();
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    generateCritters() {
        this.critters = [];
        for (let i = 0; i < 3; i++) {
            let critter;
            do {
                critter = {
                    x: Math.floor(Math.random() * this.tileCount),
                    y: Math.floor(Math.random() * this.tileCount),
                    dx: Math.random() < 0.5 ? -1 : 1,
                    dy: Math.random() < 0.5 ? -1 : 1,
                    type: Math.random() < 0.5 ? 'friendly' : 'neutral'
                };
            } while (this.snake.some(segment => segment.x === critter.x && segment.y === critter.y));
            this.critters.push(critter);
        }
    }
    
    generateObstacles() {
        this.obstacles = [];
        for (let i = 0; i < 5; i++) {
            let obstacle;
            do {
                obstacle = {
                    x: Math.floor(Math.random() * this.tileCount),
                    y: Math.floor(Math.random() * this.tileCount)
                };
            } while (this.snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y));
            this.obstacles.push(obstacle);
        }
    }
    
    activatePhase() {
        if (this.phaseCharges > 0 && !this.phaseActive) {
            this.phaseActive = true;
            this.phaseCharges--;
            this.createParticles(this.snake[0].x * this.gridSize + this.gridSize/2, 
                               this.snake[0].y * this.gridSize + this.gridSize/2, '#00ffff');
            setTimeout(() => {
                this.phaseActive = false;
            }, 1000);
        }
    }
    
    activateMagnet() {
        if (this.magnetCooldown <= 0) {
            this.magnetActive = true;
            this.magnetDuration = 300; // 5 seconds at 60fps
            this.magnetCooldown = 600; // 10 seconds cooldown
        }
    }
    
    tailExplosion() {
        if (this.explosionCooldown <= 0 && this.snake.length > 3) {
            const tail = this.snake[this.snake.length - 1];
            this.createParticles(tail.x * this.gridSize + this.gridSize/2, 
                               tail.y * this.gridSize + this.gridSize/2, '#ff6600');
            
            // Remove obstacles and critters in explosion radius
            this.obstacles = this.obstacles.filter(obs => {
                const distance = Math.abs(obs.x - tail.x) + Math.abs(obs.y - tail.y);
                return distance > 2;
            });
            
            this.critters = this.critters.filter(critter => {
                const distance = Math.abs(critter.x - tail.x) + Math.abs(critter.y - tail.y);
                return distance > 2;
            });
            
            // Remove tail segments
            this.snake = this.snake.slice(0, -2);
            this.explosionCooldown = 480; // 8 seconds cooldown
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                color: color
            });
        }
    }
    
    updateBiome() {
        this.biomeTimer++;
        
        if (this.biomeTimer > 600) { // Change biome every 10 seconds
            const biomes = ['normal', 'fire', 'ice', 'shadow'];
            let newBiome;
            do {
                newBiome = biomes[Math.floor(Math.random() * biomes.length)];
            } while (newBiome === this.currentBiome);
            
            this.currentBiome = newBiome;
            this.biomeTimer = 0;
            
            // Apply biome effects
            switch (this.currentBiome) {
                case 'fire':
                    this.speedMultiplier = 1.5;
                    this.canvas.className = 'fire-biome';
                    break;
                case 'ice':
                    this.speedMultiplier = 0.7;
                    this.canvas.className = 'ice-biome';
                    break;
                case 'shadow':
                    this.speedMultiplier = 1.2;
                    this.canvas.className = 'shadow-biome';
                    break;
                default:
                    this.speedMultiplier = 1;
                    this.canvas.className = '';
            }
        }
    }
    
    updateCritters() {
        this.critters.forEach(critter => {
            // Simple AI movement
            if (Math.random() < 0.1) {
                critter.dx = Math.random() < 0.5 ? -1 : 1;
                critter.dy = Math.random() < 0.5 ? -1 : 1;
            }
            
            critter.x += critter.dx;
            critter.y += critter.dy;
            
            // Wrap around screen
            if (critter.x < 0) critter.x = this.tileCount - 1;
            if (critter.x >= this.tileCount) critter.x = 0;
            if (critter.y < 0) critter.y = this.tileCount - 1;
            if (critter.y >= this.tileCount) critter.y = 0;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            return particle.life > 0;
        });
    }
    
    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.updateBiome();
        this.updateCritters();
        this.updateParticles();
        
        // Update cooldowns
        if (this.magnetCooldown > 0) this.magnetCooldown--;
        if (this.explosionCooldown > 0) this.explosionCooldown--;
        if (this.magnetDuration > 0) {
            this.magnetDuration--;
            if (this.magnetDuration === 0) {
                this.magnetActive = false;
            }
        }
        
        // Regenerate phase charges over time
        if (this.phaseCharges < this.maxPhaseCharges && Math.random() < 0.01) {
            this.phaseCharges++;
        }
        
        // Move snake
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Magnet effect
        if (this.magnetActive) {
            const foodDistance = Math.abs(head.x - this.food.x) + Math.abs(head.y - this.food.y);
            if (foodDistance <= 3) {
                if (this.food.x < head.x) head.x--;
                else if (this.food.x > head.x) head.x++;
                if (this.food.y < head.y) head.y--;
                else if (this.food.y > head.y) head.y++;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10 * (this.currentBiome === 'fire' ? 2 : 1);
            this.food = this.generateFood();
            this.createParticles(head.x * this.gridSize + this.gridSize/2, 
                               head.y * this.gridSize + this.gridSize/2, '#00ff00');
        } else {
            this.snake.pop();
        }
        
        // Check collisions (only if not phasing)
        if (!this.phaseActive) {
            // Wall collision
            if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
                this.endGame();
                return;
            }
            
            // Self collision
            for (let i = 1; i < this.snake.length; i++) {
                if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                    this.endGame();
                    return;
                }
            }
            
            // Obstacle collision
            if (this.obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
                this.endGame();
                return;
            }
        }
        
        // Check critter interaction
        this.critters.forEach((critter, index) => {
            if (head.x === critter.x && head.y === critter.y) {
                if (critter.type === 'friendly') {
                    this.score += 5;
                    this.critters.splice(index, 1);
                }
            }
        });
        
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('biome').textContent = this.currentBiome.charAt(0).toUpperCase() + this.currentBiome.slice(1);
        document.getElementById('phase-charges').textContent = this.phaseCharges;
        
        // Update ability buttons
        document.getElementById('phase-btn').disabled = this.phaseCharges === 0;
        document.getElementById('magnet-btn').disabled = this.magnetCooldown > 0;
        document.getElementById('explosion-btn').disabled = this.explosionCooldown > 0 || this.snake.length <= 3;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.globalAlpha = 1;
        });
        
        // Draw obstacles
        this.ctx.fillStyle = '#666666';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x * this.gridSize, obs.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        
        // Draw critters
        this.critters.forEach(critter => {
            this.ctx.fillStyle = critter.type === 'friendly' ? '#00ff00' : '#ffff00';
            this.ctx.fillRect(critter.x * this.gridSize + 2, critter.y * this.gridSize + 2, this.gridSize - 4, this.gridSize - 4);
        });
        
        // Draw food
        this.ctx.fillStyle = '#ff0066';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = this.phaseActive ? '#00ffff' : '#00ff99';
                if (this.phaseActive) {
                    this.ctx.shadowColor = '#00ffff';
                    this.ctx.shadowBlur = 20;
                }
            } else {
                // Body
                this.ctx.fillStyle = this.magnetActive ? '#ff00ff' : '#00cc88';
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        
        this.ctx.shadowBlur = 0;
        
        // Draw magnet field
        if (this.magnetActive) {
            this.ctx.strokeStyle = '#ff00ff';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                (this.snake[0].x - 3) * this.gridSize,
                (this.snake[0].y - 3) * this.gridSize,
                7 * this.gridSize,
                7 * this.gridSize
            );
            this.ctx.setLineDash([]);
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').style.display = 'block';
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        const gameSpeed = this.currentBiome === 'fire' ? 120 : 
                         this.currentBiome === 'ice' ? 200 : 150;
        
        setTimeout(() => this.gameLoop(), gameSpeed / this.speedMultiplier);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new NeonSerpentGame();
});
