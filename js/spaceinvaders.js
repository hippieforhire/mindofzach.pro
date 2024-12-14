// spaceinvaders.js (Basic Version)

(function() {
    function startSpaceInvadersGame() {
        const canvas = document.getElementById('spaceInvadersCanvas');
        const startButton = document.getElementById('startSpaceInvaders');

        if (!canvas || !startButton) return;

        // Set fixed size and scale
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.maxWidth = "100%";
        canvas.style.height = "auto";

        canvas.style.display = 'block';
        startButton.style.display = 'none';

        const ctx = canvas.getContext('2d');

        // Basic variables
        let gameOver = false;
        
        // Player properties
        const player = {
            x: canvas.width/2 - 20,
            y: canvas.height - 50,
            width: 40,
            height: 20,
            speed: 6,
            dx: 0
        };

        const bullets = [];

        // Draw background
        function drawBackground() {
            ctx.fillStyle = 'black';
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }

        // Draw Player
        function drawPlayer() {
            ctx.fillStyle = 'green';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // Move Player
        function movePlayer() {
            player.x += player.dx;
            if (player.x < 0) player.x = 0;
            if (player.x+player.width > canvas.width) player.x = canvas.width - player.width;
        }

        // Handle Bullets
        function drawBullets() {
            ctx.fillStyle = 'red';
            bullets.forEach(b => {
                ctx.fillRect(b.x, b.y, b.width, b.height);
            });
        }

        function moveBullets() {
            for (let i = bullets.length-1; i>=0; i--) {
                bullets[i].y -= bullets[i].speed;
                if (bullets[i].y < 0) bullets.splice(i,1);
            }
        }

        function shoot() {
            bullets.push({
                x: player.x + player.width/2 -2,
                y: player.y,
                width:4,
                height:10,
                speed:7
            });
        }

        function keyDown(e) {
            if (e.key==='ArrowRight') player.dx = player.speed;
            if (e.key==='ArrowLeft') player.dx = -player.speed;
            if (e.key===' ') shoot();
        }

        function keyUp(e) {
            if (e.key==='ArrowRight' || e.key==='ArrowLeft') player.dx=0;
        }

        // Touch Controls (optional minimal)
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

        document.addEventListener('keydown',keyDown);
        document.addEventListener('keyup',keyUp);

        canvas.addEventListener('touchstart',touchStart,{passive:false});
        canvas.addEventListener('touchmove',touchMove,{passive:false});
        canvas.addEventListener('touchend',function(e){e.preventDefault();touchEnd();},{passive:false});

        function update() {
            if (gameOver) return;
            drawBackground();
            movePlayer();
            drawPlayer();
            moveBullets();
            drawBullets();
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
