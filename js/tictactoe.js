// New tictactoe.js code (no dashes in file name)
// Ensure you have <script src="js/tictactoe.js"></script> in your HTML

const ticBoardElement = document.getElementById("ticTacToeBoard");
let ticBoardState, ticCurrentPlayer;

function initializeTicTacToe() {
    if (!ticBoardElement) {
        console.error("Error: Tic Tac Toe board element not found.");
        return;
    }

    ticBoardState = Array(9).fill(null);
    ticCurrentPlayer = "X";

    ticBoardElement.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("tic-tac-toe-cell");
        cell.dataset.index = i;
        cell.addEventListener("click", ticHandleCellClick);
        ticBoardElement.appendChild(cell);
    }
}

function ticHandleCellClick(event) {
    const cellIndex = event.target.dataset.index;

    // If cell is already taken, do nothing
    if (ticBoardState[cellIndex]) return;

    ticBoardState[cellIndex] = ticCurrentPlayer;
    event.target.textContent = ticCurrentPlayer;

    if (ticCheckWin()) {
        alert(`${ticCurrentPlayer} wins!`);
        initializeTicTacToe();
    } else if (ticBoardState.every(cell => cell)) {
        alert("It's a draw!");
        initializeTicTacToe();
    } else {
        ticCurrentPlayer = (ticCurrentPlayer === "X") ? "O" : "X";
    }
}

function ticCheckWin() {
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
        combination.every(index => ticBoardState[index] === ticCurrentPlayer)
    );
}
