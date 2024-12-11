// yetanotherwordlegame.js

document.addEventListener('DOMContentLoaded', () => {
  const wordleModal = document.getElementById('wordleModal');
  const wordleBoard = document.getElementById('wordleBoard');
  const wordleInput = document.getElementById('wordleInput');
  const wordleMessage = document.getElementById('wordleMessage');
  const startWordleButton = document.getElementById('startWordleButton');
  const powerUpButton = document.getElementById('powerUpButton');
  const wordleKeyboard = document.getElementById('wordleKeyboard');
  const currentThemeDisplay = document.getElementById('currentTheme');
  const roundIndicator = document.getElementById('roundIndicator'); // New Element
  const correctGuessMessage = document.getElementById('correctGuessMessage'); // New Element
  const confettiContainer = document.getElementById('confetti'); // New Element
  const progressBar = document.getElementById('progressBar'); // New Element

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

  // Helper function to get current date in YYYY-MM-DD format (Central Standard Time)
  function getCurrentDate() {
    const now = new Date();
    // Convert to Central Standard Time by adjusting the time offset
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const centralTime = new Date(utc - (3600000 * 6)); // CST is UTC-6
    const year = centralTime.getFullYear();
    let month = centralTime.getMonth() + 1;
    let day = centralTime.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return `${year}-${month}-${day}`;
  }

  let currentDate = getCurrentDate();
  let gameData = dailyGames[currentDate];

  // If no game data for today, loop back to the first day
  if (!gameData) {
    const dates = Object.keys(dailyGames);
    const firstDate = dates[0];
    gameData = dailyGames[firstDate];
    currentDate = firstDate;
  }

  const { theme, words } = gameData;
  let currentRound = 0; // 0,1,2 for rounds 1,2,3
  const totalRounds = 3;
  let usedPowerUp = false;
  let secretWord = words[currentRound].toLowerCase();
  let wordLength = secretWord.length;
  let maxGuesses = 6;
  let guesses = [];
  let currentGuess = '';
  let gameOver = false;

  // Initialize the game
  function initializeWordleGame() {
    currentRound = 0;
    usedPowerUp = false;
    secretWord = words[currentRound].toLowerCase();
    wordLength = secretWord.length;
    maxGuesses = 6;
    guesses = [];
    currentGuess = '';
    gameOver = false;
    wordleMessage.textContent = `Theme: ${theme}`;
    currentThemeDisplay.textContent = theme;
    createBoard();
    createKeyboard();
    wordleInput.disabled = false;
    wordleInput.value = '';
    wordleInput.focus(); // Ensure the input is focused
    powerUpButton.disabled = false;
    powerUpButton.textContent = "Use Power-Up";
    updateKeyboard();
    showRoundIndicator(); // Show Round Indicator
    updateProgressBar(); // Reset Progress Bar
  }

  // Create the Wordle Board based on word length
  function createBoard() {
    wordleBoard.innerHTML = '';
    for (let i = 0; i < maxGuesses; i++) {
      const row = document.createElement('div');
      row.classList.add('wordle-row');
      row.style.gridTemplateColumns = `repeat(${wordLength}, 50px)`; // Dynamic columns
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
      'ENTER','Z','X','C','V','B','N','M','BACKSPACE'
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
    guesses.forEach(guessObj => {
      const { guess, feedback } = guessObj;
      guess.split('').forEach((letter, index) => {
        const key = letter.toUpperCase();
        const keyButton = Array.from(wordleKeyboard.children).find(btn => btn.textContent === key);
        if (keyButton) {
          if (feedback[index] === 'correct') {
            keyButton.classList.remove('present', 'absent');
            keyButton.classList.add('correct', 'animate-press');
            setTimeout(() => {
              keyButton.classList.remove('animate-press');
            }, 600); // Increased from 300ms to match animation duration
          } else if (feedback[index] === 'present') {
            if (!keyButton.classList.contains('correct')) {
              keyButton.classList.remove('absent');
              keyButton.classList.add('present', 'animate-press');
              setTimeout(() => {
                keyButton.classList.remove('animate-press');
              }, 600); // Increased from 300ms to match animation duration
            }
          } else {
            if (!keyButton.classList.contains('correct') && !keyButton.classList.contains('present')) {
              keyButton.classList.add('absent', 'animate-press');
              setTimeout(() => {
                keyButton.classList.remove('animate-press');
              }, 600); // Increased from 300ms to match animation duration
            }
          }
        }
      });
    });
  }

  // Handle Keyboard Input (Physical)
  wordleInput.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
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
    if (gameOver) return;
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
    if (gameOver) return;
    if (currentGuess.length !== wordLength) {
      wordleMessage.textContent = `Please enter a ${wordLength}-letter word.`;
      return;
    }
    // Commented out word validation to allow any combination of letters
    /*
    if (!isValidWord(currentGuess.toLowerCase())) {
      wordleMessage.textContent = "Word not in list.";
      return;
    }
    */

    // Process the guess
    const feedback = getFeedback(currentGuess.toLowerCase());
    guesses.push({ guess: currentGuess.toLowerCase(), feedback });
    updateBoardColors(feedback);
    updateKeyboard();
    currentGuess = '';
    updateBoardUI();
    wordleMessage.textContent = '';

    // Update Progress Bar
    updateProgressBar();

    // Check for win
    if (guesses[guesses.length - 1].guess === secretWord) {
      wordleMessage.textContent = "Congratulations! You've guessed the word!";
      wordleInput.disabled = true;
      powerUpButton.disabled = true;
      displayCorrectGuess(); // Display Correct Guess Message
      triggerConfetti(); // Trigger Confetti Animation
      proceedToNextRound(true);
      saveGameState(true); // Save win state
      return;
    }

    // Check for loss
    if (guesses.length === maxGuesses) {
      wordleMessage.textContent = `You've run out of guesses! The word was "${secretWord.toUpperCase()}".`;
      wordleInput.disabled = true;
      powerUpButton.disabled = true;
      proceedToNextRound(false);
      saveGameState(false); // Save loss state
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
      // Remove the class if it's already present to re-trigger animation
      cell.classList.remove('animate-flip', 'bounce');
      void cell.offsetWidth; // Trigger reflow

      // Add feedback class and animate-flip
      cell.classList.add(feedback[index], 'animate-flip', 'bounce');

      // Remove the animation class after animation completes to allow re-animation
      setTimeout(() => {
        cell.classList.remove('animate-flip', 'bounce');
      }, 1000); // Duration matches the CSS animation duration
    });
  }

  // Validate the word using the words array from dailyGames
  function isValidWord(word) {
    return words.includes(word);
  }

  // Power-Up Functionality
  powerUpButton.addEventListener('click', () => {
    if (usedPowerUp) {
      wordleMessage.textContent = "You have already used your power-up for this game.";
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
        // Remove existing feedback classes to avoid conflicts
        cell.classList.remove('correct', 'present', 'absent', 'animate-flip', 'bounce');
        void cell.offsetWidth; // Trigger reflow

        cell.textContent = secretWord[i].toUpperCase();
        cell.classList.add('correct', 'animate-flip', 'bounce');
        // Remove the animation class after animation completes
        setTimeout(() => {
          cell.classList.remove('animate-flip', 'bounce');
        }, 1000); // Increased from 500ms to match animation duration

        // Update keyboard
        const key = secretWord[i].toUpperCase();
        const keyButton = Array.from(wordleKeyboard.children).find(btn => btn.textContent === key);
        if (keyButton) {
          // Remove existing feedback classes to avoid conflicts
          keyButton.classList.remove('present', 'absent', 'animate-press');
          void keyButton.offsetWidth; // Trigger reflow

          keyButton.classList.add('correct', 'animate-press');
          setTimeout(() => {
            keyButton.classList.remove('animate-press');
          }, 600); // Increased from 300ms to match animation duration
        }
        break;
      }
    }
  }

  function getExtraGuessFunction() {
    maxGuesses += 1;
    // Add an extra row to the board based on current word length
    const row = document.createElement('div');
    row.classList.add('wordle-row');
    row.style.gridTemplateColumns = `repeat(${wordLength}, 50px)`; // Dynamic columns
    for (let j = 0; j < wordLength; j++) {
      const cell = document.createElement('div');
      cell.classList.add('wordle-cell');
      row.appendChild(cell);
    }
    wordleBoard.appendChild(row);
    wordleMessage.textContent = "An extra guess has been added!";
    updateProgressBar(); // Update progress bar to reflect the extra guess
  }

  // Proceed to the next round
  function proceedToNextRound(won) {
    if (won && currentRound < totalRounds - 1) {
      currentRound += 1;
      secretWord = words[currentRound].toLowerCase();
      wordLength = secretWord.length;
      maxGuesses = 6;
      guesses = [];
      currentGuess = '';
      wordleMessage.textContent = `Round ${currentRound + 1}: ${theme}`;
      createBoard();
      createKeyboard();
      wordleInput.disabled = false;
      wordleInput.value = '';
      wordleInput.focus();
      powerUpButton.disabled = !usedPowerUp;
      powerUpButton.textContent = usedPowerUp ? "Power-Up Used" : "Use Power-Up";
      updateKeyboard();
      showRoundIndicator(); // Show Round Indicator for the new round
      updateProgressBar(); // Reset Progress Bar
    } else {
      wordleMessage.textContent += " Game Over.";
      gameOver = true;
    }
  }

  // Save game state to localStorage
  function saveGameState(won) {
    const today = getCurrentDate();
    localStorage.setItem('wordle_last_played', today);
    localStorage.setItem('wordle_won', won);
  }

  // Check if the game has already been played today
  function hasPlayedToday() {
    const lastPlayed = localStorage.getItem('wordle_last_played');
    const today = getCurrentDate();
    return lastPlayed === today;
  }

  // Initialize the game when Start Game is clicked
  startWordleButton.addEventListener('click', () => {
    if (hasPlayedToday()) {
      wordleMessage.textContent = "You have already played today's game.";
      wordleInput.disabled = true;
      powerUpButton.disabled = true;
      return;
    }
    initializeWordleGame();
  });

  // Close the modal when clicking outside the content
  wordleModal.addEventListener('click', (e) => {
    if (e.target === wordleModal) {
      closeWordleModal();
    }
  });

  // Ensure the input field is focused when the modal is opened
  wordleModal.addEventListener('transitionend', () => {
    if (!wordleModal.classList.contains('hidden')) {
      wordleInput.focus();
    }
  });

  // Ensure the input field is focused when the modal is opened via JavaScript
  const openModalObserver = new MutationObserver(() => {
    if (!wordleModal.classList.contains('hidden')) {
      wordleInput.focus();
    }
  });
  openModalObserver.observe(wordleModal, { attributes: true, attributeFilter: ['class'] });

  // Initialize the game if not played yet
  if (!hasPlayedToday()) {
    // Wait for the user to click Start
  } else {
    wordleMessage.textContent = "You have already played today's game.";
    wordleInput.disabled = true;
    powerUpButton.disabled = true;
    currentThemeDisplay.textContent = theme;
    updateProgressBar(); // Initialize Progress Bar
  }

  // Function to show Round Indicator with fade-in and fade-out
  function showRoundIndicator() {
    const roundText = `Round ${currentRound + 1}`;
    roundIndicator.textContent = roundText;
    roundIndicator.classList.remove('animate-fade-out');
    roundIndicator.classList.add('animate-fade-in');

    // After fade-in, wait for 2.5 seconds and then fade out
    setTimeout(() => {
      roundIndicator.classList.remove('animate-fade-in');
      roundIndicator.classList.add('animate-fade-out');
    }, 2500); // Increased from 1500ms to 2500ms to match animation duration
  }

  // Function to display Correct Guess Message with animation
  function displayCorrectGuess() {
    correctGuessMessage.textContent = "Correct Guess!";
    correctGuessMessage.style.opacity = '1';
    correctGuessMessage.classList.add('animate-fade-in');

    // After displaying, fade out the message after 3 seconds
    setTimeout(() => {
      correctGuessMessage.classList.remove('animate-fade-in');
      correctGuessMessage.classList.add('animate-fade-out');
      correctGuessMessage.style.opacity = '0';
      correctGuessMessage.textContent = '';
    }, 3000); // Increased from 2000ms to 3000ms to match animation duration
  }

  // Function to trigger confetti animation
  function triggerConfetti() {
    const confettiCount = 100;
    const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7'];
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti-piece');
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 5}s`;
      confettiContainer.appendChild(confetti);

      // Remove confetti after animation
      confetti.addEventListener('animationend', () => {
        confetti.remove();
      });
    }
  }

  // Function to update Progress Bar
  function updateProgressBar() {
    const progress = (guesses.length / maxGuesses) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Function to create a confetti piece
  function createConfettiPiece() {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confettiContainer.appendChild(confetti);

    // Remove confetti after animation
    confetti.addEventListener('animationend', () => {
      confetti.remove();
    });
  }

  // Function to continuously generate confetti
  function startConfetti() {
    const confettiInterval = setInterval(() => {
      createConfettiPiece();
      if (confettiContainer.children.length > 200) {
        clearInterval(confettiInterval);
      }
    }, 200);
  }
  
  // Modified triggerConfetti to start multiple confetti pieces
  function triggerConfetti() {
    startConfetti();
  }

  // Function to display Correct Guess Message with animation
  // (Already defined above)

  // Function to show Round Indicator
  // (Already defined above)

});
