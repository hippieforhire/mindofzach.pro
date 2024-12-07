/* Style for the Tic Tac Toe board */
#ticTacToeBoard {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
    max-width: 300px;
    margin: 0 auto;
}

/* Style for individual cells */
.tic-tac-toe-cell {
    width: 100px;
    height: 100px;
    background-color: #4a5568;
    color: #f7fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    border: 1px solid #2d3748;
    cursor: pointer;
}

.tic-tac-toe-cell:hover {
    background-color: #2d3748;
}
