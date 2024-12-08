let outputBox, inputBox;

// Removed all Lunr references and logic
// Added more generic synonyms as requested

const gameData = {
    currentRoom: "caveEntrance",
    rooms: {
        caveEntrance: {
            description: "You are standing at the entrance of a dark cave. There is a faint light inside.",
            items: ["torch"],
            enemies: [],
            next: { north: "deepCave" },
        },
        deepCave: {
            description: "You are inside a dark cave. The air is damp, and you hear distant sounds.",
            items: [],
            enemies: [{ name: "goblin", health: 20 }],
            next: { south: "caveEntrance" },
        },
    },
    synonyms: {
        look: ["look", "examine", "inspect"],
        take: ["take", "grab", "pick", "take x", "take the x", "take the"],
        attack: ["attack", "fight", "hit"],
        north: ["north", "go north"],
        south: ["south", "go south"],
        run: ["run"]
    },
    inventory: [],
    player: { attackPower: 10 },
};

// Open Zork Modal (unused but retained to avoid removing features)
function openZorkModal() {
    const modal = document.getElementById("zorkModal");
    modal.classList.remove("hidden");
    startZorkGame(); // Initialize the game if a modal was used
}

// Close Zork Modal (unused but retained)
function closeZorkModal() {
    const modal = document.getElementById("zorkModal");
    modal.classList.add("hidden");
}

// Start the Game
function startZorkGame() {
    outputBox = document.getElementById("output");
    inputBox = document.getElementById("input");

    // Clear output and input
    outputBox.textContent = "";
    inputBox.value = "";

    if (!gameData.currentRoom || !gameData.rooms[gameData.currentRoom]) {
        addOutput("Error: Starting room not found!");
        return;
    }

    addOutput(gameData.rooms[gameData.currentRoom].description); // Show initial room description
    inputBox.focus();

    // Remove any old listeners before adding a fresh one
    inputBox.removeEventListener("keyup", handleZorkInput);
    inputBox.addEventListener("keyup", handleZorkInput);
}

// Add Text to Output Box
function addOutput(text) {
    const newParagraph = document.createElement("p");
    newParagraph.textContent = text;
    outputBox.appendChild(newParagraph);
    outputBox.scrollTop = outputBox.scrollHeight; // Scroll to latest message
}

// Handle User Input
function handleZorkInput(event) {
    if (event.key === "Enter") {
        const command = inputBox.value.trim().toLowerCase();
        inputBox.value = "";
        processCommand(command);
    }
}

// Process Commands without Lunr
function processCommand(input) {
    // Check each action and its synonyms
    for (let action in gameData.synonyms) {
        for (let synonym of gameData.synonyms[action]) {
            if (input.includes(synonym)) {
                executeCommand(action, input, gameData.rooms[gameData.currentRoom]);
                return;
            }
        }
    }

    addOutput("I don't understand that command. Try something else.");
}

// Execute Commands
function executeCommand(action, input, currentRoom) {
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
    } else if (["north", "south"].includes(action)) {
        const nextRoomKey = currentRoom.next[action];
        if (nextRoomKey) {
            gameData.currentRoom = nextRoomKey;
            addOutput(gameData.rooms[nextRoomKey].description);
        } else {
            addOutput("You can't go that way.");
        }
    } else if (action === "run") {
        addOutput("You run in circles, unsure of where to go.");
    } else {
        addOutput("You can't do that here.");
    }
}
