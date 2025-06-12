const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startGameButton");
const restartButton = document.getElementById("restartButton");
const scoreDisplay = document.getElementById("score"); // Get the score element
const gameOverMessage = document.getElementById("gameOverMessage"); // A new element for game over message

let bird, pipes, score, isGameOver, timer, gameLoopId;

// Image assets (we'll load these)
const birdImage = new Image();
birdImage.src = 'https://i.imgur.com/your-bird-image.png'; // Replace with your bird image URL (or draw it)

const pipeBodyImage = new Image();
pipeBodyImage.src = 'https://i.imgur.com/your-pipe-body-image.png'; // Replace with your pipe body image URL (or draw it)

const pipeTopImage = new Image();
pipeTopImage.src = 'https://i.imgur.com/your-pipe-top-image.png'; // Replace with your pipe top image URL (or draw it)

function initGame() {
    bird = { x: 50, y: canvas.height / 2, width: 30, height: 30, gravity: 0.6, lift: -10, velocity: 0 };
    pipes = [];
    score = 0;
    isGameOver = false;
    timer = 0;
    updateScore(); // Update the score display immediately
    scoreDisplay.style.display = "block"; // Ensure score is visible
    restartButton.style.display = "none"; // Hide restart button at start
    gameOverMessage.style.display = "none"; // Hide game over message
}

function startGame() {
    // Fixed canvas size and scale to fit
    canvas.width = 800;
    canvas.height = 400;
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    initGame();
    canvas.style.display = "block";
    startButton.style.display = "none"; // Hide start button once game starts
    canvas.addEventListener("click", startMovement);
    canvas.addEventListener("touchstart", startMovement, { passive: false });
}

function stopGame() {
    cancelAnimationFrame(gameLoopId);
    window.removeEventListener("click", birdFlap);
    window.removeEventListener("touchstart", birdFlap);
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
    drawBackground(); // Draw background first
    drawPipes(); // Draw pipes second
    drawBird(); // Draw bird last so it's on top of everything

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Boundary conditions for bird
    if (bird.y + bird.height > canvas.height * 0.75) { // Ground collision
        bird.y = canvas.height * 0.75 - bird.height; // Place bird on ground
        endGame();
    } else if (bird.y < 0) { // Top collision
        bird.y = 0; // Keep bird at the top
        bird.velocity = 0; // Stop upward movement
    }

    updatePipes();
    checkCollisions();
    timer++;
    gameLoopId = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.75);
    skyGradient.addColorStop(0, "#87CEEB"); // Light blue
    skyGradient.addColorStop(1, "#B0E0E6"); // Powder blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.75);

    // Sun
    ctx.fillStyle = "#FFD700"; // Gold
    ctx.beginPath();
    ctx.arc(canvas.width - 70, 70, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Clouds
    ctx.fillStyle = "#FFFFFF";
    drawCloud(100, 100, 1.2);
    drawCloud(250, 50, 0.8);
    drawCloud(400, 130, 1.0);
    drawCloud(600, 80, 1.5);

    // Ground
    ctx.fillStyle = "#556B2F"; // Darker green for ground base
    ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);

    // Ground texture (grass)
    ctx.fillStyle = "#228B22"; // Forest green
    for (let i = 0; i < canvas.width; i += 10) {
        ctx.fillRect(i, canvas.height * 0.75, 5, 5);
        ctx.fillRect(i + 5, canvas.height * 0.75 + 5, 5, 5);
    }
}

function drawCloud(x, y, scale) {
    ctx.beginPath();
    ctx.arc(x, y, 20 * scale, 0, 2 * Math.PI);
    ctx.arc(x + 25 * scale, y + 10 * scale, 25 * scale, 0, 2 * Math.PI);
    ctx.arc(x + 50 * scale, y * scale, 20 * scale, 0, 2 * Math.PI);
    ctx.arc(x + 30 * scale, y - 10 * scale, 15 * scale, 0, 2 * Math.PI);
    ctx.fill();
}

function drawBird() {
    // If you have a bird image, uncomment and use this:
    // ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    // Otherwise, draw a stylized bird
    ctx.fillStyle = "orange"; // Body color
    ctx.beginPath();
    ctx.ellipse(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "darkorange"; // Wing
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height / 4);
    ctx.lineTo(bird.x + bird.width * 1.5, bird.y + bird.height / 2);
    ctx.lineTo(bird.x + bird.width, bird.y + bird.height * 0.75);
    ctx.fill();

    ctx.fillStyle = "black"; // Eye
    ctx.beginPath();
    ctx.arc(bird.x + bird.width * 0.7, bird.y + bird.height * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "yellow"; // Beak
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width, bird.y + bird.height * 0.4);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height * 0.5);
    ctx.lineTo(bird.x + bird.width, bird.y + bird.height * 0.6);
    ctx.fill();
}

