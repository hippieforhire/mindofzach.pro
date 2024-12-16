// Simple Snake Game
// Move the snake with arrow keys. Eat food to grow and increase score.
// Press "Start" button in the modal to begin.
// No external dependencies.

(function() {
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('snakeScore');
  const startBtn = document.getElementById('startSnakeButton');

  let gridSize = 20;
  let snake = [{x:10, y:10}];
  let food = {x:15, y:15};
  let vx = 0;
  let vy = 0;
  let score = 0;
  let gameInterval = null;

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(part => {
      ctx.fillRect(part.x*gridSize, part.y*gridSize, gridSize, gridSize);
    });
    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x*gridSize, food.y*gridSize, gridSize, gridSize);
  }

  function update() {
    // Move snake
    const head = {x: snake[0].x+vx, y: snake[0].y+vy};
    if (head.x<0 || head.x>=canvas.width/gridSize || head.y<0 || head.y>=canvas.height/gridSize) {
      gameOver();
      return;
    }
    for (let i=1; i<snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        gameOver();
        return;
      }
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      updateScore();
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function placeFood() {
    food.x = Math.floor(Math.random()*(canvas.width/gridSize));
    food.y = Math.floor(Math.random()*(canvas.height/gridSize));
  }

  function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    alert('Game Over! Final Score: '+score);
  }

  function updateScore() {
    scoreEl.textContent = 'Score: ' + score;
  }

  function startGame() {
    clearInterval(gameInterval);
    snake = [{x:10, y:10}];
    vx = 0; vy = 0;
    score = 0;
    updateScore();
    placeFood();
    draw();
    gameInterval = setInterval(update, 200);
  }

  document.addEventListener('keydown', e => {
    if (document.getElementById('snakeModal').classList.contains('hidden')) return;
    if (e.key==='ArrowLeft' && vx===0) {vx=-1; vy=0;}
    else if (e.key==='ArrowRight' && vx===0) {vx=1; vy=0;}
    else if (e.key==='ArrowUp' && vy===0) {vx=0; vy=-1;}
    else if (e.key==='ArrowDown' && vy===0) {vx=0; vy=1;}
  });

  startBtn.addEventListener('click', startGame);
})();
