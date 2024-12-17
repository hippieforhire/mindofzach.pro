(function() {
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('snakeScore');
  const startBtn = document.getElementById('startSnakeButton');

  const upBtn = document.getElementById('snakeUp');
  const downBtn = document.getElementById('snakeDown');
  const leftBtn = document.getElementById('snakeLeft');
  const rightBtn = document.getElementById('snakeRight');

  canvas.width = 400;
  canvas.height = 400;

  let gridSize=20;
  let snake=[{x:10,y:10}];
  let food={x:15,y:15,special:false};
  let vx=0;
  let vy=0;
  let score=0;
  // Make it faster for smoother feel
  let speed=73;
  let gameInterval=null;

  function draw(){
    const hue=(score*30)%360;
    ctx.fillStyle=`hsl(${hue},70%,20%)`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle='lime';
    snake.forEach(part=>{
      ctx.fillRect(part.x*gridSize,part.y*gridSize,gridSize,gridSize);
    });

    ctx.fillStyle=food.special?'#FFD700':'red';
    ctx.fillRect(food.x*gridSize,food.y*gridSize,gridSize,gridSize);
  }

  function update(){
    const head={x:snake[0].x+vx,y:snake[0].y+vy};

    if(head.x<0||head.x>=canvas.width/gridSize||head.y<0||head.y>=canvas.height/gridSize){
      gameOver();
      return;
    }
    for(let i=1;i<snake.length;i++){
      if(snake[i].x===head.x&&snake[i].y===head.y){
        gameOver();
        return;
      }
    }
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){
      score+=(food.special?3:1);
      updateScore();
      placeFood();
    }else{
      snake.pop();
    }
    draw();
  }

  function placeFood(){
    let validPosition=false;
    while(!validPosition){
      food.x=Math.floor(Math.random()*(canvas.width/gridSize));
      food.y=Math.floor(Math.random()*(canvas.height/gridSize));
      food.special=(Math.random()<0.2);
      validPosition=true;
      for(let i=0;i<snake.length;i++){
        if(snake[i].x===food.x&&snake[i].y===food.y){
          validPosition=false;
          break;
        }
      }
    }
  }

  function gameOver(){
    clearInterval(gameInterval);
    gameInterval=null;
    alert('Game Over! Final Score: '+score);
  }

  function updateScore(){
    scoreEl.textContent='Score: '+score;
  }

  function startGame(){
    clearInterval(gameInterval);
    snake=[{x:10,y:10}];
    vx=0;vy=0;
    score=0;
    speed=100; 
    updateScore();
    placeFood();
    draw();
    gameInterval=setInterval(update,speed);
  }

  document.addEventListener('keydown',e=>{
    if(document.getElementById('snakeCanvas')==null)return;
    if(e.key==='ArrowLeft'&&vx===0){vx=-1;vy=0;}
    else if(e.key==='ArrowRight'&&vx===0){vx=1;vy=0;}
    else if(e.key==='ArrowUp'&&vy===0){vx=0;vy=-1;}
    else if(e.key==='ArrowDown'&&vy===0){vx=0;vy=1;}
  });

  function goUp(){if(vy===0){vx=0;vy=-1;}}
  function goDown(){if(vy===0){vx=0;vy=1;}}
  function goLeft(){if(vx===0){vx=-1;vy=0;}}
  function goRight(){if(vx===0){vx=1;vy=0;}}

  upBtn.addEventListener('click',goUp);
  downBtn.addEventListener('click',goDown);
  leftBtn.addEventListener('click',goLeft);
  rightBtn.addEventListener('click',goRight);

  upBtn.addEventListener('touchstart',goUp,{passive:true});
  downBtn.addEventListener('touchstart',goDown,{passive:true});
  leftBtn.addEventListener('touchstart',goLeft,{passive:true});
  rightBtn.addEventListener('touchstart',goRight,{passive:true});

  startBtn.addEventListener('click',startGame);
})();
