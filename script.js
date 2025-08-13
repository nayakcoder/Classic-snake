document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Enable image smoothing for better visuals
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Game variables
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let gameSpeed = 150; // milliseconds
    let gameRunning = false;
    let gameOver = false;
    
    // Game mode and difficulty variables
    const gameModes = ['Classic', 'Time Attack', 'Survival', 'Zen'];
    let currentGameMode = 'Classic';
    const difficultyLevels = ['Easy', 'Normal', 'Hard', 'Insane'];
    let currentDifficulty = 'Normal';
    let difficultySettings = {
        'Easy': {
            baseSpeed: 180,
            obstacleCount: 2,
            critterCount: 1,
            specialFoodChance: 0.15,
            scoreMultiplier: 0.8
        },
        'Normal': {
            baseSpeed: 150,
            obstacleCount: 4,
            critterCount: 2,
            specialFoodChance: 0.2,
            scoreMultiplier: 1.0
        },
        'Hard': {
            baseSpeed: 120,
            obstacleCount: 6,
            critterCount: 3,
            specialFoodChance: 0.25,
            scoreMultiplier: 1.5
        },
        'Insane': {
            baseSpeed: 90,
            obstacleCount: 8,
            critterCount: 4,
            specialFoodChance: 0.3,
            scoreMultiplier: 2.0
        }
    };
    
    // Level system
    let currentLevel = 1;
    let pointsToNextLevel = 50;
    let levelUpPending = false;
    
    // Ability variables
    let phaseDashActive = false;
    let phaseDashCooldown = 0;
    let phaseDashMaxCooldown = 5000; // 5 seconds cooldown
    let phaseDashDuration = 1500; // 1.5 seconds of phasing
    let phaseDashTimer = null;
    let cooldownTimer = null;
    
    // New abilities
    let timeWarpActive = false;
    let timeWarpCooldown = 0;
    const timeWarpCooldownMax = 15; // seconds
    const timeWarpDuration = 5000; // milliseconds
    let timeWarpTimer = null;
    let originalGameSpeed = 0;
    
    let magnetActive = false;
    let magnetCooldown = 0;
    const magnetCooldownMax = 12; // seconds
    const magnetDuration = 4000; // milliseconds
    let magnetTimer = null;
    const magnetRange = 8; // grid cells
    
    // Power-up system
    const powerUpTypes = [
        {
            name: 'Shield',
            color: '#4287f5',
            icon: '🛡️',
            duration: 8000,
            effect: () => activateShield()
        },
        {
            name: 'Growth',
            color: '#42f57b',
            icon: '🌱',
            duration: 0,
            effect: () => instantGrowth()
        },
        {
            name: 'Shrink',
            color: '#f542e3',
            icon: '📏',
            duration: 0,
            effect: () => shrinkSnake()
        },
        {
            name: 'Slow Motion',
            color: '#f5d442',
            icon: '⏱️',
            duration: 10000,
            effect: () => activateSlowMotion()
        },
        {
            name: 'Ghost',
            color: '#ffffff',
            icon: '👻',
            duration: 6000,
            effect: () => activateGhostMode()
        },
        {
            name: 'Bomb',
            color: '#f54242',
            icon: '💣',
            duration: 0,
            effect: () => explodeBomb()
        }
    ];
    
    let activePowerUps = [];
    let powerUpChance = 0.1; // 10% chance for power-up to appear
    let powerUp = null;
    
    // Snake customization
    const snakeSkins = ['Default', 'Rainbow', 'Pixel', 'Neon', 'Galaxy'];
    let currentSnakeSkin = 'Default';
    
    // Achievement system
    const achievements = [
        { id: 'first_50', name: 'Rookie Serpent', description: 'Score 50 points', unlocked: false, score: 50 },
        { id: 'first_100', name: 'Skilled Serpent', description: 'Score 100 points', unlocked: false, score: 100 },
        { id: 'first_200', name: 'Expert Serpent', description: 'Score 200 points', unlocked: false, score: 200 },
        { id: 'first_500', name: 'Master Serpent', description: 'Score 500 points', unlocked: false, score: 500 },
        { id: 'biome_master', name: 'Biome Master', description: 'Experience all biomes in one game', unlocked: false, biomes: [] },
        { id: 'power_collector', name: 'Power Collector', description: 'Collect all power-up types', unlocked: false, collected: [] },
        { id: 'speed_demon', name: 'Speed Demon', description: 'Reach level 10', unlocked: false, level: 10 },
        { id: 'survivor', name: 'Survivor', description: 'Survive for 3 minutes', unlocked: false, time: 180 },
        { id: 'ghost_rider', name: 'Ghost Rider', description: 'Use Phase Dash 10 times in one game', unlocked: false, count: 0 }
    ];
    
    // Load achievements from localStorage
    if (localStorage.getItem('snakeAchievements')) {
        const savedAchievements = JSON.parse(localStorage.getItem('snakeAchievements'));
        achievements.forEach((achievement, index) => {
            if (savedAchievements[index] && savedAchievements[index].unlocked) {
                achievement.unlocked = true;
            }
        });
    }
    
    // Game stats for achievements
    let gameStats = {
        gameTime: 0,
        phaseDashCount: 0,
        experiencedBiomes: [],
        collectedPowerUps: []
    };
    
    // Shield ability state
    let shieldActive = false;
    
    // Biome variables
    const biomes = ['Normal', 'Fire', 'Ice', 'Magnetic', 'Toxic'];
    let currentBiome = 'Normal';
    let biomeChangeTimer = null;
    let toxicClouds = [];
    let biomeEffects = {
        'Normal': {
            speedModifier: 1,
            turnDelay: 0,
            foodAttractionForce: 0,
            description: 'Standard gameplay'
        },
        'Fire': {
            speedModifier: 1.5,
            turnDelay: 0,
            foodAttractionForce: 0,
            description: 'Increased speed, more points'
        },
        'Ice': {
            speedModifier: 0.8,
            turnDelay: 150, // ms delay for turning
            foodAttractionForce: 0,
            description: 'Slower speed, delayed turns'
        },
        'Magnetic': {
            speedModifier: 1,
            turnDelay: 0,
            foodAttractionForce: 0.3, // Attraction force towards food
            description: 'Food attracts the snake'
        },
        'Toxic': {
            speedModifier: 1.2,
            turnDelay: 0,
            foodAttractionForce: -0.15, // Negative value for attraction = repulsion
            foodRepulsionForce: 0.25, // Chance to actively repel from food
            description: 'Food repels the snake, toxic clouds appear'
        }
    };
    
    // Map elements
    let obstacles = [];
    let critters = [];

    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const dashBtn = document.getElementById('dashBtn');
    const dashCooldown = document.getElementById('dashCooldown');
    const currentBiomeElement = document.getElementById('currentBiome');
    const levelElement = document.getElementById('currentLevel');
    const timeWarpBtn = document.getElementById('timeWarpBtn');
    const magnetBtn = document.getElementById('magnetBtn');
    const timeWarpCooldownBar = document.getElementById('timeWarpCooldownBar');
    const magnetCooldownBar = document.getElementById('magnetCooldownBar');
    const powerUpSlots = document.getElementById('powerUpSlots');

    // Update high score display
    highScoreElement.textContent = highScore;

    // Initialize game
    function initGame() {
        // Load achievements from localStorage
        loadAchievements();
        
        // Reset game state
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        score = 0;
        direction = 'right';
        nextDirection = 'right';
        gameSpeed = difficultySettings[currentDifficulty].baseSpeed;
        gameOver = false;
        scoreElement.textContent = score;
        
        // Reset game variables
        obstacles = [];
        critters = [];
        toxicClouds = [];
        powerUp = null;
        activePowerUps = [];
        currentLevel = 1;
        pointsToNextLevel = 50;
        levelUpPending = false;
        
        // Reset abilities
        phaseDashActive = false;
        phaseDashCooldown = 0;
        timeWarpActive = false;
        timeWarpCooldown = 0;
        magnetActive = false;
        magnetCooldown = 0;
        shieldActive = false;
        updateDashCooldownDisplay();
        updateTimeWarpCooldownDisplay();
        updateMagnetCooldownDisplay();
        
        // Reset game stats for achievements
        gameStats = {
            gameTime: 0,
            phaseDashCount: 0,
            experiencedBiomes: [],
            collectedPowerUps: []
        };
        
        // Clear timers
        if (phaseDashTimer) clearTimeout(phaseDashTimer);
        if (timeWarpTimer) clearTimeout(timeWarpTimer);
        if (magnetTimer) clearTimeout(magnetTimer);
        if (cooldownTimer) clearTimeout(cooldownTimer);
        if (biomeChangeTimer) clearTimeout(biomeChangeTimer);
        
        // Set initial biome
        setCurrentBiome('Normal');
        
        // Schedule biome changes
        scheduleBiomeChange();
        
        // Generate obstacles based on difficulty
        generateObstacles(difficultySettings[currentDifficulty].obstacleCount);
        
        // Generate critters based on difficulty
        generateCritters(difficultySettings[currentDifficulty].critterCount);
        
        // Generate initial food
        generateFood();
        
        // Update displays
        levelElement.textContent = currentLevel;
        
        // Clear previous interval if exists
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Start game timer for achievements
        startGameTimer();
    }
    
    // Set current biome and update UI
    function setCurrentBiome(biome) {
        // Clear toxic clouds if leaving Toxic biome
        if (currentBiome === 'Toxic' && biome !== 'Toxic') {
            toxicClouds = [];
        }
        
        currentBiome = biome;
        currentBiomeElement.textContent = biome;
        
        // Apply visual effects based on biome
        switch(biome) {
            case 'Fire':
                currentBiomeElement.className = 'fire-biome';
                canvas.style.boxShadow = '0 0 15px rgba(255, 82, 82, 0.7)';
                break;
            case 'Ice':
                currentBiomeElement.className = 'ice-biome';
                canvas.style.boxShadow = '0 0 15px rgba(64, 196, 255, 0.7)';
                break;
            case 'Magnetic':
                currentBiomeElement.className = 'magnetic-biome';
                canvas.style.boxShadow = '0 0 15px rgba(255, 171, 64, 0.7)';
                break;
            case 'Toxic':
                currentBiomeElement.className = 'toxic-biome';
                canvas.style.boxShadow = '0 0 15px rgba(120, 255, 64, 0.7)';
                // Generate toxic clouds when entering Toxic biome
                generateToxicClouds(difficultySettings[currentDifficulty].obstacleCount);
                flashMessage('Watch out for toxic clouds!', '#76ff03');
                break;
            default:
                currentBiomeElement.className = '';
                canvas.style.boxShadow = '0 0 15px rgba(78, 204, 163, 0.3)';
        }
        
        // Update game speed based on biome
        updateGameSpeed();
        
        // Track biome for achievements
        if (!gameStats.experiencedBiomes.includes(biome)) {
            gameStats.experiencedBiomes.push(biome);
            checkBiomeMasterAchievement();
        }
        
        // Clear toxic clouds when leaving Toxic biome
        if (biome !== 'Toxic') {
            toxicClouds = [];
        } else {
            // Generate initial toxic clouds when entering Toxic biome
            generateToxicClouds();
        }
    }
    
    // Schedule random biome changes
    function scheduleBiomeChange() {
        // Clear existing timer if any
        if (biomeChangeTimer) clearTimeout(biomeChangeTimer);
        
        // Set random time between 15-30 seconds for next biome change
        // Shorter times for higher difficulty levels
        let minTime = 15000;
        let maxTime = 30000;
        
        if (currentDifficulty === 'Hard') {
            minTime = 10000;
            maxTime = 20000;
        } else if (currentDifficulty === 'Insane') {
            minTime = 8000;
            maxTime = 15000;
        }
        
        const changeDelay = minTime + Math.random() * (maxTime - minTime);
        
        biomeChangeTimer = setTimeout(() => {
            // Select a random biome different from current
            let newBiome;
            do {
                newBiome = biomes[Math.floor(Math.random() * biomes.length)];
            } while (newBiome === currentBiome);
            
            setCurrentBiome(newBiome);
            flashMessage(`Entering ${newBiome} Biome!`);
            scheduleBiomeChange();
        }, changeDelay);
    }
    
    // Update game speed based on score, biome, and difficulty
    function updateGameSpeed() {
        // Base speed from difficulty settings
        const baseSpeed = difficultySettings[currentDifficulty].baseSpeed;
        
        // Score speed modifier (gets faster as score increases)
        const scoreSpeedModifier = Math.max(1, Math.min(1.5, 1 + score / 200));
        
        // Apply biome modifier
        const biomeSpeedModifier = biomeEffects[currentBiome].speedModifier;
        
        // Apply time warp effect if active
        const timeWarpModifier = timeWarpActive ? 0.5 : 1;
        
        // Calculate new game speed (lower ms = faster)
        gameSpeed = Math.max(50, Math.floor(baseSpeed / (scoreSpeedModifier * biomeSpeedModifier * timeWarpModifier)));
        
        // Update interval if game is running
        if (gameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
    
    // Generate toxic clouds for Toxic biome
    function generateToxicClouds() {
        toxicClouds = [];
        const cloudCount = 3 + Math.floor(Math.random() * 3); // 3-5 clouds
        
        for (let i = 0; i < cloudCount; i++) {
            let validPosition = false;
            let cloud;
            
            // Find valid position for cloud
            while (!validPosition) {
                cloud = {
                    x: Math.floor(Math.random() * gridWidth),
                    y: Math.floor(Math.random() * gridHeight),
                    radius: 2 + Math.floor(Math.random() * 3), // 2-4 grid cells
                    alpha: 0.6 + Math.random() * 0.3 // 0.6-0.9 opacity
                };
                
                // Check if cloud is not on snake, food, obstacles, or other clouds
                validPosition = true;
                
                // Check snake
                for (let segment of snake) {
                    const distance = Math.sqrt(Math.pow(segment.x - cloud.x, 2) + Math.pow(segment.y - cloud.y, 2));
                    if (distance < cloud.radius + 1) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check food
                if (validPosition) {
                    const distance = Math.sqrt(Math.pow(food.x - cloud.x, 2) + Math.pow(food.y - cloud.y, 2));
                    if (distance < cloud.radius + 1) {
                        validPosition = false;
                    }
                }
                
                // Check obstacles
                if (validPosition) {
                    for (let obstacle of obstacles) {
                        const distance = Math.sqrt(Math.pow(obstacle.x - cloud.x, 2) + Math.pow(obstacle.y - cloud.y, 2));
                        if (distance < cloud.radius + 1) {
                            validPosition = false;
                            break;
                        }
                    }
                }
                
                // Check other clouds
                if (validPosition) {
                    for (let existingCloud of toxicClouds) {
                        const distance = Math.sqrt(Math.pow(existingCloud.x - cloud.x, 2) + Math.pow(existingCloud.y - cloud.y, 2));
                        if (distance < cloud.radius + existingCloud.radius) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            toxicClouds.push(cloud);
        }
    }
    
    // Check for Biome Master achievement
    function checkBiomeMasterAchievement() {
        const biomeAchievement = achievements.find(a => a.id === 'biome_master');
        if (!biomeAchievement.unlocked && gameStats.experiencedBiomes.length >= biomes.length) {
            biomeAchievement.unlocked = true;
            flashMessage(`Achievement Unlocked: ${biomeAchievement.name}!`);
            saveAchievements();
        }
    }
    
    // Generate obstacles
    function generateObstacles(count = null) {
        obstacles = [];
        
        // Use provided count or get from difficulty settings
        const numObstacles = count || difficultySettings[currentDifficulty].obstacleCount;
        
        for (let i = 0; i < numObstacles; i++) {
            let obstacleX, obstacleY;
            let validPosition = false;
            
            while (!validPosition) {
                obstacleX = Math.floor(Math.random() * gridWidth);
                obstacleY = Math.floor(Math.random() * gridHeight);
                
                // Ensure obstacle is not on snake or too close to start position
                validPosition = true;
                
                // Check distance from snake start position
                const distFromStart = Math.sqrt(Math.pow(obstacleX - 5, 2) + Math.pow(obstacleY - 10, 2));
                if (distFromStart < 5) {
                    validPosition = false;
                    continue;
                }
                
                // Check not on existing obstacles
                for (let obs of obstacles) {
                    if (obs.x === obstacleX && obs.y === obstacleY) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check not on food
                if (food && food.x === obstacleX && food.y === obstacleY) {
                    validPosition = false;
                    continue;
                }
            }
            
            obstacles.push({
                x: obstacleX,
                y: obstacleY,
                color: '#e63946',
                destructible: Math.random() < 0.3 // 30% chance to be destructible
            });
        }
    }
    
    // Generate AI critters
    function generateCritters(count = null) {
        critters = [];
        
        // Use provided count or get from difficulty settings
        const numCritters = count || difficultySettings[currentDifficulty].critterCount;
        
        for (let i = 0; i < numCritters; i++) {
            let critterX, critterY;
            let validPosition = false;
            
            while (!validPosition) {
                critterX = Math.floor(Math.random() * gridWidth);
                critterY = Math.floor(Math.random() * gridHeight);
                
                // Ensure critter is not on snake, obstacles, or other critters
                validPosition = true;
                
                // Check not on snake
                for (let segment of snake) {
                    if (segment.x === critterX && segment.y === critterY) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check not on obstacles
                for (let obs of obstacles) {
                    if (obs.x === critterX && obs.y === critterY) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check not on other critters
                for (let critter of critters) {
                    if (critter.x === critterX && critter.y === critterY) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check not on food
                if (food && food.x === critterX && food.y === critterY) {
                    validPosition = false;
                    continue;
                }
                
                // Check not in toxic clouds
                if (currentBiome === 'Toxic') {
                    for (let cloud of toxicClouds) {
                        const distance = Math.sqrt(Math.pow(critterX - cloud.x, 2) + Math.pow(critterY - cloud.y, 2));
                        if (distance < cloud.radius) {
                            validPosition = false;
                            break;
                        }
                    }
                }
            }
            
            critters.push({
                x: critterX,
                y: critterY,
                direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
                color: '#4cc9f0',
                moveCounter: 0,
                // Add different critter types with varying behaviors
                type: ['normal', 'hunter', 'scared'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    // Move critters randomly
    function moveCritters() {
        for (let critter of critters) {
            critter.moveCounter++;
            
            // Move every few frames
            if (critter.moveCounter >= 3) {
                critter.moveCounter = 0;
                
                // Occasionally change direction
                if (Math.random() < 0.2) {
                    critter.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
                }
                
                // Try to move towards food sometimes
                if (Math.random() < 0.3) {
                    if (food.x < critter.x) critter.direction = 'left';
                    else if (food.x > critter.x) critter.direction = 'right';
                    else if (food.y < critter.y) critter.direction = 'up';
                    else if (food.y > critter.y) critter.direction = 'down';
                }
                
                // Move in current direction
                const newPos = { x: critter.x, y: critter.y };
                
                switch (critter.direction) {
                    case 'up': newPos.y -= 1; break;
                    case 'down': newPos.y += 1; break;
                    case 'left': newPos.x -= 1; break;
                    case 'right': newPos.x += 1; break;
                }
                
                // Check boundaries and obstacles
                if (newPos.x >= 0 && newPos.x < gridWidth && 
                    newPos.y >= 0 && newPos.y < gridHeight) {
                    
                    // Check not moving onto obstacle
                    let obstacleCollision = false;
                    for (let obs of obstacles) {
                        if (obs.x === newPos.x && obs.y === newPos.y) {
                            obstacleCollision = true;
                            break;
                        }
                    }
                    
                    // Check not moving onto snake
                    let snakeCollision = false;
                    for (let segment of snake) {
                        if (segment.x === newPos.x && segment.y === newPos.y) {
                            snakeCollision = true;
                            break;
                        }
                    }
                    
                    // Check not moving onto other critters
                    let critterCollision = false;
                    for (let otherCritter of critters) {
                        if (otherCritter !== critter && otherCritter.x === newPos.x && otherCritter.y === newPos.y) {
                            critterCollision = true;
                            break;
                        }
                    }
                    
                    // Check not moving into toxic cloud
                    let toxicCloudCollision = false;
                    if (currentBiome === 'Toxic') {
                        toxicCloudCollision = isInToxicCloud(newPos.x, newPos.y);
                    }
                    
                    if (!obstacleCollision && !snakeCollision && !critterCollision && !toxicCloudCollision) {
                        critter.x = newPos.x;
                        critter.y = newPos.y;
                    } else {
                        // Change direction if blocked
                        critter.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
                    }
                } else {
                    // Change direction if at boundary
                    critter.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
                }
                
                // Check if critter ate food
                if (critter.x === food.x && critter.y === food.y) {
                    generateFood();
                }
            }
        }
    }

    // Generate food at random position
    function generateFood() {
        // Generate random coordinates
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * gridWidth);
            foodY = Math.floor(Math.random() * gridHeight);
            
            // Check if food is not on snake, obstacles, critters, or toxic clouds
            validPosition = true;
            
            // Check not on snake
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            if (!validPosition) continue;
            
            // Check not on obstacles
            for (let obstacle of obstacles) {
                if (obstacle.x === foodX && obstacle.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            if (!validPosition) continue;
            
            // Check not on critters
            for (let critter of critters) {
                if (critter.x === foodX && critter.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            if (!validPosition) continue;
            
            // Check not in toxic cloud
            if (currentBiome === 'Toxic' && isInToxicCloud(foodX, foodY)) {
                validPosition = false;
                continue;
            }
        }
        
        // Determine if food is special based on difficulty settings
        const specialFoodChance = difficultySettings[currentDifficulty].specialFoodChance || 0.2;
        
        food = {
            x: foodX,
            y: foodY,
            color: getRandomFoodColor(),
            type: Math.random() < specialFoodChance ? 'special' : 'normal'
        };
        
        // In Toxic biome, special food has additional effects
        if (currentBiome === 'Toxic' && food.type === 'special') {
            food.color = '#76ff03'; // Bright toxic green for special food in Toxic biome
        }
    }

    // Get random color for food
    function getRandomFoodColor() {
        const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Draw everything on canvas
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw biome effects
        drawBiomeEffects();
        
        // Draw obstacles
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
            
            // Add detail to obstacles
            ctx.fillStyle = '#c1121f';
            ctx.fillRect(obstacle.x * gridSize + 5, obstacle.y * gridSize + 5, gridSize - 10, gridSize - 10);
        });
        
        // Draw critters
        critters.forEach(critter => {
            ctx.fillStyle = critter.color;
            ctx.beginPath();
            ctx.arc(
                critter.x * gridSize + gridSize / 2,
                critter.y * gridSize + gridSize / 2,
                gridSize / 2.5,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Add eyes to critters
            ctx.fillStyle = 'white';
            
            // Position eyes based on direction
            if (critter.direction === 'right' || critter.direction === 'left') {
                const eyeX = critter.direction === 'right' ? critter.x * gridSize + gridSize * 0.7 : critter.x * gridSize + gridSize * 0.3;
                ctx.beginPath();
                ctx.arc(eyeX, critter.y * gridSize + gridSize * 0.4, gridSize * 0.1, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const eyeY = critter.direction === 'down' ? critter.y * gridSize + gridSize * 0.7 : critter.y * gridSize + gridSize * 0.3;
                ctx.beginPath();
                ctx.arc(critter.x * gridSize + gridSize * 0.4, eyeY, gridSize * 0.1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Apply phase dash effect
            if (phaseDashActive) {
                ctx.globalAlpha = 0.5;
            }
            
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4ecca3';
            } else {
                // Gradient color for body based on biome
                let segmentColor;
                switch(currentBiome) {
                    case 'Fire':
                        const redValue = Math.floor(255 - (index * 5));
                        segmentColor = `rgb(${Math.max(redValue, 150)}, ${Math.max(50, 100 - index * 3)}, 50)`;
                        break;
                    case 'Ice':
                        const blueValue = Math.floor(255 - (index * 5));
                        segmentColor = `rgb(100, 200, ${Math.max(blueValue, 150)})`;
                        break;
                    case 'Magnetic':
                        const orangeValue = Math.floor(255 - (index * 5));
                        segmentColor = `rgb(${Math.max(orangeValue, 150)}, ${Math.max(100, 150 - index * 3)}, 50)`;
                        break;
                    default:
                        const greenValue = Math.floor(200 - (index * 3));
                        segmentColor = `rgb(0, ${Math.max(greenValue, 100)}, ${Math.max(100, 150 - index * 5)})`;
                }
                ctx.fillStyle = segmentColor;
            }
            
            // Draw rounded rectangle for segments
            roundedRect(
                segment.x * gridSize, 
                segment.y * gridSize, 
                gridSize, 
                gridSize, 
                index === 0 ? 8 : 4 // Head has more rounded corners
            );
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
            
            // Add eyes to the head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                // Position eyes based on direction
                if (direction === 'right' || direction === 'left') {
                    const eyeX = direction === 'right' ? segment.x * gridSize + gridSize * 0.75 : segment.x * gridSize + gridSize * 0.25;
                    ctx.beginPath();
                    ctx.arc(eyeX, segment.y * gridSize + gridSize * 0.3, gridSize * 0.15, 0, Math.PI * 2);
                    ctx.arc(eyeX, segment.y * gridSize + gridSize * 0.7, gridSize * 0.15, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Pupils
                    ctx.fillStyle = 'black';
                    ctx.beginPath();
                    ctx.arc(eyeX + (direction === 'right' ? 1 : -1) * gridSize * 0.05, 
                             segment.y * gridSize + gridSize * 0.3, 
                             gridSize * 0.07, 0, Math.PI * 2);
                    ctx.arc(eyeX + (direction === 'right' ? 1 : -1) * gridSize * 0.05, 
                             segment.y * gridSize + gridSize * 0.7, 
                             gridSize * 0.07, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const eyeY = direction === 'down' ? segment.y * gridSize + gridSize * 0.75 : segment.y * gridSize + gridSize * 0.25;
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize * 0.3, eyeY, gridSize * 0.15, 0, Math.PI * 2);
                    ctx.arc(segment.x * gridSize + gridSize * 0.7, eyeY, gridSize * 0.15, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Pupils
                    ctx.fillStyle = 'black';
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize * 0.3, 
                             eyeY + (direction === 'down' ? 1 : -1) * gridSize * 0.05, 
                             gridSize * 0.07, 0, Math.PI * 2);
                    ctx.arc(segment.x * gridSize + gridSize * 0.7, 
                             eyeY + (direction === 'down' ? 1 : -1) * gridSize * 0.05, 
                             gridSize * 0.07, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
        
        // Draw food with glow effect
        ctx.shadowColor = food.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = food.color;
        
        if (food.type === 'special') {
            // Star shape for special food
            drawStar(
                food.x * gridSize + gridSize / 2,
                food.y * gridSize + gridSize / 2,
                5,  // 5 points
                gridSize / 2,
                gridSize / 4
            );
        } else {
            // Regular circle for normal food
            ctx.beginPath();
            ctx.arc(
                food.x * gridSize + gridSize / 2,
                food.y * gridSize + gridSize / 2,
                gridSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        
        // Draw magnetic attraction effect if in magnetic biome
        if (currentBiome === 'Magnetic' && !gameOver) {
            ctx.strokeStyle = 'rgba(255, 171, 64, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(snake[0].x * gridSize + gridSize/2, snake[0].y * gridSize + gridSize/2);
            ctx.lineTo(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);
            ctx.stroke();
        }
        
        // Draw game over message
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
            
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Press Start to play again', canvas.width / 2, canvas.height / 2 + 50);
        }
    }

    // Helper function to draw a rounded rectangle
    function roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    // Helper function to draw a star
    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw biome effects
    function drawBiomeEffects() {
        switch(currentBiome) {
            case 'Fire':
                // Draw fire particles
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = 1 + Math.random() * 3;
                    
                    ctx.fillStyle = `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 50, ${Math.random() * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'Ice':
                // Draw ice crystals
                for (let i = 0; i < 15; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = 2 + Math.random() * 4;
                    
                    ctx.fillStyle = `rgba(200, 240, 255, ${Math.random() * 0.2})`;
                    ctx.beginPath();
                    ctx.moveTo(x, y - size);
                    ctx.lineTo(x + size, y);
                    ctx.lineTo(x, y + size);
                    ctx.lineTo(x - size, y);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'Magnetic':
                // Draw magnetic field lines
                for (let i = 0; i < 10; i++) {
                    const startX = Math.random() * canvas.width;
                    const startY = Math.random() * canvas.height;
                    const length = 30 + Math.random() * 50;
                    const angle = Math.random() * Math.PI * 2;
                    
                    ctx.strokeStyle = `rgba(255, 171, 64, ${Math.random() * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
                    ctx.stroke();
                }
                break;
                
            case 'Toxic':
                // Draw toxic mist background effect
                for (let i = 0; i < 15; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = 5 + Math.random() * 10;
                    
                    ctx.fillStyle = `rgba(${Math.random() * 50 + 100}, 255, ${Math.random() * 50}, ${Math.random() * 0.15})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw toxic clouds
                for (let cloud of toxicClouds) {
                    const gradient = ctx.createRadialGradient(
                        cloud.x * gridSize + gridSize / 2,
                        cloud.y * gridSize + gridSize / 2,
                        0,
                        cloud.x * gridSize + gridSize / 2,
                        cloud.y * gridSize + gridSize / 2,
                        cloud.radius * gridSize
                    );
                    
                    gradient.addColorStop(0, 'rgba(120, 255, 80, 0.7)');
                    gradient.addColorStop(0.6, 'rgba(100, 220, 50, 0.4)');
                    gradient.addColorStop(1, 'rgba(80, 180, 30, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(
                        cloud.x * gridSize + gridSize / 2,
                        cloud.y * gridSize + gridSize / 2,
                        cloud.radius * gridSize,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    
                    // Pulsating effect
                    cloud.radius += Math.sin(Date.now() / 500) * 0.01;
                    cloud.radius = Math.max(1, Math.min(cloud.radius, 3));
                }
                break;
        }
    }
    
    // Generate toxic clouds for the Toxic biome
    function generateToxicClouds(count = 5) {
        toxicClouds = [];
        let attempts = 0;
        const maxAttempts = 100;
        
        while (toxicClouds.length < count && attempts < maxAttempts) {
            attempts++;
            
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * gridHeight);
            const radius = 1.5 + Math.random() * 1.5; // Random radius between 1.5 and 3
            
            // Check if position is valid (not on snake, food, obstacles, or other clouds)
            if (isValidPosition(x, y, radius)) {
                toxicClouds.push({ x, y, radius });
            }
        }
    }
    
    // Check if a position is valid for placing a toxic cloud
    function isValidPosition(x, y, radius) {
        // Check if position overlaps with snake
        for (let segment of snake) {
            const distance = Math.sqrt(Math.pow(segment.x - x, 2) + Math.pow(segment.y - y, 2));
            if (distance < radius) return false;
        }
        
        // Check if position overlaps with food
        const foodDistance = Math.sqrt(Math.pow(food.x - x, 2) + Math.pow(food.y - y, 2));
        if (foodDistance < radius) return false;
        
        // Check if position overlaps with obstacles
        for (let obstacle of obstacles) {
            const obstacleDistance = Math.sqrt(Math.pow(obstacle.x - x, 2) + Math.pow(obstacle.y - y, 2));
            if (obstacleDistance < radius) return false;
        }
        
        // Check if position overlaps with other clouds
        for (let cloud of toxicClouds) {
            const cloudDistance = Math.sqrt(Math.pow(cloud.x - x, 2) + Math.pow(cloud.y - y, 2));
            if (cloudDistance < (radius + cloud.radius)) return false;
        }
        
        return true;
    }
    
    // Check if a position is inside a toxic cloud
    function isInToxicCloud(x, y) {
        for (let cloud of toxicClouds) {
            const distance = Math.sqrt(Math.pow(cloud.x - x, 2) + Math.pow(cloud.y - y, 2));
            if (distance < cloud.radius * 0.8) { // Using 80% of radius for collision to make it a bit forgiving
                return true;
            }
        }
        return false;
    }
    
    // Update game state
    function update() {
        if (gameOver) return;
        
        // Move critters
        moveCritters();
        
        // Update direction with turn delay for Ice biome
        if (currentBiome !== 'Ice' || !biomeEffects[currentBiome].turnDelay || 
            Date.now() % biomeEffects[currentBiome].turnDelay < gameSpeed) {
            direction = nextDirection;
        }
        
        // Create new head based on current direction
        const head = {...snake[0]};
        
        // Apply magnetic biome effect - attraction towards food
        if (currentBiome === 'Magnetic' && Math.random() < biomeEffects[currentBiome].foodAttractionForce) {
            // Determine if we should move towards food
            if (food.x < head.x && direction !== 'right') direction = 'left';
            else if (food.x > head.x && direction !== 'left') direction = 'right';
            else if (food.y < head.y && direction !== 'down') direction = 'up';
            else if (food.y > head.y && direction !== 'up') direction = 'down';
        }
        
        // Apply toxic biome effect - repulsion from food
        if (currentBiome === 'Toxic' && Math.random() < biomeEffects[currentBiome].foodRepulsionForce) {
            // Determine if we should move away from food
            if (food.x < head.x && direction !== 'left') direction = 'right';
            else if (food.x > head.x && direction !== 'right') direction = 'left';
            else if (food.y < head.y && direction !== 'up') direction = 'down';
            else if (food.y > head.y && direction !== 'down') direction = 'up';
        }
        
        // Move in current direction
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for collisions
        if (
            // Wall collision
            head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight ||
            // Self collision (only if phase dash is not active)
            (!phaseDashActive && snake.some(segment => segment.x === head.x && segment.y === head.y)) ||
            // Obstacle collision (only if phase dash is not active)
            (!phaseDashActive && obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) ||
            // Toxic cloud collision (only if phase dash is not active and shield is not active)
            (!phaseDashActive && !shieldActive && currentBiome === 'Toxic' && isInToxicCloud(head.x, head.y))
        ) {
            handleGameOver();
            return;
        }
        
        // Check for critter collision
        const critterCollision = critters.findIndex(critter => critter.x === head.x && critter.y === head.y);
        if (critterCollision !== -1) {
            // Remove the critter
            critters.splice(critterCollision, 1);
            
            // Add points
            score += 5;
            scoreElement.textContent = score;
            
            // Generate a new critter
            setTimeout(() => {
                if (gameRunning && !gameOver) {
                    generateCritters();
                }
            }, 5000); // Respawn after 5 seconds
        }
        
        // Add new head to snake
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score based on food type and difficulty
            const scoreMultiplier = difficultySettings[currentDifficulty].scoreMultiplier || 1;
            
            if (food.type === 'special') {
                score += Math.floor(25 * scoreMultiplier); // Special food worth more points
                
                // Special food effects based on biome
                if (currentBiome === 'Toxic') {
                    // Toxic biome special food effects
                    const toxicEffect = Math.random();
                    
                    if (toxicEffect < 0.33) {
                        // Clear all toxic clouds
                        toxicClouds = [];
                        flashMessage('Toxic Clouds Cleared!', '#76ff03');
                    } else if (toxicEffect < 0.66) {
                        // Temporary immunity to toxic clouds
                        shieldActive = true;
                        setTimeout(() => {
                            shieldActive = false;
                        }, 10000); // 10 seconds of immunity
                        flashMessage('Toxic Shield Activated!', '#76ff03');
                    } else {
                        // Reset all ability cooldowns
                        phaseDashCooldown = 0;
                        timeWarpCooldown = 0;
                        magnetCooldown = 0;
                        updateDashCooldownDisplay();
                        flashMessage('All Abilities Ready!', '#76ff03');
                    }
                } else {
                    // Normal special food effects
                    const effect = Math.random();
                    
                    if (effect < 0.33) {
                        // Reset phase dash cooldown
                        phaseDashCooldown = 0;
                        updateDashCooldownDisplay();
                        flashMessage('Phase Dash Ready!', '#4361ee');
                    } else if (effect < 0.66) {
                        // Temporary invincibility
                        activatePhaseDash();
                        flashMessage('Temporary Invincibility!', '#4361ee');
                    } else {
                        // Clear obstacles
                        obstacles = [];
                        flashMessage('Obstacles Cleared!', '#4361ee');
                    }
                }
            } else {
                score += Math.floor(10 * scoreMultiplier); // Normal food
            }
            
            scoreElement.textContent = score;
            
            // Check for level up
            checkLevelUp();
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Generate new food
            generateFood();
            
            // Update game speed
            updateGameSpeed();
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
        
        // Update dash cooldown
        if (phaseDashCooldown > 0) {
            phaseDashCooldown = Math.max(0, phaseDashCooldown - gameSpeed);
            updateDashCooldownDisplay();
        }
    }

    // Game loop
    function gameLoop() {
        update();
        draw();
    }

    // Handle game over
    function handleGameOver() {
        gameOver = true;
        gameRunning = false;
        clearInterval(gameInterval);
        startBtn.textContent = 'Start Game';
        draw(); // Draw final state with game over message
    }
    
    // Check if player has earned enough points to level up
    function checkLevelUp() {
        if (score >= pointsToNextLevel && !levelUpPending) {
            levelUpPending = true;
            currentLevel++;
            levelElement.textContent = currentLevel;
            
            // Pause the game
            const wasRunning = gameRunning;
            if (gameRunning) {
                clearInterval(gameInterval);
                gameRunning = false;
            }
            
            // Show level up screen with options
            showLevelUpScreen(wasRunning);
            
            // Check for level achievement
            if (currentLevel >= 10 && !achievements.find(a => a.id === 'speed_demon').unlocked) {
                achievements.find(a => a.id === 'speed_demon').unlocked = true;
                flashMessage('Achievement Unlocked: Speed Demon!', '#ffd700');
                saveAchievements();
            }
            
            // Set new threshold for next level
            pointsToNextLevel += Math.floor(50 * (1 + currentLevel * 0.5));
        }
    }
    
    // Show level up screen with power-up options
    function showLevelUpScreen(resumeGameAfter) {
        // Update level display
        document.getElementById('newLevel').textContent = currentLevel;
        
        // Generate biome-specific power-up options
        const powerUpOptions = [];
        
        // Default options
        powerUpOptions.push({
            name: 'Speed Boost',
            icon: 'fa-bolt',
            description: 'Temporary speed increase',
            effect: () => {
                // Temporarily boost speed
                const originalSpeed = gameSpeed;
                gameSpeed = Math.max(50, Math.floor(gameSpeed * 0.7)); // 30% faster
                setTimeout(() => {
                    gameSpeed = originalSpeed;
                    updateGameSpeed();
                }, 10000); // 10 seconds
                flashMessage('Speed Boost Activated!', '#f5d442');
            }
        });
        
        powerUpOptions.push({
            name: 'Extra Growth',
            icon: 'fa-arrow-up',
            description: 'Instantly grow longer',
            effect: () => {
                // Add 3 segments to the snake
                const tail = snake[snake.length - 1];
                for (let i = 0; i < 3; i++) {
                    snake.push({x: tail.x, y: tail.y});
                }
                flashMessage('Extra Growth Activated!', '#42f57b');
            }
        });
        
        // Biome-specific option
        if (currentBiome === 'Fire') {
            powerUpOptions.push({
                name: 'Fire Resistance',
                icon: 'fa-fire-extinguisher',
                description: 'Temporary immunity to fire',
                effect: () => {
                    // Implement fire resistance
                    shieldActive = true;
                    setTimeout(() => {
                        shieldActive = false;
                    }, 15000); // 15 seconds
                    flashMessage('Fire Resistance Activated!', '#e63946');
                }
            });
        } else if (currentBiome === 'Ice') {
            powerUpOptions.push({
                name: 'Ice Melter',
                icon: 'fa-sun',
                description: 'Temporarily remove turn delay',
                effect: () => {
                    // Store original turn delay and remove it temporarily
                    const originalTurnDelay = biomeEffects['Ice'].turnDelay;
                    biomeEffects['Ice'].turnDelay = 0;
                    setTimeout(() => {
                        biomeEffects['Ice'].turnDelay = originalTurnDelay;
                    }, 20000); // 20 seconds
                    flashMessage('Ice Melter Activated!', '#90e0ef');
                }
            });
        } else if (currentBiome === 'Magnetic') {
            powerUpOptions.push({
                name: 'Magnetic Control',
                icon: 'fa-magnet',
                description: 'Control magnetic attraction',
                effect: () => {
                    // Temporarily enhance magnetic control
                    const originalForce = biomeEffects['Magnetic'].foodAttractionForce;
                    biomeEffects['Magnetic'].foodAttractionForce = 0.6; // Double attraction
                    setTimeout(() => {
                        biomeEffects['Magnetic'].foodAttractionForce = originalForce;
                    }, 15000); // 15 seconds
                    flashMessage('Magnetic Control Enhanced!', '#3a86ff');
                }
            });
        } else if (currentBiome === 'Toxic') {
            // Add two options for Toxic biome
            powerUpOptions.push({
                name: 'Toxin Immunity',
                icon: 'fa-skull-crossbones',
                description: 'Temporary immunity to toxic clouds',
                effect: () => {
                    // Implement toxic cloud immunity
                    shieldActive = true;
                    setTimeout(() => {
                        shieldActive = false;
                    }, 20000); // 20 seconds
                    flashMessage('Toxin Immunity Activated!', '#76ff03');
                }
            });
            
            powerUpOptions.push({
                name: 'Cloud Dissipator',
                icon: 'fa-wind',
                description: 'Clear all toxic clouds',
                effect: () => {
                    // Clear all toxic clouds
                    toxicClouds = [];
                    flashMessage('Toxic Clouds Cleared!', '#76ff03');
                }
            });
            
            powerUpOptions.push({
                name: 'Toxic Mastery',
                icon: 'fa-biohazard',
                description: 'Temporarily disable food repulsion',
                effect: () => {
                    // Store original repulsion force and disable it temporarily
                    const originalRepulsion = biomeEffects['Toxic'].foodRepulsionForce;
                    biomeEffects['Toxic'].foodRepulsionForce = 0;
                    setTimeout(() => {
                        biomeEffects['Toxic'].foodRepulsionForce = originalRepulsion;
                    }, 15000); // 15 seconds
                    flashMessage('Toxic Mastery Activated!', '#76ff03');
                }
            });
        } else {
            // Normal biome option
            powerUpOptions.push({
                name: 'Score Boost',
                icon: 'fa-star',
                description: 'Instant score bonus',
                effect: () => {
                    // Add bonus points
                    score += 25;
                    scoreElement.textContent = score;
                    flashMessage('Score Boost: +25 Points!', '#ffd700');
                }
            });
        }
        
        // Randomly select 3 options from the available ones
        const selectedOptions = [];
        while (selectedOptions.length < 3 && powerUpOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * powerUpOptions.length);
            selectedOptions.push(powerUpOptions.splice(randomIndex, 1)[0]);
        }
        
        // Display the options
        const optionElements = document.querySelectorAll('.power-up-option');
        selectedOptions.forEach((option, index) => {
            if (optionElements[index]) {
                const optionElement = optionElements[index];
                optionElement.querySelector('i').className = `fas ${option.icon}`;
                optionElement.querySelector('p').textContent = option.name;
                
                // Add click event
                optionElement.onclick = () => {
                    // Apply the effect
                    option.effect();
                    
                    // Hide level up screen
                    document.getElementById('levelUpScreen').style.display = 'none';
                    
                    // Resume game if it was running
                    if (resumeGameAfter) {
                        gameRunning = true;
                        gameInterval = setInterval(gameLoop, gameSpeed);
                    }
                    
                    // Reset level up pending flag
                    levelUpPending = false;
                };
            }
        });
        
        // Show the level up screen
        document.getElementById('levelUpScreen').style.display = 'flex';
    }

    // Display a flash message
    // Save achievements to localStorage
    function saveAchievements() {
        localStorage.setItem('snakeAchievements', JSON.stringify(achievements));
    }
    
    // Load achievements from localStorage
    function loadAchievements() {
        const savedAchievements = localStorage.getItem('snakeAchievements');
        if (savedAchievements) {
            const loadedAchievements = JSON.parse(savedAchievements);
            // Merge loaded achievements with default ones
            for (const key in loadedAchievements) {
                if (achievements.hasOwnProperty(key)) {
                    achievements[key] = loadedAchievements[key];
                }
            }
        }
    }
    
    function flashMessage(message, color) {
        const flashDiv = document.createElement('div');
        flashDiv.textContent = message;
        flashDiv.style.position = 'absolute';
        flashDiv.style.top = '50%';
        flashDiv.style.left = '50%';
        flashDiv.style.transform = 'translate(-50%, -50%)';
        flashDiv.style.backgroundColor = color;
        flashDiv.style.color = 'white';
        flashDiv.style.padding = '10px 20px';
        flashDiv.style.borderRadius = '5px';
        flashDiv.style.fontWeight = 'bold';
        flashDiv.style.zIndex = '1000';
        flashDiv.style.opacity = '0';
        flashDiv.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(flashDiv);
        
        // Fade in
        setTimeout(() => {
            flashDiv.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            flashDiv.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flashDiv);
            }, 300);
        }, 1500);
    }
    
    // Update dash cooldown display
    function updateDashCooldownDisplay() {
        const percentage = (phaseDashMaxCooldown - phaseDashCooldown) / phaseDashMaxCooldown * 100;
        dashCooldown.style.width = `${percentage}%`;
        
        // Change color based on availability
        if (percentage >= 100) {
            dashCooldown.style.background = 'linear-gradient(90deg, #4361ee, #3a0ca3)';
            dashBtn.disabled = false;
        } else {
            dashCooldown.style.background = 'linear-gradient(90deg, #6c757d, #495057)';
            dashBtn.disabled = true;
        }
    }
    
    // Activate phase dash ability
    function activatePhaseDash() {
        if (phaseDashCooldown > 0 || phaseDashActive) return;
        
        phaseDashActive = true;
        dashBtn.classList.add('active');
        
        // Visual effect for activation
        canvas.style.boxShadow = '0 0 20px rgba(67, 97, 238, 0.7)';
        
        // Set timer to deactivate
        phaseDashTimer = setTimeout(() => {
            phaseDashActive = false;
            dashBtn.classList.remove('active');
            canvas.style.boxShadow = '0 0 15px rgba(78, 204, 163, 0.3)';
            
            // Start cooldown
            phaseDashCooldown = phaseDashMaxCooldown;
            updateDashCooldownDisplay();
            
            // Restore biome visual effect
            setCurrentBiome(currentBiome);
        }, phaseDashDuration);
    }
    
    // Start game
    function startGame() {
        if (!gameRunning) {
            initGame();
            gameInterval = setInterval(gameLoop, gameSpeed);
            gameRunning = true;
            startBtn.textContent = 'Pause';
        } else {
            // Pause game
            clearInterval(gameInterval);
            gameRunning = false;
            startBtn.textContent = 'Resume';
            
            // Draw paused message
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        }
    }

    // Reset game
    function resetGame() {
        initGame();
        draw();
        if (gameRunning) {
            clearInterval(gameInterval);
            gameRunning = false;
            startBtn.textContent = 'Start Game';
        }
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    dashBtn.addEventListener('click', activatePhaseDash);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent default behavior for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        // Update direction based on key press
        // Prevent 180-degree turns
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
            // Space bar for phase dash or start/pause
            case ' ':
                if (gameRunning) {
                    activatePhaseDash();
                } else {
                    startGame();
                }
                break;
        }
    });

    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling when touching the canvas
    }, false);

    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning && !gameOver) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (deltaX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // Vertical swipe
            if (deltaY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (deltaY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        e.preventDefault();
    }, false);

    // Initialize game on load
    initGame();
    draw();
});
