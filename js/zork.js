let outputBox, inputBox, lunrIndex;

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
        look: [
            "look", "examine", "inspect", "view", "peer", "see", "observe",
            "check", "glance", "stare", "gaze", "scrutinize", "study", "scan",
            "perceive", "watch", "consider", "survey", "have a look", "take a look"
        ],
        take: [
            "take", "grab", "pick", "take x", "take the x", "take the", "pick up", "seize",
            "collect", "acquire", "obtain", "get hold of", "snatch", "remove", "lift", "get",
            "claim", "retrieve", "fetch"
        ],
        attack: [
            "attack", "fight", "hit", "strike", "punch", "stab", "slash", "swing at",
            "assault", "bash", "smack", "clobber", "whack", "beat up", "engage", "pummel",
            "thrash", "clout", "hammer", "lunge at", "charge at", "go after"
        ],
        north: [
            "north", "go north", "move north", "head north", "proceed north", "travel north",
            "northward", "to north", "venture north"
        ],
        south: [
            "south", "go south", "move south", "head south", "proceed south", "travel south",
            "southward", "to south", "venture south"
        ],
        run: [
            "run", "sprint", "dash", "bolt", "hurry", "rush", "flee", "escape", "leg it",
            "make a run for it", "race", "charge away", "hightail", "scurry", "scuttle",
            "beat it", "clear out"
        ]
    },
    inventory: [],
    player: { attackPower: 10 },
};

function openZorkModal() {
    const modal = document.getElementById("zorkModal");
    modal.classList.remove("hidden");
    startZorkGame();
}

function closeZorkModal() {
    const modal = document.getElementById("zorkModal");
    modal.classList.add("hidden");
}

function startZorkGame() {
    outputBox = document.getElementById("output");
    inputBox = document.getElementById("input");

    outputBox.textContent = "";
    inputBox.value = "";

    if (!gameData.currentRoom || !gameData.rooms[gameData.currentRoom]) {
        addOutput("Error: Starting room not found!");
        return;
    }

    addOutput(gameData.rooms[gameData.currentRoom].description);
    inputBox.focus();

    inputBox.removeEventListener("keyup", handleZorkInput);
    inputBox.addEventListener("keyup", handleZorkInput);
}

function addOutput(text) {
    const newParagraph = document.createElement("p");
    newParagraph.textContent = text;
    outputBox.appendChild(newParagraph);
    outputBox.scrollTop = outputBox.scrollHeight;
}

function handleZorkInput(event) {
    if (event.key === "Enter") {
        const command = inputBox.value.trim().toLowerCase();
        inputBox.value = "";
        processCommand(command);
    }
}

function processCommand(input) {
    // Check each action and synonyms
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
    } else if (action === "attack") {
        // Basic placeholder for attack logic
        if (currentRoom.enemies.length > 0) {
            const enemy = currentRoom.enemies[0];
            enemy.health -= gameData.player.attackPower;
            addOutput(`You attack the ${enemy.name}! Its health is now ${enemy.health}.`);
            if (enemy.health <= 0) {
                addOutput(`You have defeated the ${enemy.name}!`);
                currentRoom.enemies = [];
            }
        } else {
            addOutput("There's nothing here to attack.");
        }
    } else if (action === "run") {
        addOutput("You run around, unsure of where to go, but nothing changes.");
    } else {
        addOutput("You can't do that here.");
    }
}
