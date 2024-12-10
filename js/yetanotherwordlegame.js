// yetanotherwordle.js

document.addEventListener('DOMContentLoaded', () => {
  const wordleModal = document.getElementById('wordleModal');
  const wordleBoard = document.getElementById('wordleBoard');
  const wordleInput = document.getElementById('wordleInput');
  const wordleMessage = document.getElementById('wordleMessage');
  const startWordleButton = document.getElementById('startWordleButton');
  const powerUpButton = document.getElementById('powerUpButton');
  const wordleKeyboard = document.getElementById('wordleKeyboard');

  // Configuration for the game
  const dailyGames = {
    "2024-12-09": {
      theme: "Famous Movies",
      words: ["alien", "psycho", "titanic"]
    },
    "2024-12-10": {
      theme: "Famous Bands",
      words: ["queen", "weezer", "nirvana"]
    },
    "2024-12-11": {
      theme: "Country or State Capitals",
      words: ["texas", "berlin", "jakarta"]
    },
    "2024-12-12": {
      theme: "Common Cat Names",
      words: ["salem", "oliver", "smokey"]
    },
    "2024-12-13": {
      theme: "Car Types/Models",
      words: ["civic", "accord", "mustang"]
    },
    "2024-12-14": {
      theme: "Common Dog Names",
      words: ["buddy", "bailey", "charlie"]
    },
    "2024-12-15": {
      theme: "American Cuisine",
      words: ["cajun", "burger", "hotdogs"]
    }
  };

  let currentDate = getCurrentDate();
  let gameData = dailyGames[currentDate];

  if (!gameData) {
    wordleMessage.textContent = "No game available for today.";
    wordleInput.disabled = true;
    powerUpButton.disabled = true;
    return;
  }

  const { theme, words } = gameData;
  let currentRound = 0; // 0,1,2 for rounds 1,2,3
  let totalRounds = 3;
  let usedPowerUp = false;
  let extraGuess = false;
  let revealLetter = false;
  let secretWord = words[currentRound].toLowerCase();
  let wordLength = secretWord.length;
  let maxGuesses = 6;
  let guesses = [];
  let currentGuess = '';

  // Initialize the game
  function initializeWordleGame() {
    currentRound = 0;
    usedPowerUp = false;
    extraGuess = false;
    revealLetter = false;
    secretWord = words[currentRound].toLowerCase();
    wordLength = secretWord.length;
    maxGuesses = 6;
    guesses = [];
    currentGuess = '';
    wordleMessage.textContent = `Theme: ${theme}`;
    createBoard();
    createKeyboard();
    wordleInput.disabled = false;
    wordleInput.value = '';
    wordleInput.focus();
    powerUpButton.disabled = false;
    powerUpButton.textContent = "Use Power-Up";
    updateKeyboard();
  }

  // Create the Wordle Board
  function createBoard() {
    wordleBoard.innerHTML = '';
    for (let i = 0; i < maxGuesses; i++) {
      const row = document.createElement('div');
      row.classList.add('wordle-row');
      for (let j = 0; j < wordLength; j++) {
        const cell = document.createElement('div');
        cell.classList.add('wordle-cell');
        row.appendChild(cell);
      }
      wordleBoard.appendChild(row);
    }
  }

  // Create the On-Screen Keyboard
  function createKeyboard() {
    const keys = [
      'Q','W','E','R','T','Y','U','I','O','P',
      'A','S','D','F','G','H','J','K','L',
      'Z','X','C','V','B','N','M'
    ];
    wordleKeyboard.innerHTML = '';
    keys.forEach(key => {
      const keyButton = document.createElement('div');
      keyButton.classList.add('wordle-key');
      keyButton.textContent = key;
      keyButton.addEventListener('click', () => handleKeyPress(key));
      wordleKeyboard.appendChild(keyButton);
    });
  }

  // Update Keyboard based on guesses
  function updateKeyboard() {
    guesses.forEach(guess => {
      guess.forEach((letter, index) => {
        const key = letter.toUpperCase();
        const keyButton = Array.from(wordleKeyboard.children).find(btn => btn.textContent === key);
        if (keyButton) {
          const cell = wordleBoard.children[guess.row].children[index];
          if (cell.classList.contains('correct')) {
            keyButton.classList.add('correct');
          } else if (cell.classList.contains('present')) {
            if (!keyButton.classList.contains('correct')) {
              keyButton.classList.add('present');
            }
          } else {
            if (!keyButton.classList.contains('correct') && !keyButton.classList.contains('present')) {
              keyButton.classList.add('absent');
            }
          }
        }
      });
    });
  }

  // Handle Keyboard Input
  wordleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitGuess();
    } else if (e.key === 'Backspace') {
      currentGuess = currentGuess.slice(0, -1);
      updateBoardUI();
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < wordLength) {
      currentGuess += e.key.toUpperCase();
      updateBoardUI();
    }
  });

  // Handle On-Screen Keyboard Click
  function handleKeyPress(key) {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      currentGuess = currentGuess.slice(0, -1);
      updateBoardUI();
    } else {
      if (currentGuess.length < wordLength) {
        currentGuess += key.toUpperCase();
        updateBoardUI();
      }
    }
  }

  // Update the Board UI with current guess
  function updateBoardUI() {
    const currentRow = wordleBoard.children[guesses.length];
    Array.from(currentRow.children).forEach((cell, index) => {
      cell.textContent = currentGuess[index] || '';
    });
  }

  // Submit the current guess
  function submitGuess() {
    if (currentGuess.length !== wordLength) {
      wordleMessage.textContent = `Please enter a ${wordLength}-letter word.`;
      return;
    }
    if (!isValidWord(currentGuess.toLowerCase())) {
      wordleMessage.textContent = "Word not in list.";
      return;
    }

    // Process the guess
    const feedback = getFeedback(currentGuess.toLowerCase());
    guesses.push({ guess: currentGuess.toLowerCase(), feedback });
    updateBoardColors(feedback);
    updateKeyboard();
    currentGuess = '';
    updateBoardUI();
    wordleMessage.textContent = '';

    // Check for win
    if (currentGuess.toLowerCase() === secretWord) {
      wordleMessage.textContent = "Congratulations! You've guessed the word!";
      wordleInput.disabled = true;
      powerUpButton.disabled = true;
      saveGameState(true);
      return;
    }

    // Check for loss
    if (guesses.length === maxGuesses) {
      wordleMessage.textContent = `You've run out of guesses! The word was "${secretWord.toUpperCase()}".`;
      wordleInput.disabled = true;
      powerUpButton.disabled = true;
      saveGameState(false);
      return;
    }
  }

  // Get feedback for a guess
  function getFeedback(guess) {
    const feedback = Array(wordLength).fill('absent');
    const secretArr = secretWord.split('');

    // First pass for correct letters
    for (let i = 0; i < wordLength; i++) {
      if (guess[i] === secretArr[i]) {
        feedback[i] = 'correct';
        secretArr[i] = null;
      }
    }

    // Second pass for present letters
    for (let i = 0; i < wordLength; i++) {
      if (feedback[i] === 'correct') continue;
      const index = secretArr.indexOf(guess[i]);
      if (index !== -1) {
        feedback[i] = 'present';
        secretArr[index] = null;
      }
    }

    return feedback;
  }

  // Update the board colors based on feedback
  function updateBoardColors(feedback) {
    const currentRow = wordleBoard.children[guesses.length - 1];
    Array.from(currentRow.children).forEach((cell, index) => {
      cell.classList.add(feedback[index]);
    });
  }

  // Placeholder for word validation (can be replaced with actual dictionary check)
  function isValidWord(word) {
    // For demonstration, assuming all words in the dailyGames are valid
    return dailyGames[currentDate].words.includes(word);
  }

  // Power-Up Functionality
  powerUpButton.addEventListener('click', () => {
    if (usedPowerUp) {
      wordleMessage.textContent = "You have already used your power-up for today.";
      return;
    }

    // Present options to the user
    const powerUpChoice = prompt("Choose a Power-Up:\n1. Reveal a Letter\n2. Get an Extra Guess");

    if (powerUpChoice === '1') {
      revealLetterFunction();
      usedPowerUp = true;
    } else if (powerUpChoice === '2') {
      getExtraGuessFunction();
      usedPowerUp = true;
    } else {
      wordleMessage.textContent = "Invalid Power-Up choice.";
    }
  });

  function revealLetterFunction() {
    // Find a letter in the secret word that hasn't been revealed yet
    for (let i = 0; i < wordLength; i++) {
      const cell = wordleBoard.children[guesses.length].children[i];
      if (cell.textContent === '') {
        cell.textContent = secretWord[i].toUpperCase();
        cell.classList.add('correct');
        // Update keyboard
        const key = secretWord[i].toUpperCase();
        const keyButton = Array.from(wordleKeyboard.children).find(btn => btn.textContent === key);
        if (keyButton) {
          keyButton.classList.add('correct');
        }
        break;
      }
    }
  }

  function getExtraGuessFunction() {
    maxGuesses += 1;
    // Add an extra row to the board
    const row = document.createElement('div');
    row.classList.add('wordle-row');
    for (let j = 0; j < wordLength; j++) {
      const cell = document.createElement('div');
      cell.classList.add('wordle-cell');
      row.appendChild(cell);
    }
    wordleBoard.appendChild(row);
    wordleMessage.textContent = "An extra guess has been added!";
  }

  // Handle On-Screen Keyboard Clicks
  wordleKeyboard.addEventListener('click', (e) => {
    if (e.target.classList.contains('wordle-key')) {
      const key = e.target.textContent;
      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
        updateBoardUI();
      } else {
        if (currentGuess.length < wordLength) {
          currentGuess += key;
          updateBoardUI();
        }
      }
    }
  });

  // Save game state to localStorage
  function saveGameState(won) {
    const today = getCurrentDate();
    localStorage.setItem('wordle_last_played', today);
    localStorage.setItem('wordle_won', won);
  }

  // Check if the game has already been played today
  function hasPlayed
