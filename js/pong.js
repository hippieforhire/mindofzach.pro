// Simple Pong Game
// Player moves left paddle with W/S keys. CPU moves right paddle automatically.
// Press "Start" to begin. Score updates as either side scores.

(function(){
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('pongScore');
  const startBtn = document.getElementById('startPongButton');

  let player = { x:10, y:canvas.height/2 - 30, width:10, height:60, dy:0 };
  let cpu = { x:canvas.width-20, y:canvas.height/2 -30, width:10, height:60 };
  let ball = { x:canvas.width/2, y:canvas.height/2, vx:3, vy:3, size:8 };

  let playerScore = 0;
  let cpuScore = 0;
  let gameInterval = null;

  function draw() {
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw player
    ctx.fillStyle='white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Draw CPU
    ctx.fillRect(cpu.x, cpu.y, cpu.width, cpu.height);
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI*2);
    ctx.fill();

    updateScore();
  }

  function update() {
    // Move player
    player.y += player.dy;
    if (player.y<0) player.y=0;
    if (player.y+player.height>canvas.height) player.y=canvas.height-player.height;

    // Move CPU
    // Simple AI: Move CPU towards ball
    if (ball.y < cpu.y+cpu.height/2) cpu.y -= 2.5;
    else if (ball.y > cpu.y+cpu.height/2) cpu.y += 2.5;
    if (cpu.y<0) cpu.y=0;
    if (cpu.y+cpu.height>canvas.height) cpu.y=canvas.height - cpu.height;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.y - ball.size <0 || ball.y+ball.size>canvas.height) {
      ball.vy = -ball.vy;
    }

    // Check collision with paddles
    if (ball.x - ball.size < player.x+player.width && ball.y>player.y && ball.y<player.y+player.height) {
      ball.vx = -ball.vx;
      ball.x = player.x+player.width+ball.size;
    }
    if (ball.x + ball.size > cpu.x && ball.y>cpu.y && ball.y<cpu.y+cpu.height) {
      ball.vx = -ball.vx;
      ball.x = cpu.x-ball.size;
    }

    // Check score
    if (ball.x - ball.size <0) {
      cpuScore++;
      resetBall();
    }
    if (ball.x+ball.size > canvas.width) {
      playerScore++;
      resetBall();
    }

    draw();
  }

  function resetBall() {
    ball.x=canvas.width/2;
    ball.y=canvas.height/2;
    ball.vx= (Math.random()<0.5?3:-3);
    ball.vy= (Math.random()<0.5?3:-3);
  }

  function updateScore() {
    scoreEl.textContent = 'Score: Player '+playerScore+' : '+cpuScore+' CPU';
  }

  function startGame() {
    clearInterval(gameInterval);
    playerScore=0;
    cpuScore=0;
    resetBall();
    draw();
    gameInterval = setInterval(update, 30);
  }

  document.addEventListener('keydown', e=> {
    if (document.getElementById('pongModal').classList.contains('hidden')) return;
    if (e.key==='w' || e.key==='W') {
      player.dy=-5;
    } else if (e.key==='s' || e.key==='S') {
      player.dy=5;
    }
  });
  document.addEventListener('keyup', e=>{
    if (document.getElementById('pongModal').classList.contains('hidden')) return;
    if (e.key==='w' || e.key==='W' || e.key==='s' || e.key==='S') {
      player.dy=0;
    }
  });

  startBtn.addEventListener('click', startGame);
})();
