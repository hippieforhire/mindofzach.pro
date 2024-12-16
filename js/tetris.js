// Tetris game implementation with no external dependencies.
// This file creates a Tetris game on the canvas #tetrisCanvas.
// Press arrow keys to move/rotate the tetromino, and down arrow to drop faster.
// "Start" button begins the game, "Close" button closes the modal.
// Score updates as lines are cleared.

// Ensure no conflicts with existing code: We use only our own variables and functions.

(function() {
  const canvas = document.getElementById('tetrisCanvas');
  const context = canvas.getContext('2d');
  const scoreElement = document.getElementById('tetrisScore');
  const startButton = document.getElementById('startTetrisButton');

  // Scale for blocks
  const scale = 20;
  context.scale(scale, scale);

  let animationId = null;
  let dropCounter = 0;
  let dropInterval = 1000; // ms
  let lastTime = 0;
  let score = 0;
  let arena = createMatrix(12, 20);
  let player = {
    pos: {x: 0, y: 0},
    matrix: null,
  };

  const pieces = 'TJLOSZI';
  const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
  ];

  // Create a matrix for shapes
  function createMatrix(w, h) {
    const matrix = [];
    for (let i = 0; i < h; i++) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  // Different tetromino shapes
  function createPiece(type) {
    if (type === 'T') {
      return [
        [0,1,0],
        [1,1,1],
        [0,0,0],
      ];
    } else if (type === 'O') {
      return [
        [1,1],
        [1,1],
      ];
    } else if (type === 'L') {
      return [
        [0,2,0],
        [0,2,0],
        [0,2,2],
      ];
    } else if (type === 'J') {
      return [
        [0,3,0],
        [0,3,0],
        [3,3,0],
      ];
    } else if (type === 'S') {
      return [
        [0,4,4],
        [4,4,0],
        [0,0,0],
      ];
    } else if (type === 'Z') {
      return [
        [5,5,0],
        [0,5,5],
        [0,0,0],
      ];
    } else if (type === 'I') {
      return [
        [0,6,0,0],
        [0,6,0,0],
        [0,6,0,0],
        [0,6,0,0],
      ];
    }
  }

  function playerReset() {
    const piece = pieces[pieces.length * Math.random() | 0];
    player.matrix = createPiece(piece);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - 
                    (player.matrix[0].length / 2 | 0);

    // If immediately colliding on reset, game over
    if (collide(arena, player)) {
      arena.forEach(row => row.fill(0));
      score = 0;
      updateScore();
    }
  }

  function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] !== 0 &&
           (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; y--) {
      for (let x = 0; x < arena[y].length; x++) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      y++;
      score += rowCount * 10;
      rowCount *= 2;
    }
  }

  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }

    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  }

  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  function draw() {
    context.fillStyle = '#000';
    context.fillRect(0,0, canvas.width/scale, canvas.height/scale);
    drawMatrix(arena, {x:0,y:0});
    drawMatrix(player.matrix, player.pos);
  }

  function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }
    draw();
    animationId = requestAnimationFrame(update);
  }

  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      arenaSweep();
      updateScore();
      playerReset();
    }
    dropCounter = 0;
  }

  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
      player.pos.x -= dir;
    }
  }

  function updateScore() {
    scoreElement.textContent = 'Score: ' + score;
  }

  // Key controls
  function keyListener(e) {
    if (document.getElementById("tetrisModal").classList.contains("hidden")) {
      return; // Only respond if modal is visible
    }
    if (e.type === 'keydown') {
      if (e.key === 'ArrowLeft') {
        playerMove(-1);
      } else if (e.key === 'ArrowRight') {
        playerMove(1);
      } else if (e.key === 'ArrowDown') {
        playerDrop();
      } else if (e.key === 'ArrowUp') {
        playerRotate(1);
      }
    }
  }

  document.addEventListener('keydown', keyListener);

  // Start button
  startButton.addEventListener('click', () => {
    // Reset arena and player
    arena = createMatrix(12, 20);
    score = 0;
    updateScore();
    playerReset();
    cancelAnimationFrame(animationId);
    lastTime = 0;
    dropCounter = 0;
    update();
  });

  // The game starts when start is clicked, and stops updating when modal closed.
  // Close function defined in index.html just hides modal.
  // When re-opened, user can click Start again to restart the game.

})();
