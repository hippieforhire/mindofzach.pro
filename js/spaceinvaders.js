// spaceinvaders.js

(function() {
    // Game Initialization Function
    function startSpaceInvadersGame() {
        const canvas = document.getElementById('spaceInvadersCanvas');
        const startButton = document.getElementById('startSpaceInvaders');

        if (!canvas) {
            console.error('Canvas with id "spaceInvadersCanvas" not found.');
            return;
        }
        if (!startButton) {
            console.error('Start button with id "startSpaceInvaders" not found.');
            return;
        }

        // Show the canvas and hide the start button
        canvas.style.display = 'block';
        startButton.style.display = 'none';

        const ctx = canvas.getContext('2d');

        // Game Variables
        let gameOver = false;
        let score = 0;
        let currentLevel = 1;
        const maxLevels = 5;
        let powerUpInterval = null;

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

        // Arrays to hold game entities
        const bullets = [];
        const enemyBullets = [];
        const enemies = [];
        const bosses = [];
        const powerUps = [];

        // Starfield for Background
        const stars = [];
        for (let i = 0; i < 150; i++) { // Increased number for a denser background
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                speed: Math.random() * 0.5 + 0.5,
                color: getRandomStarColor()
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
                health: bossConfig.health,
                shootInterval: 1000, // Boss shoots every second
                lastShot: Date.now()
            };
            bosses.push(boss);
        }

        // Draw Stars (Background)
        function drawBackground() {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
                ctx.fill();
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                    star.color = getRandomStarColor();
                }
            });
        }

        // Utility Function to Get Random Star Color
        function getRandomStarColor() {
            const colors = ['#FFFFFF', '#FFD700', '#ADD8E6', '#FF69B4', '#7FFFD4'];
            return colors[Math.floor(Math.random() * colors.length)];
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
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].y -= bullets[i].speed;
                if (bullets[i].y < 0) {
                    bullets.splice(i, 1);
                }
            }
        }

        // Draw Enemy Bullets
        function drawEnemyBullets() {
            ctx.fillStyle = 'orange';
            enemyBullets.forEach(bullet => {
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            });
        }

        // Move Enemy Bullets
        function moveEnemyBullets() {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                enemyBullets[i].y += enemyBullets[i].speed;
                if (enemyBullets[i].y > canvas.height) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                // Check collision with player
                if (isColliding(enemyBullets[i], player)) {
                    enemyBullets.splice(i, 1);
                    if (!player.shield) {
                        player.lives -= 1;
                        console.log("Player hit! Lives left:", player.lives);
                        if (player.lives <= 0) {
                            alert("Game Over!");
                            endGame();
                        }
                    }
                }
            }
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
                        // Check if enemies reach the player
                        if (enemy.y + enemy.height >= player.y) {
                            alert("Game Over!");
                            endGame();
                        }
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
            // Clone the bullets array to avoid issues when modifying it during iteration
            const bulletsClone = bullets.slice();
            bulletsClone.forEach((bullet, bulletIndex) => {
                // Check collision with regular enemies
                enemies.forEach((enemy, enemyIndex) => {
                    if (isColliding(bullet, enemy)) {
                        // Remove bullet and enemy
                        const actualBulletIndex = bullets.indexOf(bullet);
                        if (actualBulletIndex > -1) bullets.splice(actualBulletIndex, 1);
                        enemies.splice(enemyIndex, 1);
                        score += 10;
                        console.log("Enemy hit! Score:", score);
                    }
                });

                // Check collision with bosses
                bosses.forEach((boss, bossIndex) => {
                    if (isColliding(bullet, boss)) {
                        // Remove bullet
                        const actualBulletIndex = bullets.indexOf(bullet);
                        if (actualBulletIndex > -1) bullets.splice(actualBulletIndex, 1);
                        // Decrease boss health
                        boss.health -= player.doubleBullets ? 20 : 10;
                        score += player.doubleBullets ? 20 : 10;
                        console.log(`Boss hit! Boss Health: ${boss.health}, Score: ${score}`);
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

        // Utility Function to Check Collision Between Two Rectangles
        function isColliding(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        }

        // Draw Score and Lives
        function drawScoreAndLives() {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${score}`, 10, 30);
            ctx.fillText(`Lives: ${player.lives}`, canvas.width - 120, 30);
            if (player.shield) {
                ctx.fillStyle = 'cyan';
                ctx.font = '16px Arial';
                ctx.fillText(`Shield Active`, canvas.width / 2 - 60, 30);
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
            console.log(`Power-Up Spawned: ${powerUp.type}`);
        }

        // Move Power-Ups
        function movePowerUps() {
            for (let i = powerUps.length - 1; i >= 0; i--) {
                powerUps[i].y += powerUps[i].speed;
                if (powerUps[i].y > canvas.height) {
                    powerUps.splice(i, 1);
                }
            }
        }

        // Check Power-Up Collection
        function checkPowerUpCollisions() {
            for (let i = powerUps.length - 1; i >= 0; i--) {
                if (isColliding(player, powerUps[i])) {
                    applyPowerUp(powerUps[i].type);
                    powerUps.splice(i, 1);
                    console.log(`Power-Up Collected: ${powerUps[i].type}`);
                }
            }
        }

        // Apply Power-Up Effects
        function applyPowerUp(type) {
            switch(type) {
                case 'double-bullets':
                    player.doubleBullets = true;
                    console.log("Double Bullets Activated!");
                    setTimeout(() => {
                        player.doubleBullets = false;
                        console.log("Double Bullets Deactivated!");
                    }, 10000); // Double bullets for 10 seconds
                    break;
                case 'shield':
                    player.shield = true;
                    console.log("Shield Activated!");
                    setTimeout(() => {
                        player.shield = false;
                        console.log("Shield Deactivated!");
                    }, 10000); // Shield for 10 seconds
                    break;
                case 'extra-life':
                    player.lives += 1;
                    console.log("Extra Life Gained! Lives:", player.lives);
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
                    console.log("Boss Shot!");
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
            console.log("Bullet Fired!");

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
                console.log("Double Bullets Fired!");
            }
        }

        // Setup Level
        function setupLevel() {
            enemyConfig.speed += 0.5; // Increase enemy speed each level
            createEnemies();

            // Every 3 levels, introduce a boss
            if (currentLevel % 3 === 0) {
                createBoss();
                console.log("Boss Introduced!");
            }

            // Spawn Power-Ups periodically
            if (!powerUpInterval) {
                powerUpInterval = setInterval(createPowerUps, 10000); // Every 10 seconds
                console.log("Power-Up Interval Started");
            }
        }

        // End Game
        function endGame() {
            gameOver = true;
            console.log("Game Over!");
            alert(`Game Over! Your score: ${score}`);
            // Clear power-up interval to prevent memory leaks
            if (powerUpInterval) {
                clearInterval(powerUpInterval);
                powerUpInterval = null;
            }
            // Hide the canvas
            canvas.style.display = 'none';
            // Re-enable the start button
            const startButton = document.getElementById('startSpaceInvaders');
            if (startButton) {
                startButton.style.display = 'inline-block';
            }
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
            // Restart the update loop
            requestAnimationFrame(update);
            console.log("Game Reset!");
        }

        // Handle Key Down
        function keyDown(e) {
            if (e.key === 'ArrowRight') {
                player.dx = player.speed;
                console.log("Moving Right");
            }
            if (e.key === 'ArrowLeft') {
                player.dx = -player.speed;
                console.log("Moving Left");
            }
            if (e.key === ' ') {
                shoot();
                console.log("Shooting");
            }
        }

        // Handle Key Up
        function keyUp(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                player.dx = 0;
                console.log("Stopping Movement");
            }
        }

        // Handle Touch Controls
        function touchStart(e) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const xPos = (touch.clientX - rect.left) * scaleX;
            const yPos = (touch.clientY - rect.top) * scaleY;

            if (yPos < canvas.height / 2) {
                shoot();
                console.log("Touch: Shooting");
            } else {
                if (xPos < canvas.width / 2) {
                    player.dx = -player.speed;
                    console.log("Touch: Moving Left");
                } else {
                    player.dx = player.speed;
                    console.log("Touch: Moving Right");
                }
            }
        }

        function touchMove(e) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const xPos = (touch.clientX - rect.left) * scaleX;
            const yPos = (touch.clientY - rect.top) * scaleY;

            if (yPos >= canvas.height / 2) {
                if (xPos < canvas.width / 2) {
                    player.dx = -player.speed;
                    console.log("Touch Move: Moving Left");
                } else {
                    player.dx = player.speed;
                    console.log("Touch Move: Moving Right");
                }
            }
        }

        function touchEnd() {
            player.dx = 0;
            console.log("Touch End: Stopping Movement");
        }

        // Event Listeners
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);

        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touchStart(e);
        }, { passive: false });

        canvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            touchMove(e);
        }, { passive: false });

        canvas.addEventListener('touchend', function(e) {
            e.preventDefault();
            touchEnd(e);
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
            bossShoot();
            requestAnimationFrame(update);
        }

        // Start the Update Loop
        requestAnimationFrame(update);
    }

    // Hook up the startSpaceInvaders button after the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        const startButton = document.getElementById('startSpaceInvaders');
        if (startButton) {
            startButton.addEventListener('click', function() {
                // Prevent multiple game instances by checking if the canvas is already displayed
                const canvas = document.getElementById('spaceInvadersCanvas');
                if (canvas.style.display !== 'block') {
                    startSpaceInvadersGame();
                }
            });
        } else {
            console.error('Start button with id "startSpaceInvaders" not found.');
        }
    });
})();
