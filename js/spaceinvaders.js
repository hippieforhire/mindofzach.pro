// spaceinvaders.js

(function() {
    function startSpaceInvadersGame() {
        const canvas = document.getElementById('spaceInvadersCanvas');
        const startButton = document.getElementById('startSpaceInvaders');

        if (!canvas || !startButton) return;

        // Set fixed size and scale like flappybird
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.maxWidth = "100%";
        canvas.style.height = "auto";

        canvas.style.display = 'block';
        startButton.style.display = 'none';

        const ctx = canvas.getContext('2d');

        let gameOver = false;
        let score = 0;
        let currentLevel = 1;
        const maxLevels = 5;
        let powerUpInterval = null;

        const player = {
            width: 40,
            height: 20,
            x: canvas.width / 2 - 20,
            y: canvas.height - 50,
            speed: 6, // requested speed of 6
            dx: 0,
            doubleBullets: false,
            shield: false,
            lives: 3
        };

        let bullets = [];
        let enemyBullets = [];
        let enemies = [];
        let bosses = [];
        let powerUps = [];

        const stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                speed: Math.random() * 0.5 + 0.5,
                color: getRandomStarColor()
            });
        }

        const enemyConfig = {
            rows: 3,
            cols: 7,
            width: 30,
            height: 20,
            margin: 20,
            speed: 2
        };

        const bossConfig = {
            width: 80,
            height: 40,
            speed: 1.5,
            health: 100
        };

        const powerUpTypes = ['double-bullets', 'shield', 'extra-life'];

        function createEnemies() {
            enemies = [];
            for (let row = 0; row < enemyConfig.rows; row++) {
                for (let col = 0; col < enemyConfig.cols; col++) {
                    enemies.push({
                        x: 50 + col * (enemyConfig.width + enemyConfig.margin),
                        y: 50 + row * (enemyConfig.height + enemyConfig.margin),
                        width: enemyConfig.width,
                        height: enemyConfig.height,
                        dx: enemyConfig.speed,
                        dy: 0,
                        health: 20
                    });
                }
            }
        }

        function createBoss() {
            bosses = [];
            bosses.push({
                x: canvas.width / 2 - bossConfig.width / 2,
                y: 30,
                width: bossConfig.width,
                height: bossConfig.height,
                dx: bossConfig.speed,
                health: bossConfig.health,
                shootInterval: 1000,
                lastShot: Date.now()
            });
        }

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

        function getRandomStarColor() {
            const colors = ['#FFFFFF', '#FFD700', '#ADD8E6', '#FF69B4', '#7FFFD4'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function drawPlayer() {
            if (player.shield) {
                ctx.strokeStyle = 'cyan';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width, 0, Math.PI*2);
                ctx.stroke();
            }
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
                if (bullets[i].y < 0) bullets.splice(i, 1);
            }
        }

        function drawEnemyBullets() {
            ctx.fillStyle = 'orange';
            enemyBullets.forEach(b => {
                ctx.fillRect(b.x, b.y, b.width, b.height);
            });
        }

        function moveEnemyBullets() {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                enemyBullets[i].y += enemyBullets[i].speed;
                if (enemyBullets[i].y > canvas.height) {
                    enemyBullets.splice(i, 1);
                    continue;
                }
                if (isColliding(enemyBullets[i], player)) {
                    enemyBullets.splice(i, 1);
                    if (!player.shield) {
                        player.lives--;
                        if (player.lives <= 0) {
                            alert("Game Over!");
                            endGame();
                        }
                    }
                }
            }
        }

        function drawEnemies() {
            ctx.fillStyle = 'blue';
            enemies.forEach(e => {
                ctx.fillRect(e.x, e.y, e.width, e.height);
            });
        }

        function moveEnemies() {
            enemies.forEach(e => { e.x += e.dx; });

            if (enemies.length > 0) {
                const leftmost = enemies.reduce((prev, cur) => prev.x < cur.x ? prev : cur);
                const rightmost = enemies.reduce((prev, cur) => prev.x > cur.x ? prev : cur);
                if (leftmost.x <= 0 || rightmost.x + enemyConfig.width >= canvas.width) {
                    enemies.forEach(e => {
                        e.dx *= -1;
                        e.y += enemyConfig.margin;
                        if (e.y + e.height >= player.y) {
                            alert("Game Over!");
                            endGame();
                        }
                    });
                }
            }
        }

        function drawBosses() {
            ctx.fillStyle = 'purple';
            bosses.forEach(b => {
                ctx.fillRect(b.x, b.y, b.width, b.height);
            });
        }

        function moveBosses() {
            bosses.forEach(b => {
                b.x += b.dx;
                if (b.x <= 0 || b.x + b.width >= canvas.width) {
                    b.dx *= -1;
                }
            });
        }

        function drawPowerUps() {
            powerUps.forEach(p => {
                switch(p.type) {
                    case 'double-bullets': ctx.fillStyle='yellow'; break;
                    case 'shield': ctx.fillStyle='cyan'; break;
                    case 'extra-life': ctx.fillStyle='magenta'; break;
                    default: ctx.fillStyle='white';
                }
                ctx.fillRect(p.x, p.y, p.width, p.height);
            });
        }

        function checkCollisions() {
            const bulletsClone = bullets.slice();
            bulletsClone.forEach(bullet => {
                enemies.forEach((enemy, ei) => {
                    if (isColliding(bullet, enemy)) {
                        bullets.splice(bullets.indexOf(bullet),1);
                        enemies.splice(ei,1);
                        score+=10;
                    }
                });

                bosses.forEach((boss, bi) => {
                    if (isColliding(bullet, boss)) {
                        bullets.splice(bullets.indexOf(bullet),1);
                        boss.health -= player.doubleBullets ? 20 :10;
                        score += player.doubleBullets?20:10;
                        if (boss.health <=0) {
                            bosses.splice(bi,1);
                            score+=100;
                            alert("Boss Defeated! Level Up!");
                            currentLevel++;
                            if (currentLevel > maxLevels) {
                                alert("Congratulations! Completed all levels!");
                                endGame();
                            } else {
                                setupLevel();
                            }
                        }
                    }
                });
            });
        }

        function isColliding(r1, r2) {
            return (
                r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y
            );
        }

        function drawScoreAndLives() {
            ctx.fillStyle='white';
            ctx.font='20px Arial';
            ctx.fillText(`Score: ${score}`,10,30);
            ctx.fillText(`Lives: ${player.lives}`,canvas.width-120,30);
            if (player.shield) {
                ctx.fillStyle='cyan';
                ctx.font='16px Arial';
                ctx.fillText(`Shield Active`, canvas.width/2 -60, 30);
            }
        }

        function createPowerUps() {
            const p = {
                x: Math.random()*(canvas.width-20),
                y: Math.random()*(canvas.height-200),
                width:20,
                height:20,
                type: powerUpTypes[Math.floor(Math.random()*powerUpTypes.length)],
                speed:2
            };
            powerUps.push(p);
        }

        function movePowerUps() {
            for (let i = powerUps.length-1; i>=0; i--) {
                powerUps[i].y += powerUps[i].speed;
                if (powerUps[i].y>canvas.height) powerUps.splice(i,1);
            }
        }

        function checkPowerUpCollisions() {
            for (let i=powerUps.length-1; i>=0; i--) {
                if (isColliding(player,powerUps[i])) {
                    applyPowerUp(powerUps[i].type);
                    powerUps.splice(i,1);
                }
            }
        }

        function applyPowerUp(type) {
            switch(type) {
                case 'double-bullets':
                    player.doubleBullets=true;
                    setTimeout(()=>player.doubleBullets=false,10000);
                    break;
                case 'shield':
                    player.shield=true;
                    setTimeout(()=>player.shield=false,10000);
                    break;
                case 'extra-life':
                    player.lives+=1;
                    break;
            }
        }

        function bossShoot() {
            bosses.forEach(boss=> {
                if (Date.now()-boss.lastShot>boss.shootInterval) {
                    enemyBullets.push({
                        x: boss.x + boss.width/2 -2,
                        y: boss.y+boss.height,
                        width:4,
                        height:10,
                        speed:4
                    });
                    boss.lastShot=Date.now();
                }
            });
        }

        function shoot() {
            bullets.push({
                x:player.x+player.width/2 -2,
                y:player.y,
                width:4,
                height:10,
                speed:7
            });
            if (player.doubleBullets) {
                bullets.push({x:player.x+player.width/4-2,y:player.y,width:4,height:10,speed:7});
                bullets.push({x:player.x+(3*player.width)/4-2,y:player.y,width:4,height:10,speed:7});
            }
        }

        function setupLevel() {
            enemyConfig.speed=2+(currentLevel-1)*0.5;
            createEnemies();
            bosses=[];
            if (currentLevel %3===0) {
                createBoss();
            }
            if (!powerUpInterval) {
                powerUpInterval=setInterval(createPowerUps,10000);
            }
        }

        function endGame() {
            gameOver=true;
            alert(`Game Over! Score: ${score}`);
            if (powerUpInterval) {
                clearInterval(powerUpInterval);
                powerUpInterval=null;
            }
            canvas.style.display='none';
            startButton.style.display='inline-block';
        }

        function resetGame() {
            player.lives=3;
            player.doubleBullets=false;
            player.shield=false;
            currentLevel=1;
            score=0;
            enemies=[];
            bullets=[];
            enemyBullets=[];
            powerUps=[];
            bosses=[];
            enemyConfig.speed=2;
            createEnemies();
            setupLevel();
            gameOver=false;
            requestAnimationFrame(update);
        }

        function keyDown(e) {
            if (e.key==='ArrowRight') player.dx=player.speed;
            if (e.key==='ArrowLeft') player.dx=-player.speed;
            if (e.key===' ') shoot();
        }

        function keyUp(e) {
            if (e.key==='ArrowRight'||e.key==='ArrowLeft') player.dx=0;
        }

        function touchStart(e) {
            e.preventDefault();
            const rect=canvas.getBoundingClientRect();
            const touch=e.touches[0];
            const xPos=touch.clientX - rect.left;
            const yPos=touch.clientY - rect.top;

            if (yPos<canvas.height/2) {
                shoot();
            } else {
                if (xPos<canvas.width/2) {
                    player.dx=-player.speed;
                } else {
                    player.dx=player.speed;
                }
            }
        }

        function touchMove(e) {
            e.preventDefault();
            const rect=canvas.getBoundingClientRect();
            const touch=e.touches[0];
            const xPos=touch.clientX - rect.left;
            const yPos=touch.clientY - rect.top;

            if (yPos>=canvas.height/2) {
                if (xPos<canvas.width/2) {
                    player.dx=-player.speed;
                } else {
                    player.dx=player.speed;
                }
            }
        }

        function touchEnd() {
            player.dx=0;
        }

        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);
        canvas.addEventListener('touchstart',touchStart,{passive:false});
        canvas.addEventListener('touchmove',touchMove,{passive:false});
        canvas.addEventListener('touchend',function(e){e.preventDefault();touchEnd();},{passive:false});

        createEnemies();
        setupLevel();

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

        requestAnimationFrame(update);
    }

    document.addEventListener('DOMContentLoaded',function(){
        const startButton=document.getElementById('startSpaceInvaders');
        if(startButton){
            startButton.addEventListener('click',function(){
                const canvas=document.getElementById('spaceInvadersCanvas');
                if (canvas.style.display!=='block'){
                    startSpaceInvadersGame();
                }
            });
        }
    });
})();
