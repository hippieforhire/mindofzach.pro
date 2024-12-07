const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let bird, pipes, score, isGameOver, timer, gameLoopId;

// Initialize game variables
function initGame() {
    bird = {
        x: 50,
        y: canvas.height / 2,
        width: 30,
        height: 30,
        gravity: 0.6,
        lift: -10,
        velocity: 0,
    };
    pipes = [];
    score = 0;
    isGameOver = false;
    timer = 0;
    updateScore();
    canvas.addEventListener("click", birdFlap);
    canvas.addEventListener("touchstart", birdFlap, { passive: false });
}

// Resize canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Start the game loop
function startGame() {
    resizeCanvas();
    initGame();
    gameLoop();
}

// Handle bird flap when the canvas is tapped/clicked
function birdFlap(event) {
    event.preventDefault();
    if (isGameOver) {
        startGame(); // Restart the game on tap if it's game over
    } else {
        bird.velocity = bird.lift; // Make the bird flap
    }
}

// Main game loop
function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    updateBird();
    drawBird();
    updatePipes();
    drawPipes();
    checkCollisions();
    timer++;
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Update bird position and handle ground collision
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Prevent bird from dragging on the ground
    if (bird.y + bird.height >= canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
        endGame();
    }

    // Prevent bird from flying off the top of the screen
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

// Draw the bird
function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Generate and update pipes
function updatePipes() {
    if (timer % 100 === 0 && !isGameOver) {
        const pipeHeight = Math.floor(Math.random() * (canvas.height / 2)) + 50;
        const gap = 150; // Space between top and bottom pipes
        pipes.push({ x: canvas.width, y: pipeHeight, gap });
    }

    pipes.forEach(pipe => {
        pipe.x -= 3; // Move pipes left
        if (pipe.x + 50 === bird.x) {
            score++;
            updateScore();
        }
    });

    // Remove pipes that move off screen
    pipes = pipes.filter(pipe => pipe.x + 50 > 0);
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, 50, pipe.y);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.y + pipe.gap, 50, canvas.height - pipe.y - pipe.gap);
    });
}

// Check for collisions between bird and pipes
function checkCollisions() {
    pipes.forEach(pipe => {
        if (
            bird.x < pipe.x + 50 &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipe.gap)
        ) {
            endGame();
        }
    });
}

// Handle game over logic
function endGame() {
    isGameOver = true;
    document.getElementById("score").textContent += " - Game Over!";
    canvas.removeEventListener("click", birdFlap);
    canvas.removeEventListener("touchstart", birdFlap);
}

// Update score display
function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
}

// Initialize canvas and start the game
resizeCanvas();
canvas.addEventListener("click", birdFlap);
canvas.addEventListener("touchstart", birdFlap, { passive: false });
startGame();
