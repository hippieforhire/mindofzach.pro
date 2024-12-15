// Improved Space Invaders with responsive canvas, multi-touch, and on-screen buttons
(function() {
    const canvas = document.getElementById('spaceGameCanvas');
    const startButton = document.getElementById('startSpaceGame');
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const shootButton = document.getElementById('shootButton');
    let ctx;
    let gameStarted = false;
    let animationId;

    let player, bullets, enemies, keys, gameOver, score;
    let enemyDirection = 1; 

    // Movement and shooting states for touch/buttons
    let moveLeftActive = false;
    let moveRightActive = false;
    let shootActive = false;

    function init() {
        player = {
            x: 400 - 20,
            y: 400 - 50,
            width: 40,
            height: 20,
            speed: 5,
            dx: 0
        };

        bullets = [];
        enemies = [];
        keys = {};
        gameOver = false;
        score = 0;
        enemyDirection = 1;

        // Resize canvas for ratio
        canvas.width = 800;
        canvas.height = 400;

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
        // Determine dx from input
        player.dx = 0;
        if (keys['ArrowRight'] || moveRightActive) player.dx = player.speed;
        if (keys['ArrowLeft'] || moveLeftActive) player.dx = -player.speed;

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
    }

    function keyUp(e) {
        delete keys[e.key];
    }

    // Touch Controls for canvas
    // Already have buttons, but we keep shoot on tap top half as well
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length >= 2) {
          // Multi-touch: if second finger top half => shoot, bottom half => direction
          for (let t of e.touches) {
            const rect = canvas.getBoundingClientRect();
            const xPos = t.clientX - rect.left;
            const yPos = t.clientY - rect.top;
            if (yPos < canvas.height/2) {
              shoot();
            } else {
              if (xPos < canvas.width/2) moveLeftActive = true;
              else moveRightActive = true;
            }
          }
        } else {
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          const xPos = touch.clientX - rect.left;
          const yPos = touch.clientY - rect.top;
          if (yPos < canvas.height / 2) {
              shoot();
          } else {
              if (xPos < canvas.width / 2) moveLeftActive = true;
              else moveRightActive = true;
          }
        }
    }, {passive:false});

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        // Move finger around
        const rect = canvas.getBoundingClientRect();
        let leftTouched = false;
        let rightTouched = false;
        let shootTouched = false;
        for (let i=0;i<e.touches.length;i++){
            const touch = e.touches[i];
            const xPos = touch.clientX - rect.left;
            const yPos = touch.clientY - rect.top;
            if (yPos < canvas.height/2) {
              shootTouched = true;
            } else {
              if (xPos < canvas.width/2) leftTouched = true;
              else rightTouched = true;
            }
        }
        moveLeftActive = leftTouched;
        moveRightActive = rightTouched;
        if (shootTouched) shoot(); 
    }, {passive:false});

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        // If no touches remain
        if (e.touches.length === 0) {
          moveLeftActive = false;
          moveRightActive = false;
        } else {
          // Recheck remaining touches
          const rect = canvas.getBoundingClientRect();
          let leftTouched = false;
          let rightTouched = false;
          for (let i=0;i<e.touches.length;i++){
              const touch = e.touches[i];
              const xPos = touch.clientX - rect.left;
              const yPos = touch.clientY - rect.top;
              if (yPos >= canvas.height/2) {
                if (xPos < canvas.width/2) leftTouched = true;
                else rightTouched = true;
              }
          }
          moveLeftActive = leftTouched;
          moveRightActive = rightTouched;
        }
    }, {passive:false});

    // On-screen buttons
    leftButton.addEventListener('touchstart', () => { moveLeftActive = true; }, {passive:true});
    leftButton.addEventListener('touchend', () => { moveLeftActive = false; }, {passive:true});

    rightButton.addEventListener('touchstart', () => { moveRightActive = true; }, {passive:true});
    rightButton.addEventListener('touchend', () => { moveRightActive = false; }, {passive:true});

    shootButton.addEventListener('touchstart', () => { shoot(); }, {passive:true});

    leftButton.addEventListener('mousedown', () => { moveLeftActive = true; });
    leftButton.addEventListener('mouseup', () => { moveLeftActive = false; });
    leftButton.addEventListener('mouseleave', () => { moveLeftActive = false; });

    rightButton.addEventListener('mousedown', () => { moveRightActive = true; });
    rightButton.addEventListener('mouseup', () => { moveRightActive = false; });
    rightButton.addEventListener('mouseleave', () => { moveRightActive = false; });

    shootButton.addEventListener('mousedown', () => { shoot(); });
    // no need to hold shoot button

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

    startButton.addEventListener('click', startGame);
})();
