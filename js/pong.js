(function(){
  const canvas=document.getElementById('pongCanvas');
  const ctx=canvas.getContext('2d');
  const scoreEl=document.getElementById('pongScore');
  const startBtn=document.getElementById('startPongButton');

  const upBtn=document.getElementById('pongUp');
  const downBtn=document.getElementById('pongDown');

  let player={x:10,y:0,width:10,height:60,dy:0};
  let cpu={x:0,y:0,width:10,height:60};
  let ball={x:0,y:0,vx:3,vy:3,size:8};

  let playerScore=0;
  let cpuScore=0;
  let gameInterval=null;
  let level=1;
  let cpuSpeed=2.5;
  let powerUpActive=false;
  let powerUpTimer=0;

  function resetPositions(){
    player.y=canvas.height/2 - player.height/2;
    cpu.x=canvas.width-20;
    cpu.y=canvas.height/2 - cpu.height/2;
    ball.x=canvas.width/2;
    ball.y=canvas.height/2;
    ball.vx=(Math.random()<0.5?3:-3);
    ball.vy=(Math.random()<0.5?3:-3);
  }

  function draw(){
    const hue=(level*60)%360;
    ctx.fillStyle=`hsl(${hue},50%,10%)`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle='white';
    ctx.fillRect(player.x,player.y,player.width,player.height);

    let cpuColor=`hsl(${(level*80)%360},80%,50%)`;
    ctx.fillStyle=cpuColor;
    ctx.fillRect(cpu.x,cpu.y,cpu.width,cpu.height);

    ctx.fillStyle='white';
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.size,0,Math.PI*2);
    ctx.fill();

    updateScore();
  }

  function update(){
    player.y+=player.dy;
    if(player.y<0)player.y=0;
    if(player.y+player.height>canvas.height)player.y=canvas.height-player.height;

    if(ball.y<cpu.y+cpu.height/2) cpu.y-=cpuSpeed;
    else if(ball.y>cpu.y+cpu.height/2) cpu.y+=cpuSpeed;
    if(cpu.y<0) cpu.y=0;
    if(cpu.y+cpu.height>canvas.height) cpu.y=canvas.height-cpu.height;

    ball.x+=ball.vx;
    ball.y+=ball.vy;
    if(ball.y-ball.size<0||ball.y+ball.size>canvas.height){
      ball.vy=-ball.vy;
    }

    if(ball.x-ball.size<player.x+player.width && ball.y>player.y && ball.y<player.y+player.height){
      ball.vx=-ball.vx;
      ball.x=player.x+player.width+ball.size;
    }
    if(ball.x+ball.size>cpu.x && ball.y>cpu.y && ball.y<cpu.y+cpu.height){
      ball.vx=-ball.vx;
      ball.x=cpu.x-ball.size;
    }

    if(ball.x - ball.size <0){
      cpuScore++;
      resetPositions();
      checkWin();
    }
    if(ball.x+ball.size>canvas.width){
      playerScore++;
      resetPositions();
      checkWin();
    }

    if(powerUpActive){
      powerUpTimer--;
      if(powerUpTimer<=0){
        powerUpActive=false;
      }
    }

    draw();
  }

  function checkWin(){
    if(playerScore>=5){
      levelUp(true);
    }else if(cpuScore>=5){
      levelUp(false);
    }else{
      maybeActivatePowerUp();
    }
  }

  function maybeActivatePowerUp(){
    if(Math.random()<0.3&&!powerUpActive){
      powerUpActive=true;
      powerUpTimer=300;
      player.height=100;
    }
  }

  function levelUp(playerWon){
    if(playerWon){
      alert("You win this round! Moving to next level...");
      level++;
      cpuScore=0;
      playerScore=0;
      cpuSpeed+=0.5;
      resetPositions();
      maybeActivatePowerUp();
    }else{
      alert("CPU wins! Try again at level "+level);
      level=1;
      cpuScore=0;
      playerScore=0;
      cpuSpeed=2.5;
      resetPositions();
      maybeActivatePowerUp();
    }
  }

  function updateScore(){
    scoreEl.textContent='Score: Player '+playerScore+' : '+cpuScore+' CPU';
  }

  function startGame(){
    clearInterval(gameInterval);
    playerScore=0;
    cpuScore=0;
    level=1;
    cpuSpeed=2.5;
    powerUpActive=false;
    powerUpTimer=0;
    resetPositions();
    draw();
    gameInterval=setInterval(update,30);
  }

  document.addEventListener('keydown',e=>{
    if(document.getElementById('pongModal').classList.contains('hidden'))return;
    if(e.key==='w'||e.key==='W'){
      player.dy=-5;
    }else if(e.key==='s'||e.key==='S'){
      player.dy=5;
    }
  });
  document.addEventListener('keyup',e=>{
    if(document.getElementById('pongModal').classList.contains('hidden'))return;
    if(e.key==='w'||e.key==='W'||e.key==='s'||e.key==='S'){
      player.dy=0;
    }
  });

  upBtn.addEventListener('mousedown',()=>{player.dy=-5;});
  upBtn.addEventListener('touchstart',()=>{player.dy=-5;},{passive:true});
  downBtn.addEventListener('mousedown',()=>{player.dy=5;});
  downBtn.addEventListener('touchstart',()=>{player.dy=5;},{passive:true});

  upBtn.addEventListener('mouseup',()=>{player.dy=0;});
  upBtn.addEventListener('touchend',()=>{player.dy=0;},{passive:true});
  upBtn.addEventListener('touchcancel',()=>{player.dy=0;},{passive:true});

  downBtn.addEventListener('mouseup',()=>{player.dy=0;});
  downBtn.addEventListener('touchend',()=>{player.dy=0;},{passive:true});
  downBtn.addEventListener('touchcancel',()=>{player.dy=0;},{passive:true});

  startBtn.addEventListener('click',startGame);
})();
