* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Arial, sans-serif;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #0a0a1a;
    color: #fff;
    overflow-x: hidden;
}

.game-container {
    background-color: #1a1a2e;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    padding: 20px;
    max-width: 500px;
    width: 100%;
    border: 1px solid #4ecca3;
    position: relative;
}

.game-header {
    text-align: center;
    margin-bottom: 20px;
}

.game-stats {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin-top: 10px;
}

h1 {
    color: #4ecca3;
    margin-bottom: 10px;
    text-shadow: 0 0 10px rgba(78, 204, 163, 0.5);
    font-weight: bold;
    letter-spacing: 1px;
}

.score-container, .high-score-container, .current-biome {
    font-size: 18px;
    margin: 5px 0;
    color: #e2e2e2;
}

#gameCanvas {
    display: block;
    background-color: #16213e;
    margin: 0 auto;
    border-radius: 5px;
    border: 2px solid #4ecca3;
    box-shadow: 0 0 15px rgba(78, 204, 163, 0.3);
    z-index: 1;
}

/* Controls and Buttons */
.controls {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 20px 0;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #232931;
    color: #eeeeee;
    border: 1px solid #4ecca3;
    margin: 0 5px;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 204, 163, 0.4);
}

#startBtn {
    background-color: #0f3460;
    color: white;
}

#startBtn:hover {
    background-color: #16213e;
}

#resetBtn {
    background-color: #950740;
    color: white;
}

#resetBtn:hover {
    background-color: #6f2232;
}

#dashBtn {
    background-color: #3a0ca3;
    color: white;
    position: relative;
    overflow: hidden;
}

#dashBtn:hover {
    background-color: #4361ee;
}

#dashBtn::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
}

#dashBtn:hover::after {
    left: 100%;
}

/* Menu Styles */
.menu-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(15, 52, 96, 0.95);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 10px;
    display: none;
}

.menu-container h2 {
    color: #4ecca3;
    font-size: 28px;
    margin-bottom: 30px;
    text-shadow: 0 0 10px rgba(78, 204, 163, 0.7);
}

.menu-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 80%;
    max-width: 300px;
}

.menu-btn {
    background-color: #16213e;
    color: #eeeeee;
    border: 2px solid #4ecca3;
    border-radius: 5px;
    padding: 12px 20px;
    font-size: 18px;
    transition: all 0.3s ease;
    text-align: center;
}

.menu-btn:hover {
    background-color: #4ecca3;
    color: #16213e;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 204, 163, 0.4);
}

.back-btn {
    margin-top: 20px;
    background-color: #16213e;
    border-color: #ff5252;
}

.back-btn:hover {
    background-color: #ff5252;
    color: #16213e;
}

/* Abilities */
#gameUI {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.abilities-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
    flex-wrap: wrap;
}

.ability {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.ability-cooldown {
    margin: 15px auto;
    width: 80%;
}

.cooldown-bar-container {
    width: 100%;
    height: 10px;
    background-color: #232931;
    border-radius: 5px;
    overflow: hidden;
}

.cooldown-bar {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #4361ee, #3a0ca3);
    border-radius: 5px;
    transition: width 0.1s linear;
}

/* Power-ups */
.power-ups-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
}

.power-up-slot {
    width: 40px;
    height: 40px;
    background-color: #0f3460;
    border: 2px solid #4ecca3;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #888888;
    font-size: 20px;
    transition: all 0.3s ease;
}

/* Instructions */
.instructions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #4ecca3;
}

.instructions h2 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #4ecca3;
}

.instructions p {
    margin: 5px 0;
    color: #e2e2e2;
    font-size: 14px;
}

.instructions ul {
    margin-left: 20px;
    margin-top: 5px;
}

.instructions li {
    margin: 5px 0;
    color: #e2e2e2;
    font-size: 14px;
}

.instructions-section {
    margin-top: 15px;
    border-top: 1px solid rgba(78, 204, 163, 0.3);
    padding-top: 10px;
}

.instructions-section h3 {
    color: #4ecca3;
    margin: 0 0 10px 0;
    font-size: 18px;
}

/* Biome Colors */
.fire-biome {
    color: #ff5252;
    font-weight: bold;
}

.ice-biome {
    color: #40c4ff;
    font-weight: bold;
}

.magnetic-biome {
    color: #ffab40;
    font-weight: bold;
}

.toxic-biome {
    color: #76ff03;
    font-weight: bold;
}

/* Ability and Power-up Names */
.ability-name {
    color: #e94560;
    font-weight: bold;
}

.power-name {
    color: gold;
    font-weight: bold;
}

.mode-name {
    color: #4ecca3;
    font-weight: bold;
}

/* Flash Messages */
.flash-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(22, 33, 62, 0.8);
    color: #4ecca3;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 20px;
    font-weight: bold;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    text-shadow: 0 0 10px rgba(78, 204, 163, 0.7);
}

.flash-message.show {
    opacity: 1;
    animation: fadeInOut 2s ease forwards;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    20% { transform: translate(-50%, -50%) scale(1); }
    80% { opacity: 1; }
    100% { opacity: 0; }
}

/* Responsive Design */
@media (max-width: 768px) {
    .game-container {
        padding: 15px;
        max-width: 95%;
    }
    
    .game-header h1 {
        font-size: 24px;
    }
    
    .controls {
        flex-direction: column;
        align-items: center;
    }
    
    button {
        width: 100%;
        max-width: 200px;
    }
}

@media (max-width: 500px) {
    .game-container {
        padding: 10px;
    }
    
    #gameCanvas {
        width: 100%;
        height: auto;
    }
}
