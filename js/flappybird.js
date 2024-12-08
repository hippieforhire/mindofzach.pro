const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startGameButton");
const restartButton = document.getElementById("restartButton");
let bird, pipes, score, isGameOver, timer, gameLoopId;

function initGame() {
    bird = { x: 50, y: canvas.height / 2, width: 30, height: 30, gravity: 0.6, lift: -10, velocity: 0 };
    pipes = [];
    score = 0;
    isGameOver = false;
    timer = 0;
    updateScore();
    document.getElementById("score").style.display = "block";
    restartButton.style.display = "none";
}

function startGame() {
    resizeCanvas();
    initGame();
    canvas.style.display = "block";
    restartButton.style.display = "none";
    canvas.addEventListener("click", startMovement);
    canvas.addEventListener("touchstart", startMovement, { passive: false });
}

function stopGame() {
    cancelAnimationFrame(gameLoopId);
    window.removeEventListener("click", birdFlap);
    window.removeEventListener("touchstart", birdFlap);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startMovement(event) {
    event.preventDefault();
    window.addEventListener("click", birdFlap);
    window.addEventListener("touchstart", birdFlap, { passive: false });
    gameLoop();
    canvas.removeEventListener("click", startMovement);
    canvas.removeEventListener("touchstart", startMovement);
}

function birdFlap(event) {
    event.preventDefault();
    bird.velocity = bird.lift;
}

function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // End the game if the bird hits the grass line or goes above the top.
    if (bird.y + bird.height > canvas.height * 0.75 || bird.y < 0) {
        endGame();
    }

    drawBird();
    updatePipes();
    drawPipes();
    checkCollisions();
    // Note: Score now increments only when passing pipes, no continuous increment here.
    timer++;
    gameLoopId = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    ctx.fillStyle = "#87CEEB"; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.75);
    ctx.fillStyle = "#228B22"; // Grassy green
    ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);
    ctx.fillStyle = "#FFD700"; // Sun yellow
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 50, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF"; // Cloud white
    drawCloud(100, 100);
    drawCloud(200, 150);
    drawCloud(300, 120);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.arc(x + 25, y + 10, 25, 0, 2 * Math.PI);
    ctx.arc(x + 50, y, 20, 0, 2 * Math.PI);
    ctx.fill();
}

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function updatePipes() {
    const gap = 150;
    // Generate pipes less frequently to space them further apart horizontally
    if (timer % 90 === 0 && !isGameOver) {
        // Keep top and bottom pipe height logic as before
        const maxPipeHeight = Math.floor((canvas.height * 0.75) - gap - 50);
        const pipeHeight = Math.floor(Math.random() * maxPipeHeight) + 50;
        // Add a 'passed' property to track scoring
        pipes.push({ x: canvas.width, y: pipeHeight, gap: gap, passed: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 3;

        // Check if the bird has passed this pipe to increment score by 1
        if (!pipe.passed && (bird.x > pipe.x + 50)) {
            pipe.passed = true;
            score++;
            updateScore();
        }
    });

    pipes = pipes.filter(pipe => pipe.x + 50 > 0);
}

function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, 50, pipe.y);
        // Bottom pipe remains above grass line due to pipe height calculation
        ctx.fillRect(pipe.x, pipe.y + pipe.gap, 50, canvas.height - (pipe.y + pipe.gap));
    });
}

function checkCollisions() {
    pipes.forEach(pipe => {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + 50) {
            if (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipe.gap) {
                endGame();
            }
        }
    });
}

function endGame() {
    isGameOver = true;
    window.removeEventListener("click", birdFlap);
    window.removeEventListener("touchstart", birdFlap);
    // Add the requested "Tap to Restart" text
    // Using a newline to help fit on screen better
    document.getElementById("score").textContent += " - Game Over!\nTap to Restart!";
    restartButton.style.display = "block";
}

function restartGame() {
    initGame();
    canvas.addEventListener("click", startMovement);
    canvas.addEventListener("touchstart", startMovement);
}

function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
