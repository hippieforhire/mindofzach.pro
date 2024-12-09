let outputBox, inputBox;

const gameData = {
    currentRoom: "caveEntrance",
    rooms: {
        caveEntrance: {
            description: "You are standing at the entrance of a dark cave. There is a faint light inside. Behind you is a dense forest.",
            items: ["torch"],
            enemies: [],
            next: { north: "deepCave", south: "forest" },
        },
        deepCave: {
            description: "You are inside a dark cave. The air is damp, and you hear distant sounds. There's a narrow passage leading deeper inside.",
            items: ["rusty key"],
            enemies: [{ name: "goblin", health: 20 }],
            next: { south: "caveEntrance", north: "mysteriousChamber" },
        },
        mysteriousChamber: {
            description: "You find yourself in a mysterious underground chamber lit by glowing mushrooms. A strange pedestal stands in the center.",
            items: ["strange amulet"],
            enemies: [{ name: "giant spider", health: 30 }],
            next: { south: "deepCave" },
        },
        forest: {
            description: "You stand in a lush forest. Tall trees block much of the sunlight. Paths lead east to a riverbank and west up a hillside.",
            items: ["branch", "berries"],
            enemies: [],
            next: { north: "caveEntrance", east: "riverbank", west: "hillside" },
        },
        riverbank: {
            description: "You are by a flowing river. The water is cold and clear. To the west is the forest.",
            items: ["fishing rod"],
            enemies: [],
            next: { west: "forest" },
        },
        hillside: {
            description: "You stand on a hillside, overlooking the forest below. A narrow trail leads east back to the forest.",
            items: ["rope"],
            enemies: [{ name: "wild boar", health: 15 }],
            next: { east: "forest" },
        },
    },
    synonyms: {
        // Greatly expanded synonyms for look
        look: [
            "look", "examine", "inspect", "view", "peer", "see", "observe", "check", "glance",
            "stare", "gaze", "scrutinize", "study", "scan", "perceive", "watch", "consider",
            "survey", "have a look", "take a look", "look around", "examine surroundings",
            "inspect area", "scan room", "check place", "survey surroundings", "examine room"
        ],

        // Massively expanded take synonyms
        take: [
            "take", "grab", "pick", "take x", "take the x", "take the", "pick up", "seize",
            "collect", "acquire", "obtain", "get hold of", "snatch", "remove", "lift", "get",
            "claim", "retrieve", "fetch", "steal", "pluck", "harvest", "bag", "pocket", "add to inventory",
            "take item", "get item", "yank", "pull", "hoard"
        ],

        // Attack synonyms expanded
        attack: [
            "attack", "fight", "hit", "strike", "punch", "stab", "slash", "swing at",
            "assault", "bash", "smack", "clobber", "whack", "beat up", "engage", "pummel",
            "thrash", "clout", "hammer", "lunge at", "charge at", "go after",
            "kick", "headbutt", "wrestle", "duel", "clash with"
        ],

        // Direction synonyms (north, south) plus new directions
        north: [
            "north", "go north", "move north", "head north", "proceed north", "travel north",
            "northward", "to north", "venture north", "walk north", "step north", "head up"
        ],
        south: [
            "south", "go south", "move south", "head south", "proceed south", "travel south",
            "southward", "to south", "venture south", "walk south", "step south", "head down"
        ],

        // Add east, west, up, down, left, right, back, forward synonyms
        east: [
            "east", "go east", "move east", "head east", "proceed east", "travel east",
            "eastward", "to east", "venture east", "walk east", "step east"
        ],
        west: [
            "west", "go west", "move west", "head west", "proceed west", "travel west",
            "westward", "to west", "venture west", "walk west", "step west"
        ],
        up: [
            "up", "go up", "move up", "climb up", "head up", "ascend", "upward", "go upward"
        ],
        down: [
            "down", "go down", "move down", "climb down", "descend", "downward", "go downward"
        ],
        left: [
            "left", "go left", "move left", "step left", "head left", "turn left"
        ],
        right: [
            "right", "go right", "move right", "step right", "head right", "turn right"
        ],
        back: [
            "back", "go back", "move back", "head back", "return", "go backward", "go backwards"
        ],
        forward: [
            "forward", "go forward", "move forward", "head forward", "proceed forward", "advance"
        ],

        // Movement/escape synonyms were already run, we can add walk synonyms
        run: [
            "run", "sprint", "dash", "bolt", "hurry", "rush", "flee", "escape", "leg it",
            "make a run for it", "race", "charge away", "hightail", "scurry", "scuttle",
            "beat it", "clear out", "jog"
        ],

        // New environment actions
        jump: [
            "jump", "leap", "hop", "bounce"
        ],
        climb: [
            "climb", "scaling", "go climbing", "scramble up"
        ],
        crawl: [
            "crawl", "creep", "go on all fours", "slither"
        ],
        duck: [
            "duck", "crouch", "bend down", "lower yourself"
        ],

        // Funny actions
        dance: [
            "dance", "boogie", "groove", "shake it", "jig", "twirl"
        ],
        pickNose: [
            "pick nose", "pick your nose", "dig nose", "nose pick", "clean nostril"
        ],
        sing: [
            "sing", "croon", "hum a tune", "belt out a song", "serenade"
        ],
        yell: [
            "yell", "shout", "scream", "call out", "holler"
        ],

        // Inventory and help
        inventory: [
            "inventory", "inv", "show inventory", "what do i have", "check bag", "check pouch",
            "items on me", "my stuff", "my items"
        ],
        help: [
            "help", "instructions", "what can i do", "commands", "assist", "how to play", "guide"
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
    // If no known command found
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
        // More detailed look around: show description, items, enemies, and exits
        addOutput(currentRoom.description);
        if (currentRoom.items.length > 0) addOutput(`You see: ${currentRoom.items.join(", ")}`);
        if (currentRoom.enemies.length > 0) addOutput(`Enemies present: ${currentRoom.enemies.map(e => e.name).join(", ")}`);

        // Show available exits
        const exits = Object.keys(currentRoom.next);
        if (exits.length > 0) {
            addOutput(`Exits: ${exits.join(", ")}`);
        }

    } else if (["north", "south", "east", "west", "up", "down", "left", "right", "back", "forward"].includes(action)) {
        // Attempt to move in the specified direction if it exists
        const directionMap = {
            north: "north",
            south: "south",
            east: "east",
            west: "west",
            up: "north", // up mapped to north for simplicity, or we can ignore if no room that way
            down: "south", // down mapped to south
            left: "west",
            right: "east",
            back: "south", // back might mean going back the way you came, we map it to south for simplicity
            forward: "north"
        };
        const dir = directionMap[action];
        if (dir && currentRoom.next[dir]) {
            gameData.currentRoom = currentRoom.next[dir];
            addOutput(gameData.rooms[gameData.currentRoom].description);
        } else {
            addOutput("You can't go that way.");
        }

    } else if (action === "attack") {
        if (currentRoom.enemies.length > 0) {
            const enemy = currentRoom.enemies[0];
            enemy.health -= gameData.player.attackPower;
            addOutput(`You attack the ${enemy.name}! Its health is now ${enemy.health}.`);
            if (enemy.health <= 0) {
                addOutput(`You have defeated the ${enemy.name}!`);
                currentRoom.enemies = [];
            } else {
                addOutput(`The ${enemy.name} snarls and prepares to strike back!`);
            }
        } else {
            addOutput("There's nothing here to attack.");
        }

    } else if (action === "run") {
        addOutput("You try to run, but you end up right where you started. Maybe try a direction?");

    } else if (action === "jump") {
        addOutput("You jump up and down. It doesn't seem to help much.");

    } else if (action === "climb") {
        addOutput("You attempt to climb the surroundings, but there's nothing suitable to climb here.");

    } else if (action === "crawl") {
        addOutput("You crawl on the ground for a bit. The floor is cold and damp.");

    } else if (action === "duck") {
        addOutput("You duck your head. Nothing passes overhead, but at least you stretched your legs.");

    } else if (action === "dance") {
        addOutput("You break into a dance! It's not often one dances in a cave, but you feel a bit happier.");

    } else if (action === "pickNose") {
        addOutput("You pick your nose. Disgusting, yet oddly satisfying. No one is here to judge... except maybe the goblin.");

    } else if (action === "sing") {
        addOutput("You start singing a tune. Your voice echoes in the cave, resonating strangely.");

    } else if (action === "yell") {
        addOutput("You yell loudly. The sound echoes, startling nothing but yourself.");

    } else if (action === "inventory") {
        if (gameData.inventory.length === 0) {
            addOutput("Your inventory is empty.");
        } else {
            addOutput("You are carrying: " + gameData.inventory.join(", "));
        }

    } else if (action === "help") {
        addOutput("You can try actions like look, take, attack, move in directions (north, south, east, west), check inventory, run, jump, climb, dance, and more. Try examining surroundings or items. Experiment with commands!");

    } else {
        // If we added more actions but haven't handled them specifically, fall here
        addOutput("You can't do that here.");
    }
}