function updatePipes() {
    const pipeWidth = 70; // Slightly wider pipes
    const gap = 120; // Slightly smaller gap for more challenge
    const minPipeHeight = 80; // Minimum height for the top pipe
    const maxPipeHeight = Math.floor((canvas.height * 0.75) - gap - minPipeHeight);

    if (timer % 120 === 0 && !isGameOver) { // Spawn pipes less frequently
        const pipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
        pipes.push({ x: canvas.width, y: pipeHeight, gap: gap, width: pipeWidth, passed: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2.5; // Slightly slower pipe movement
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score++;
            updateScore();
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
        ctx.fillStyle = "darkgreen"; // Shading
        ctx.fillRect(pipe.x, 0, pipe.width * 0.1, pipe.y); // Left edge shading
        ctx.fillRect(pipe.x + pipe.width * 0.9, 0, pipe.width * 0.1, pipe.y); // Right edge shading

        // Draw top pipe cap
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x - 5, pipe.y - 20, pipe.width + 10, 20); // Wider cap
        ctx.fillStyle = "darkgreen";
        ctx.fillRect(pipe.x - 5, pipe.y - 20, (pipe.width + 10) * 0.1, 20);
        ctx.fillRect(pipe.x + (pipe.width + 10) * 0.9, pipe.y - 20, (pipe.width + 10) * 0.1, 20);


        // Draw bottom pipe
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, canvas.height - (pipe.y + pipe.gap));
        ctx.fillStyle = "darkgreen"; // Shading
        ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width * 0.1, canvas.height - (pipe.y + pipe.gap));
        ctx.fillRect(pipe.x + pipe.width * 0.9, pipe.y + pipe.gap, pipe.width * 0.1, canvas.height - (pipe.y + pipe.gap));

        // Draw bottom pipe cap
        ctx.fillStyle = "green";
        ctx.fillRect(pipe.x - 5, pipe.y + pipe.gap, pipe.width + 10, 20); // Wider cap
        ctx.fillStyle = "darkgreen";
        ctx.fillRect(pipe.x - 5, pipe.y + pipe.gap, (pipe.width + 10) * 0.1, 20);
        ctx.fillRect(pipe.x + (pipe.width + 10) * 0.9, pipe.y + pipe.gap, (pipe.width + 10) * 0.1, 20);
    });
}

function checkCollisions() {
    pipes.forEach(pipe => {
        // Check for collision with pipe body
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
            if (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipe.gap) {
                endGame();
            }
        }
        // Check for collision with top pipe cap
        if (bird.x + bird.width > pipe.x - 5 && bird.x < pipe.x + pipe.width + 5) {
            if (bird.y < pipe.y && bird.y + bird.height > pipe.y - 20) {
                endGame();
            }
        }
        // Check for collision with bottom pipe cap
        if (bird.x + bird.width > pipe.x - 5 && bird.x < pipe.x + pipe.width + 5) {
            if (bird.y < pipe.y + pipe.gap + 20 && bird.y + bird.height > pipe.y + pipe.gap) {
                endGame();
            }
        }
    });
}

function endGame() {
    isGameOver = true;
    stopGame(); // Ensure game loop stops
    scoreDisplay.style.display = "none"; // Hide score during game over screen
    gameOverMessage.textContent = `Game Over! Your Score: ${score}`;
    gameOverMessage.style.display = "block"; // Show game over message
    restartButton.style.display = "block"; // Show restart button

    canvas.removeEventListener("click", tryRestartAfterGameOver); // Prevent multiple listeners
    canvas.removeEventListener("touchstart", tryRestartAfterGameOver);
}

function tryRestartAfterGameOver(event) {
    event.preventDefault();
    if (isGameOver) {
        canvas.removeEventListener("click", tryRestartAfterGameOver);
        canvas.removeEventListener("touchstart", tryRestartAfterGameOver);
        restartGame();
    }
}

function restartGame() {
    initGame();
    // Re-add event listeners for starting movement only after init
    canvas.addEventListener("click", startMovement);
    canvas.addEventListener("touchstart", startMovement, { passive: false });
    // Hide game over message and show score
    gameOverMessage.style.display = "none";
    scoreDisplay.style.display = "block";
    restartButton.style.display = "none"; // Hide restart button again until game over
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

// Initial setup on page load
window.onload = () => {
    // Ensure the initial display states are correct
    canvas.style.display = "none"; // Hide canvas until game starts
    restartButton.style.display = "none"; // Hide restart button
    scoreDisplay.style.display = "none"; // Hide score
    gameOverMessage.style.display = "none"; // Hide game over message
};
