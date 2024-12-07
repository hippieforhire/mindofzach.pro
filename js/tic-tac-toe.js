const boardElement = document.getElementById("ticTacToeBoard");
let boardState, currentPlayer;

// Initialize the Tic Tac Toe game
function initializeTicTacToe() {
    // Reset board state
    boardState = Array(9).fill(null);
    currentPlayer = "X";

    // Clear the board display
    boardElement.innerHTML = "";

    // Populate the board with clickable cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("tic-tac-toe-cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleCellClick);
        boardElement.appendChild(cell);
    }
}

// Handle cell click
function handleCellClick(event) {
    const cellIndex = event.target.dataset.index;

    // If the cell is already filled, do nothing
    if (boardState[cellIndex]) return;

    // Update the board state and UI
    boardState[cellIndex] = currentPlayer;
    event.target.textContent = currentPlayer;

    // Check for a win or draw
    if (checkWin()) {
        alert(`${currentPlayer} wins!`);
        initializeTicTacToe();
    } else if (boardState.every(cell => cell)) {
        alert("It's a draw!");
        initializeTicTacToe();
    } else {
        // Switch to the other player
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
}

// Check for a win
function checkWin() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    return winningCombinations.some(combination =>
        combination.every(index => boardState[index] === currentPlayer)
    );
}
