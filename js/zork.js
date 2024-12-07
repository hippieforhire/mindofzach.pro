let outputBox, inputBox, lunrIndex;

// Initialize Lunr.js Index
function initializeLunr() {
    if (lunrIndex) return; // Prevent re-initializing
    lunrIndex = lunr(function () {
        this.field("command");
        this.field("description");
        this.field("items");
        this.field("enemies");
        this.ref("id");

        // Index all rooms and commands
        Object.keys(gameData.rooms).forEach(roomId => {
            const room = gameData.rooms[roomId];
            this.add({
                id: roomId,
                command: Object.values(gameData.synonyms).flat().join(" "),
                description: room.description,
                items: room.items.join(" "),
                enemies: room.enemies.map(e => e.name).join(" ")
            });
        });
    });
}

// Start the Game
function startZorkGame() {
    outputBox = document.getElementById("output");
    inputBox = document.getElementById("input");

    // Ensure output and input are cleared before starting
    outputBox.textContent = "";
    inputBox.value = "";

    addOutput(gameData.rooms[gameData.currentRoom].description); // Show the current room description
    inputBox.focus();

    inputBox.removeEventListener("keyup", handleZorkInput); // Avoid duplicate event listeners
    inputBox.addEventListener("keyup", handleZorkInput);

    initializeLunr(); // Initialize Lunr index if not already done
}

// Handle User Input
function handleZorkInput(event) {
    if (event.key === "Enter") {
        const command = inputBox.value.trim().toLowerCase();
        inputBox.value = ""; // Clear input box after submission
        processCommand(command);
    }
}

// Process Commands
function processCommand(input) {
    const results = lunrIndex.search(input); // Search the command in Lunr index

    if (results.length > 0) {
        const bestMatch = results[0];
        const matchedRoom = gameData.rooms[bestMatch.ref];
        const currentRoom = gameData.rooms[gameData.currentRoom];

        for (let action in gameData.synonyms) {
            if (gameData.synonyms[action].some(word => input.includes(word))) {
                executeCommand(action, input, currentRoom, matchedRoom);
                return;
            }
        }
    }

    addOutput("I don't understand that command. Try something else.");
}

// Execute Commands
function executeCommand(action, input, currentRoom, matchedRoom) {
    if (action === "take") {
        const item = currentRoom.items.find(i => input.includes(i));
        if (item) {
            gameData.inventory.push(item);
            currentRoom.items = currentRoom.items.filter(i => i !== item);
            addOutput(`You take the ${item}.`);
        } else {
            addOutput("There's nothing here to take.");
        }
    } else if (action === "look") {
        addOutput(currentRoom.description);
        if (currentRoom.items.length > 0) addOutput(`You see: ${currentRoom.items.join(", ")}`);
        if (currentRoom.enemies.length > 0) addOutput(`Enemies present: ${currentRoom.enemies.map(e => e.name).join(", ")}`);
    } else if (action === "equip") {
        const weapon = Object.keys(gameData.weapons).find(w => input.includes(w));
        if (weapon && gameData.inventory.includes(weapon)) {
            gameData.equippedWeapon = gameData.weapons[weapon];
            addOutput(`You equip the ${weapon}. Your attack power increases.`);
        } else {
            addOutput("You don't have that weapon to equip.");
        }
    } else if (action === "attack") {
        if (currentRoom.enemies.length > 0) {
            const enemy = currentRoom.enemies[0];
            enemy.health -= gameData.player.attackPower;
            addOutput(`You attack the ${enemy.name} for ${gameData.player.attackPower} damage.`);
            if (enemy.health <= 0) {
                addOutput(`You have defeated the ${enemy.name}!`);
                currentRoom.enemies.shift();
            }
        } else {
            addOutput("There's nothing to attack here.");
        }
    } else if (["north", "south", "east", "west"].includes(action)) {
        const nextRoomKey = currentRoom.next[action];
        if (nextRoomKey) {
            gameData.currentRoom = nextRoomKey;
            addOutput(gameData.rooms[nextRoomKey].description);
        } else {
            addOutput("You can't go that way.");
        }
    } else {
        addOutput("You can't do that here.");
    }
}

// Add Text to Output Box
function addOutput(text) {
    const newParagraph = document.createElement("p");
    newParagraph.textContent = text;
    outputBox.appendChild(newParagraph);
    outputBox.scrollTop = outputBox.scrollHeight; // Auto-scroll to the latest message
}

// Automatically start the game when the script loads
startZorkGame();
