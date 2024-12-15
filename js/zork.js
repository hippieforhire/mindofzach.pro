// zork.js improved to handle "i will help" scenario, added synonyms for yes/no help
// and sensory commands, plus quest state logic

let outputBox, inputBox;

const gameData = {
    currentRoom: "caveEntrance",
    questStates: {
        cloakedFigure: "none" // none, asked, helping, betraying
    },
    rooms: {
        caveEntrance: {
            description: "You are standing at the entrance of a dark cave. A faint light inside. Behind you is a dense forest. A sword lies on the ground.",
            items: ["torch", "sword"],
            enemies: [],
            next: { north: "deepCave", south: "forest" },
        },
        deepCave: {
            description: "You are inside a dark cave. The air is damp and you hear distant sounds. A narrow passage leads deeper inside.",
            items: ["rusty key"],
            enemies: [{ name: "goblin", health: 20 }],
            next: { south: "caveEntrance", north: "mysteriousChamber" },
        },
        mysteriousChamber: {
            description: "A mysterious underground chamber lit by glowing mushrooms. A strange pedestal stands in the center. A cloaked figure watches you silently.",
            items: ["strange amulet"],
            enemies: [{ name: "giant spider", health: 30 }],
            next: { south: "deepCave" },
            npc: { name: "cloaked figure", friendly: true, hasQuest: true }
        },
        forest: {
            description: "A lush forest with tall trees. Paths lead east to a riverbank and west up a hillside. A weary traveler sits against a tree.",
            items: ["branch", "berries"],
            enemies: [],
            next: { north: "caveEntrance", east: "riverbank", west: "hillside" },
            npc: { name: "weary traveler", friendly: true, wantsHelp: true }
        },
        riverbank: {
            description: "You stand by a flowing river. The water is cold and clear. To the west is the forest.",
            items: ["fishing rod"],
            enemies: [],
            next: { west: "forest" },
        },
        hillside: {
            description: "You stand on a hillside, overlooking the forest. A trail leads east back to the forest.",
            items: ["rope"],
            enemies: [{ name: "wild boar", health: 15 }],
            next: { east: "forest" },
        },
    },

    synonyms: {
        look: [...], // same as provided above
        take: [...],
        attack: [...],
        move: [...],
        run: [...],
        jump: [...],
        climb: [...],
        crawl: [...],
        duck: [...],
        dance: [...],
        pickNose: [...],
        sing: [...],
        yell: [...],
        inventory: [...],
        help: [...],
        use: [...],
        equip: [...],
        talk: [...],
        trade: [...],
        give: [...],
        eat: [...],
        drink: [...],
        listen: [
            "listen","hear","i listen","i hear","listen carefully","i try to listen","listen closely",
            "what do i hear","do i hear anything"
        ],
        smell: [
            "smell","sniff","i smell","i sniff","what do i smell","scent","inhale","breathe in"
        ],
        feel: [
            "feel","touch","i feel","i touch","what do i feel","feel around","touch around"
        ]
    },
    inventory: [],
    player: {
        attackPower: 10,
        weapon: null
    },
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

function matchesSynonym(input, synonyms) {
    const spacedInput = " " + input + " ";
    return synonyms.some(syn => {
        const spacedSyn = " " + syn + " ";
        return spacedInput.includes(spacedSyn);
    });
}

function processCommand(input) {
    if (input === "") {
        return;
    }
    addOutput("> " + input);

    const currentRoom = gameData.rooms[gameData.currentRoom];

    // Check NPC question states
    if (gameData.currentRoom === "mysteriousChamber" && currentRoom.npc && currentRoom.npc.hasQuest) {
        if (gameData.questStates.cloakedFigure === "none" || gameData.questStates.cloakedFigure === "asked") {
            // NPC asked: "Will you help or betray me?"
            if (input.includes("help") || input.includes("assist") || input.includes("yes") || input.includes("ok") || input.includes("sure")) {
                gameData.questStates.cloakedFigure = "helping";
                addOutput("The cloaked figure nods: 'Excellent. Bring me the strange amulet from here. I await your return.'");
                return;
            } else if (input.includes("betray") || input.includes("no") || input.includes("refuse") || input.includes("never")) {
                gameData.questStates.cloakedFigure = "betraying";
                addOutput("The cloaked figure hisses: 'Then be gone from my sight!'");
                return;
            }
        }
    }

    // Determine action
    let action = null;
    for (let key in gameData.synonyms) {
        if (matchesSynonym(input, gameData.synonyms[key])) {
            action = key;
            break;
        }
    }

    if (!action) {
        if (matchesSynonym(input, gameData.synonyms.move)) {
            action = 'move';
        } else {
            addOutput("I don't understand that command. Try something else.");
            return;
        }
    }

    executeCommand(action, input, currentRoom);
}

function executeCommand(action, input, currentRoom) {
    function showRoomDetails() {
        addOutput(currentRoom.description);
        if (currentRoom.items && currentRoom.items.length > 0) addOutput(`You see: ${currentRoom.items.join(", ")}`);
        if (currentRoom.enemies && currentRoom.enemies.length > 0) addOutput(`Enemies present: ${currentRoom.enemies.map(e => e.name).join(", ")}`);
        const exits = currentRoom.next ? Object.keys(currentRoom.next) : [];
        if (exits.length > 0) {
            addOutput(`Exits: ${exits.join(", ")}`);
        }
        if (currentRoom.npc) {
            addOutput(`You notice a ${currentRoom.npc.name} here.`);
        }
    }

    function getWeaponBonus() {
        return (gameData.player.weapon === "sword") ? 10 : 0;
    }

    function attackEnemy(enemy) {
        const damage = gameData.player.attackPower + getWeaponBonus();
        enemy.health -= damage;
        addOutput(`You strike the ${enemy.name} for ${damage} damage! Its health is now ${enemy.health}.`);
        if (enemy.health <= 0) {
            addOutput(`You have vanquished the ${enemy.name}!`);
            currentRoom.enemies = [];
        } else {
            addOutput(`The ${enemy.name} snarls and prepares to retaliate. Be careful!`);
        }
    }

    function talkToNPC(npc) {
        if (!npc) {
            addOutput("There's no one here to talk to.");
            return;
        }
        if (npc.name === "weary traveler" && npc.wantsHelp) {
            addOutput("The weary traveler looks up and says: 'I'm injured. If you give me some berries to eat, I can heal. Will you help me?'");
        } else if (npc.name === "cloaked figure" && npc.hasQuest) {
            if (gameData.questStates.cloakedFigure === "none") {
                addOutput("The cloaked figure whispers: 'I seek the strange amulet. Bring it to me and I shall reward you. Will you help or betray me?'");
                gameData.questStates.cloakedFigure = "asked";
            } else if (gameData.questStates.cloakedFigure === "helping") {
                addOutput("The cloaked figure awaits the amulet you must find here.");
            } else if (gameData.questStates.cloakedFigure === "betraying") {
                addOutput("The cloaked figure ignores you, hissing softly.");
            } else {
                addOutput("The cloaked figure stands silently.");
            }
        } else {
            addOutput(`You talk to the ${npc.name}. It doesn't have much to say.`);
        }
    }

    function giveItemToNPC(npc, item) {
        if (!npc) {
            addOutput("There's no one to give items to here.");
            return;
        }
        const itemIndex = gameData.inventory.indexOf(item);
        if (itemIndex === -1) {
            addOutput(`You don't have a ${item}.`);
            return;
        }

        if (npc.name === "weary traveler" && item === "berries") {
            gameData.inventory.splice(itemIndex, 1);
            addOutput("You give the berries to the weary traveler. He thanks you and hands you a healing potion!");
            gameData.inventory.push("healing potion");
            npc.wantsHelp = false;
        } else if (npc.name === "cloaked figure" && item === "strange amulet" && gameData.questStates.cloakedFigure === "helping") {
            // Player completes the quest
            gameData.inventory.splice(itemIndex,1);
            addOutput("You present the strange amulet. 'Excellent,' the cloaked figure says, rewarding you with a blessed sword (+10 attack).");
            gameData.player.attackPower += 10;
            gameData.questStates.cloakedFigure = "completed";
        } else {
            addOutput(`You give the ${item} to the ${npc.name}. They nod quietly.`);
            gameData.inventory.splice(itemIndex, 1);
        }
    }

    function tryMove(input, currentRoom) {
        let foundDirection = null;
        for (let dir in currentRoom.next) {
            const roomKey = currentRoom.next[dir];
            const roomName = roomKey.toLowerCase();
            if (input.includes(roomName) || input.includes(roomName.replace(/[^a-z]/g,''))) {
                foundDirection = dir;
                break;
            }
        }

        if (!foundDirection) {
            for (let dir in currentRoom.next) {
                const targetRoomKey = currentRoom.next[dir];
                if ((targetRoomKey.toLowerCase().includes("cave") && input.includes("cave")) ||
                    (targetRoomKey.toLowerCase().includes("forest") && input.includes("forest")) ||
                    (targetRoomKey.toLowerCase().includes("riverbank") && input.includes("river")) ||
                    (targetRoomKey.toLowerCase().includes("hillside") && input.includes("hill"))) {
                    foundDirection = dir;
                    break;
                }
            }
        }

        if (!foundDirection) {
            const directionMap = {
                north: ["north","n","up"],
                south: ["south","s","down"],
                east: ["east","e","right"],
                west: ["west","w","left"]
            };
            for (let dir in directionMap) {
                for (let syn of directionMap[dir]) {
                    if (input.includes(syn)) {
                        foundDirection = dir;
                        break;
                    }
                }
                if (foundDirection) break;
            }
        }

        if (foundDirection && currentRoom.next[foundDirection]) {
            gameData.currentRoom = currentRoom.next[foundDirection];
            addOutput(gameData.rooms[gameData.currentRoom].description);
        } else {
            addOutput("You can't go that way or enter that place right now.");
        }
    }

    if (action === "take") {
        const item = currentRoom.items ? currentRoom.items.find(i => input.includes(i)) : null;
        if (item) {
            gameData.inventory.push(item);
            currentRoom.items = currentRoom.items.filter(i => i !== item);
            addOutput(`You take the ${item}.`);
        } else {
            addOutput("There's nothing here to take.");
        }

    } else if (action === "look") {
        showRoomDetails();

    } else if (action === "attack") {
        if (currentRoom.enemies && currentRoom.enemies.length > 0) {
            const enemy = currentRoom.enemies[0];
            attackEnemy(enemy);
        } else {
            addOutput("There's nothing here to attack.");
        }

    } else if (action === "move") {
        tryMove(input, currentRoom);

    } else if (action === "run") {
        addOutput("You try to run, but end up where you started.");

    } else if (action === "jump") {
        addOutput("You jump around. It doesn't accomplish much.");

    } else if (action === "climb") {
        addOutput("You try to climb, but there's nothing suitable here.");

    } else if (action === "crawl") {
        addOutput("You crawl on the floor. It's cold and uncomfortable.");

    } else if (action === "duck") {
        addOutput("You duck down. Nothing passes overhead.");

    } else if (action === "dance") {
        addOutput("You dance merrily. It changes little, but you feel slightly more cheerful.");

    } else if (action === "pickNose") {
        addOutput("You pick your nose. Hopefully no one noticed.");

    } else if (action === "sing") {
        addOutput("You sing a tune, it echoes softly.");

    } else if (action === "yell") {
        addOutput("You yell loudly, the sound bouncing back.");

    } else if (action === "inventory") {
        if (gameData.inventory.length === 0) {
            addOutput("Your inventory is empty.");
        } else {
            addOutput("You are carrying: " + gameData.inventory.join(", "));
        }

    } else if (action === "help") {
        addOutput("You can move using commands like 'go north', 'enter cave', 'go into forest', etc.");
        addOutput("You can look around, take items, attack enemies, talk to NPCs, use/give items, eat, drink, listen, smell, feel, and more.");
        addOutput("Try natural phrases! Experiment and see what happens!");

    } else if (action === "use" || action === "equip") {
        if (input.includes("sword") && gameData.inventory.includes("sword")) {
            gameData.player.weapon = "sword";
            addOutput("You equip the sword. Your attack power grows!");
        } else if (input.includes("potion") && gameData.inventory.includes("healing potion")) {
            addOutput("You drink the healing potion. You feel invigorated!");
            const potIndex = gameData.inventory.indexOf("healing potion");
            if (potIndex !== -1) {
                gameData.inventory.splice(potIndex, 1);
            }
        } else {
            addOutput("You try to use or equip that, but nothing happens.");
        }

    } else if (action === "talk") {
        if (currentRoom.npc) {
            talkToNPC(currentRoom.npc);
        } else {
            addOutput("There's no one here to talk to.");
        }

    } else if (action === "trade" || action === "give") {
        const words = input.split(" ");
        const possibleItem = words[words.length-1];
        if (currentRoom.npc) {
            giveItemToNPC(currentRoom.npc, possibleItem);
        } else {
            addOutput("There's no one here to trade with.");
        }

    } else if (action === "eat") {
        if (input.includes("berries") && gameData.inventory.includes("berries")) {
            addOutput("You eat the berries. They taste sweet.");
            const berryIndex = gameData.inventory.indexOf("berries");
            if (berryIndex !== -1) {
                gameData.inventory.splice(berryIndex, 1);
            }
        } else {
            addOutput("You have nothing edible.");
        }

    } else if (action === "drink") {
        addOutput("You have nothing suitable to drink right now.");

    } else if (action === "listen") {
        addOutput("You pause and listen. You might hear dripping water in a cave, rustling leaves in a forest, or distant creatures.");

    } else if (action === "smell") {
        addOutput("You inhale deeply. Perhaps damp earth in a cave, fresh pine in a forest, or mossy scents.");

    } else if (action === "feel") {
        addOutput("You feel around. Rough stone walls, soft moss, or bark of a tree greet your touch.");

    } else {
        addOutput("You can't do that here.");
    }
}
