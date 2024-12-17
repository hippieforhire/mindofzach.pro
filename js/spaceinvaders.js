// spaceinvaders.js with multiple levels, power-ups, bosses
// No canvas drag touch control, only buttons & keys
// Shoot button center, left/right on sides
// More variety: first 2 levels normal enemies, 3rd level a boss with more health and power-ups.

(function() {
    const canvas = document.getElementById('spaceGameCanvas');
    const startButton = document.getElementById('startSpaceGame');
    const nextLevelButton = document.getElementById('nextLevelButton');
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const shootButton = document.getElementById('shootButton');
    let ctx;

    let gameStarted = false;
    let animationId;
    let player, bullets, enemies, powerUps, keys, gameOver, score, level, enemyDirection;

    let moveLeftActive = false;
    let moveRightActive = false;

    // Added Levels Configuration
    const levelsConfig = [
        { rows: 2, cols: 8, enemySpeed: 1.5, hasBoss: false },
        { rows: 3, cols: 10, enemySpeed: 2.0, hasBoss: false },
        { rows: 4, cols: 12, enemySpeed: 2.5, hasBoss: true }, // Level 3 with boss
        // Add more levels as needed
    ];

    function init(levelNum=1) {
        player = {
            x: 400 - 20,
            y: 400 - 50,
            width: 40,
            height: 20,
            speed: 5,
            dx: 0,
            power: 1
        };

        bullets = [];
        enemies = [];
        powerUps = [];
        keys = {};
        gameOver = false;
        score = 0;
        level = levelNum;
        enemyDirection = 1;

        canvas.width = 800;
        canvas.height = 400;

        const currentLevel = levelsConfig[level-1];
        if (currentLevel.hasBoss) {
            spawnBoss();
        } else {
            spawnEnemies(currentLevel.rows, currentLevel.cols, false);
        }
    }

    function spawnEnemies(rows, cols, isBoss) {
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
                    alive: true,
                    boss: false,
                    health: 1,
                    color: getRandomColor()
                });
            }
        }
    }

    function spawnBoss() {
        enemies.push({
            x: canvas.width/2 - 40,
            y: 50,
            width: 80,
            height: 40,
            alive: true,
            boss: true,
            health: 50,
            color: '#FF4500' // Distinct color for boss
        });
    }

    function getRandomColor(){
        const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function drawBackground() {
        // Dynamic background with cool color effects
        const hue = (score * 5) % 360;
        ctx.fillStyle = `hsl(${hue}, 50%, 10%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Optional: Add gradient or stars for more pizzazz
        const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.1)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawPlayer() {
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function movePlayer() {
        player.dx = 0;
        if (keys['ArrowRight'] || moveRightActive) player.dx = player.speed;
        if (keys['ArrowLeft'] || moveLeftActive) player.dx = -player.speed;

        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }

    function drawBullets() {
        ctx.fillStyle = 'yellow';
        bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });
    }

    function moveBullets() {
        bullets.forEach(b => {
            b.y -= b.speed;
        });
        bullets = bullets.filter(b => b.y + b.height > 0);
    }

    function drawEnemies() {
        enemies.forEach(e => {
            if (e.alive) {
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x, e.y, e.width, e.height);
            }
        });
    }

    function moveEnemies() {
        let hitEdge = false;
        enemies.forEach(e => {
            if (e.alive && !e.boss) {
                e.x += enemyDirection * levelsConfig[level-1].enemySpeed;
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

        // Move boss if present
        enemies.forEach(e => {
            if (e.alive && e.boss) {
                e.x += enemyDirection * (levelsConfig[level-1].enemySpeed + 0.5);
                if (e.x + e.width > canvas.width || e.x < 0) {
                    enemyDirection *= -1;
                }
            }
        });
    }

    function drawPowerUps() {
        ctx.fillStyle = 'gold';
        powerUps.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function movePowerUps() {
        powerUps.forEach(p => {
            p.y += p.speed;
        });
        powerUps = powerUps.filter(p => p.y - p.size < canvas.height);

        // Check collision with player
        powerUps.forEach(p => {
            if (p.x > player.x && p.x < player.x + player.width &&
                p.y > player.y && p.y < player.y + player.height) {
                activatePowerUp(p.type);
                p.collected = true;
            }
        });
        powerUps = powerUps.filter(p => !p.collected);
    }

    function activatePowerUp(type){
        if(type === 'speed'){
            player.speed +=2;
            setTimeout(()=>{ player.speed -=2; }, 5000);
        } else if(type === 'doubleFire'){
            player.power *=2;
            setTimeout(()=>{ player.power /=2; }, 5000);
        }
        // Add more power-up types as needed
    }

    function spawnPowerUp(x, y){
        const types = ['speed', 'doubleFire'];
        const type = types[Math.floor(Math.random() * types.length)];
        powerUps.push({x: x, y: y, size: 10, speed:2, type: type});
    }

    function shoot(){
        bullets.push({
            x: player.x + player.width/2 - 2,
            y: player.y,
            width:4,
            height:10,
            speed:7 + player.power
        });
    }

    function dropPowerUp(x, y) {
        spawnPowerUp(x + 20, y + 20);
    }

    function checkCollisions() {
        bullets.forEach((b, i) => {
            enemies.forEach((e, j) => {
                if(e.alive &&
                   b.x < e.x + e.width &&
                   b.x + b.width > e.x &&
                   b.y < e.y + e.height &&
                   b.y + b.height > e.y){
                    e.health -=1;
                    if(e.health <=0){
                        e.alive = false;
                        score += e.boss ? 100 : 10;
                        if(!e.boss){
                            dropPowerUp(e.x, e.y);
                        }
                    }
                    bullets.splice(i,1);
                }
            });
        });

        // Check if any enemies have reached the player
        enemies.forEach(e => {
            if(e.alive && e.y + e.height >= player.y){
                gameOver=true;
            }
        });
    }

    function drawScore(){
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Score: ' + score, 10, 20);
        ctx.fillText('Level: ' + level, 100, 20);
    }

    function update(){
        if (gameOver) return;
        drawBackground();
        movePlayer();
        drawPlayer();

        moveBullets();
        drawBullets();

        moveEnemies();
        drawEnemies();

        movePowerUps();
        drawPowerUps();

        checkCollisions();
        drawScore();

        if (enemies.every(e => !e.alive)) {
            // Level complete
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.fillText("Level Complete!", canvas.width/2 - 100, canvas.height/2);
            cancelAnimationFrame(animationId);
            nextLevelButton.style.display = 'inline-block';
            return;
        }

        animationId = requestAnimationFrame(update);
    }

    function startGame(){
        if(gameStarted) return;
        gameStarted = true;
        ctx = canvas.getContext('2d');
        init(1);
        startButton.style.display = 'none';
        nextLevelButton.style.display = 'none';
        update();
    }

    nextLevelButton.addEventListener('click', () => {
        level++;
        if(level > levelsConfig.length){
            alert("Congratulations! You've completed all levels!");
            level = 1; // Reset or extend levels as needed
        }
        init(level);
        nextLevelButton.style.display = 'none';
        update();
    });

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ') {
            shoot();
        }
    });
    document.addEventListener('keyup', (e) => {
        delete keys[e.key];
    });

    // On-screen buttons only
    leftButton.addEventListener('mousedown', () => { moveLeftActive = true; });
    leftButton.addEventListener('mouseup', () => { moveLeftActive = false; });
    leftButton.addEventListener('mouseleave', () => { moveLeftActive = false; });
    leftButton.addEventListener('touchstart', () => { moveLeftActive = true; }, {passive:true});
    leftButton.addEventListener('touchend', () => { moveLeftActive = false; }, {passive:true});

    rightButton.addEventListener('mousedown', () => { moveRightActive = true; });
    rightButton.addEventListener('mouseup', () => { moveRightActive = false; });
    rightButton.addEventListener('mouseleave', () => { moveRightActive = false; });
    rightButton.addEventListener('touchstart', () => { moveRightActive = true; }, {passive:true});
    rightButton.addEventListener('touchend', () => { moveRightActive = false; }, {passive:true});

    shootButton.addEventListener('mousedown', () => { shoot(); });
    shootButton.addEventListener('touchstart', () => { shoot(); }, {passive:true});
})();
