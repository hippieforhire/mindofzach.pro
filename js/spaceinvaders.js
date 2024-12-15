// New Basic Space Invaders Implementation
// Allows left/right movement, shooting, basic enemy row
// Works with keyboard and touch controls

(function() {
    const canvas = document.getElementById('spaceGameCanvas');
    const startButton = document.getElementById('startSpaceGame');
    let ctx;
    let gameStarted = false;
    let animationId;

    let player, bullets, enemies, enemyBullets, keys, touchActive, gameOver, score;

    function init() {
        player = {
            x: canvas.width / 2 - 20,
            y: canvas.height - 50,
            width: 40,
            height: 20,
            speed: 5,
            dx: 0
        };

        bullets = [];
        enemies = [];
        enemyBullets = [];
        keys = {};
        touchActive = false;
        gameOver = false;
        score = 0;

        // Create a row of enemies
        const rows = 2;
        const cols = 8;
        const enemyWidth = 30;
        const enemyHeight = 20;
        const padding = 10;
        const offsetTop = 50;
        const offsetLeft = 50;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                enemies.push({
                    x: offsetLeft + c * (enemyWidth + padding),
                    y: offsetTop + r * (enemyHeight + padding),
                    width: enemyWidth,
                    height: enemyHeight,
                    alive: true
                });
            }
        }
    }

    function drawBackground() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    function drawPlayer() {
        ctx.fillStyle = 'green';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function movePlayer() {
        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }

    function drawBullets() {
        ctx.fillStyle = 'red';
        bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });
    }

    function moveBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
            }
        }
    }

    function drawEnemies() {
        ctx.fillStyle = 'white';
        enemies.forEach(e => {
            if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
        });
    }

    // Simple enemy movement: move sideways and down over time
    let enemyDirection = 1; 
    let moveDownCount = 0;

    function moveEnemies() {
        let hitEdge = false;
        enemies.forEach(e => {
            if (e.alive) {
                e.x += enemyDirection;
                if (e.x + e.width > canvas.width || e.x < 0) {
                    hitEdge = true;
                }
            }
        });
        if (hitEdge) {
            enemies.forEach(e => {
                if (e.alive) e.y += 10;
            });
            enemyDirection *= -1;
        }
    }

    function checkCollisions() {
        // Bullets vs Enemies
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = 0; j < enemies.length; j++) {
                const b = bullets[i];
                const e = enemies[j];
                if (e.alive && b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    // Hit enemy
                    e.alive = false;
                    bullets.splice(i,1);
                    score += 10;
                    break;
                }
            }
        }

        // Check if enemies reach player
        for (let e of enemies) {
            if (e.alive && e.y + e.height >= player.y) {
                gameOver = true;
            }
        }
    }

    function shoot() {
        bullets.push({
            x: player.x + player.width/2 - 2,
            y: player.y,
            width:4,
            height:10,
            speed:7
        });
    }

    function drawScore() {
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.fillText('Score: ' + score, 10, 20);
    }

    function keyDown(e) {
        keys[e.key] = true;
        if (e.key === 'ArrowRight') player.dx = player.speed;
        if (e.key === 'ArrowLeft') player.dx = -player.speed;
        if (e.key === ' ') shoot();
    }

    function keyUp(e) {
        delete keys[e.key];
        if (!keys['ArrowRight'] && !keys['ArrowLeft']) player.dx = 0;
    }

    function touchStart(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const xPos = touch.clientX - rect.left;
        const yPos = touch.clientY - rect.top;

        // If touch in upper half, shoot
        if (yPos < canvas.height / 2) {
            shoot();
        } else {
            // Move left or right
            if (xPos < canvas.width / 2) {
                player.dx = -player.speed;
            } else {
                player.dx = player.speed;
            }
        }
        touchActive = true;
    }

    function touchMove(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const xPos = touch.clientX - rect.left;
        const yPos = touch.clientY - rect.top;

        if (yPos >= canvas.height/2) {
            if (xPos < canvas.width/2) {
                player.dx = -player.speed;
            } else {
                player.dx = player.speed;
            }
        }
    }

    function touchEnd() {
        player.dx = 0;
        touchActive = false;
    }

    function update() {
        if (gameOver) {
            ctx.fillStyle = 'white';
            ctx.font = '30px sans-serif';
            ctx.fillText("Game Over!", canvas.width/2 - 70, canvas.height/2);
            cancelAnimationFrame(animationId);
            return;
        }
        drawBackground();
        movePlayer();
        drawPlayer();

        moveBullets();
        drawBullets();

        moveEnemies();
        drawEnemies();
        checkCollisions();
        drawScore();

        // Check if all enemies dead
        if (enemies.every(e => !e.alive)) {
            ctx.fillStyle = 'white';
            ctx.font = '30px sans-serif';
            ctx.fillText("You Win!", canvas.width/2 - 60, canvas.height/2);
            cancelAnimationFrame(animationId);
            return;
        }

        animationId = requestAnimationFrame(update);
    }

    function startGame() {
        if (gameStarted) return;
        gameStarted = true;
        ctx = canvas.getContext('2d');
        init();
        update();
    }

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    canvas.addEventListener('touchstart', touchStart, {passive:false});
    canvas.addEventListener('touchmove', touchMove, {passive:false});
    canvas.addEventListener('touchend', function(e){ e.preventDefault(); touchEnd(); }, {passive:false});

    startButton.addEventListener('click', startGame);
})();
