// spaceinvaders.js

function startSpaceInvadersGame() {
    const canvas = document.getElementById('spaceInvadersCanvas');
    canvas.width = 800;
    canvas.height = 400;
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    canvas.style.touchAction = 'none';

    const ctx = canvas.getContext('2d');

    // Player Object
    const player = {
        width: 40,
        height: 20,
        x: canvas.width / 2 - 20,
        y: canvas.height - 50,
        speed: 5,
        dx: 0,
        doubleBullets: false,
        shield: false,
        lives: 3
    };

    const bullets = [];
    const enemyBullets = [];
    const enemies = [];
    const bosses = [];
    const powerUps = [];
    let currentLevel = 1;
    const maxLevels = 5;
    let score = 0;
    let gameOver = false;

    // Starfield for Background
    const stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * 0.5 + 0.5
        });
    }

    // Enemy Configuration
    const enemyConfig = {
        rows: 3,
        cols: 7,
        width: 30,
        height: 20,
        margin: 20,
        speed: 2
    };

    // Boss Configuration
    const bossConfig = {
        width: 80,
        height: 40,
        speed: 1.5,
        health: 100
    };

    // Power-Up Types
    const powerUpTypes = ['double-bullets', 'shield', 'extra-life'];

    // Initialize Enemies for Current Level
    function createEnemies() {
        enemies.length = 0; // Clear existing enemies
        for (let row = 0; row < enemyConfig.rows; row++) {
            for (let col = 0; col < enemyConfig.cols; col++) {
                const enemy = {
                    x: 50 + col * (enemyConfig.width + enemyConfig.margin),
                    y: 50 + row * (enemyConfig.height + enemyConfig.margin),
                    width: enemyConfig.width,
                    height: enemyConfig.height,
                    dx: enemyConfig.speed,
                    dy: 0,
                    isBoss: false,
                    health: 20
                };
                enemies.push(enemy);
            }
        }
    }

    // Initialize Boss for Specific Levels
    function createBoss() {
        const boss = {
            x: canvas.width / 2 - bossConfig.width / 2,
            y: 30,
            width: bossConfig.width,
            height: bossConfig.height,
            dx: bossConfig.speed,
            dy: 0,
            health: bossConfig.health,
            isBoss: true,
            shootInterval: 1000, // Boss shoots every second
            lastShot: Date.now()
        };
        bosses.push(boss);
    }

    // Draw Stars (Background)
    function drawBackground() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
            ctx.fill();
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });
    }

    // Draw Player
    function drawPlayer() {
        if (player.shield) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = 'green';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Move Player
    function movePlayer() {
        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }

    // Draw Bullets
    function drawBullets() {
        ctx.fillStyle = 'red';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    // Move Bullets
    function moveBullets() {
        bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            if (bullet.y < 0) bullets.splice(index, 1);
        });
    }

    // Draw Enemy Bullets
    function drawEnemyBullets() {
        ctx.fillStyle = 'orange';
        enemyBullets.forEach((bullet, index) => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    // Move Enemy Bullets
    function moveEnemyBullets() {
        enemyBullets.forEach((bullet, index) => {
            bullet.y += bullet.speed;
            if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
            // Check collision with player
            if (bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y) {
                enemyBullets.splice(index, 1);
                if (!player.shield) {
                    player.lives -= 1;
                    if (player.lives <= 0) {
                        alert("Game Over!");
                        endGame();
                    }
                }
            }
        });
    }

    // Draw Enemies
    function drawEnemies() {
        ctx.fillStyle = 'blue';
        enemies.forEach(enemy => {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }

    // Move Enemies
    function moveEnemies() {
        enemies.forEach(enemy => {
            enemy.x += enemy.dx;
        });

        if (enemies.length > 0) {
            const leftmostEnemy = enemies.reduce((prev, curr) => prev.x < curr.x ? prev : curr);
            const rightmostEnemy = enemies.reduce((prev, curr) => prev.x > curr.x ? prev : curr);

            if (leftmostEnemy.x <= 0 || rightmostEnemy.x + enemyConfig.width >= canvas.width) {
                enemies.forEach(enemy => {
                    enemy.dx *= -1;
                    enemy.y += enemyConfig.margin;
                });
            }
        }
    }

    // Draw Bosses
    function drawBosses() {
        ctx.fillStyle = 'purple';
        bosses.forEach(boss => {
            ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        });
    }

    // Move Bosses
    function moveBosses() {
        bosses.forEach(boss => {
            boss.x += boss.dx;
            if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
                boss.dx *= -1;
            }
        });
    }

    // Draw Power-Ups
    function drawPowerUps() {
        powerUps.forEach(powerUp => {
            switch(powerUp.type) {
                case 'double-bullets':
                    ctx.fillStyle = 'yellow';
                    break;
                case 'shield':
                    ctx.fillStyle = 'cyan';
                    break;
                case 'extra-life':
                    ctx.fillStyle = 'magenta';
                    break;
                default:
                    ctx.fillStyle = 'white';
            }
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });
    }

    // Check Collisions between Bullets and Enemies/Bosses
    function checkCollisions() {
        bullets.forEach((bullet, bulletIndex) => {
            // Check collision with regular enemies
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    bullets.splice(bulletIndex, 1);
                    enemies.splice(enemyIndex, 1);
                    score += 10;
                }
            });

            // Check collision with bosses
            bosses.forEach((boss, bossIndex) => {
                if (bullet.x < boss.x + boss.width &&
                    bullet.x + bullet.width > boss.x &&
                    bullet.y < boss.y + boss.height &&
                    bullet.y + bullet.height > boss.y) {
                    bullets.splice(bulletIndex, 1);
                    boss.health -= player.doubleBullets ? 20 : 10;
                    score += player.doubleBullets ? 20 : 10;
                    if (boss.health <= 0) {
                        bosses.splice(bossIndex, 1);
                        score += 100;
                        alert("Boss Defeated! Level Up!");
                        currentLevel++;
                        if (currentLevel > maxLevels) {
                            alert("Congratulations! You've completed all levels!");
                            endGame();
                        } else {
                            setupLevel();
                        }
                    }
                }
            });
        });
    }

    // Draw Score and Lives
    function drawScoreAndLives() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);
        ctx.fillText(`Lives: ${player.lives}`, canvas.width - 100, 20);
        if (player.shield) {
            ctx.fillStyle = 'cyan';
            ctx.font = '16px Arial';
            ctx.fillText(`Shield Active`, canvas.width / 2 - 50, 20);
        }
    }

    // Create Power-Ups
    function createPowerUps() {
        const powerUp = {
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 200),
            width: 20,
            height: 20,
            type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
            speed: 2
        };
        powerUps.push(powerUp);
    }

    // Move Power-Ups
    function movePowerUps() {
        powerUps.forEach((powerUp, index) => {
            powerUp.y += powerUp.speed;
            if (powerUp.y > canvas.height) {
                powerUps.splice(index, 1);
            }
        });
    }

    // Check Power-Up Collection
    function checkPowerUpCollisions() {
        powerUps.forEach((powerUp, index) => {
            if (player.x < powerUp.x + powerUp.width &&
                player.x + player.width > powerUp.x &&
                player.y < powerUp.y + powerUp.height &&
                player.y + player.height > powerUp.y) {
                applyPowerUp(powerUp.type);
                powerUps.splice(index, 1);
            }
        });
    }

    // Apply Power-Up Effects
    function applyPowerUp(type) {
        switch(type) {
            case 'double-bullets':
                player.doubleBullets = true;
                setTimeout(() => {
                    player.doubleBullets = false;
                }, 10000); // Double bullets for 10 seconds
                break;
            case 'shield':
                player.shield = true;
                setTimeout(() => {
                    player.shield = false;
                }, 10000); // Shield for 10 seconds
                break;
            case 'extra-life':
                player.lives += 1;
                break;
            default:
                break;
        }
    }

    // Boss Shooting
    function bossShoot() {
        bosses.forEach(boss => {
            if (Date.now() - boss.lastShot > boss.shootInterval) {
                const bullet = {
                    x: boss.x + boss.width / 2 - 2,
                    y: boss.y + boss.height,
                    width: 4,
                    height: 10,
                    speed: 4
                };
                enemyBullets.push(bullet);
                boss.lastShot = Date.now();
            }
        });
    }

    // Handle Player Shooting
    function shoot() {
        const bullet1 = {
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        };
        bullets.push(bullet1);

        if (player.doubleBullets) {
            const bullet2 = {
                x: player.x + player.width / 4 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: 7
            };
            const bullet3 = {
                x: player.x + (3 * player.width) / 4 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: 7
            };
            bullets.push(bullet2);
            bullets.push(bullet3);
        }
    }

    // Setup Level
    function setupLevel() {
        enemyConfig.speed += 0.5; // Increase enemy speed each level
        createEnemies();

        // Every 3 levels, introduce a boss
        if (currentLevel % 3 === 0) {
            createBoss();
        }

        // Spawn Power-Ups periodically
        if (currentLevel === 1) {
            // Ensure only one interval is set per game instance
            if (!window.powerUpInterval) {
                window.powerUpInterval = setInterval(createPowerUps, 10000); // Every 10 seconds
            }
        } else {
            // For higher levels, continue spawning power-ups
            if (!window.powerUpInterval) {
                window.powerUpInterval = setInterval(createPowerUps, 10000); // Every 10 seconds
            }
        }
    }

    // End Game
    function endGame() {
        gameOver = true;
        alert(`Game Over! Your score: ${score}`);
        // Clear power-up interval to prevent memory leaks
        if (window.powerUpInterval) {
            clearInterval(window.powerUpInterval);
            window.powerUpInterval = null;
        }
        // Reset Game
        resetGame();
    }

    // Reset Game
    function resetGame() {
        player.lives = 3;
        player.doubleBullets = false;
        player.shield = false;
        currentLevel = 1;
        score = 0;
        enemies.length = 0;
        bullets.length = 0;
        enemyBullets.length = 0;
        powerUps.length = 0;
        bosses.length = 0;
        enemyConfig.speed = 2;
        createEnemies();
        setupLevel();
        gameOver = false;
        update();
    }

    // Handle Key Down
    function keyDown(e) {
        if (e.key === 'ArrowRight') player.dx = player.speed;
        if (e.key === 'ArrowLeft') player.dx = -player.speed;
        if (e.key === ' ') shoot();
    }

    // Handle Key Up
    function keyUp(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
    }

    // Handle Touch Controls
    function touchStart(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const xPos = touch.clientX - rect.left;
        const yPos = touch.clientY - rect.top;

        if (yPos < canvas.height / 2) {
            shoot();
            player.dx = 0;
        } else {
            if (xPos < canvas.width / 2) player.dx = -player.speed;
            else player.dx = player.speed;
        }
    }

    function touchEnd() {
        player.dx = 0;
    }

    // Event Listeners
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touchStart(e);
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        touchEnd(e);
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });

    // Initialize Enemies and Start Level
    createEnemies();
    setupLevel();

    // Main Update Loop
    function update() {
        if (gameOver) return;
        drawBackground();
        drawPlayer();
        movePlayer();
        drawBullets();
        moveBullets();
        drawEnemies();
        moveEnemies();
        drawBosses();
        moveBosses();
        drawEnemyBullets();
        moveEnemyBullets();
        drawPowerUps();
        movePowerUps();
        drawScoreAndLives();
        checkCollisions();
        checkPowerUpCollisions();
        drawShields();
        bossShoot();
        requestAnimationFrame(update);
    }

    // Handle Player Bullet Collisions with Bosses
    function checkPlayerBulletCollisions() {
        bullets.forEach((bullet, bulletIndex) => {
            bosses.forEach((boss, bossIndex) => {
                if (bullet.x < boss.x + boss.width &&
                    bullet.x + bullet.width > boss.x &&
                    bullet.y < boss.y + boss.height &&
                    bullet.y + bullet.height > boss.y) {
                    bullets.splice(bulletIndex, 1);
                    boss.health -= player.doubleBullets ? 20 : 10;
                    score += player.doubleBullets ? 20 : 10;
                    if (boss.health <= 0) {
                        bosses.splice(bossIndex, 1);
                        score += 100;
                        alert("Boss Defeated! Level Up!");
                        currentLevel++;
                        if (currentLevel > maxLevels) {
                            alert("Congratulations! You've completed all levels!");
                            endGame();
                        } else {
                            setupLevel();
                        }
                    }
                }
            });
        });
    }

    // Define the Missing drawShields Function
    function drawShields() {
        if (player.shield) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Start the Update Loop
    update();
}

// Hook up the startSpaceInvaders button after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startSpaceInvaders');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // Prevent multiple game instances
            if (!startButton.disabled) {
                startSpaceInvadersGame();
                startButton.disabled = true;
            }
        });
    } else {
        console.error('Start button with id "startSpaceInvaders" not found.');
    }
});
