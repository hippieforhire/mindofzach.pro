let outputBox, inputBox;

const gameData = {
    currentRoom: "caveEntrance",
    // Expanded world with NPC and moral choice scenario
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
    // Further expanded synonyms: triple amounts and add use/equip/talk/trade/wield synonyms
    synonyms: {
        look: [
            "look","examine","inspect","view","peer","see","observe","check","glance","stare","gaze","scrutinize",
            "study","scan","perceive","watch","consider","survey","have a look","take a look","look around",
            "examine surroundings","inspect area","scan room","check place","survey surroundings","examine room",
            "look closely","look carefully","look here","what do i see","describe area","inspect environment"
        ],
        take: [
            "take","grab","pick","take x","take the x","take the","pick up","seize","collect","acquire","obtain",
            "get hold of","snatch","remove","lift","get","claim","retrieve","fetch","steal","pluck","harvest","bag",
            "pocket","add to inventory","take item","get item","yank","pull","hoard","pickup","scoop up","gather"
        ],
        attack: [
            "attack","fight","hit","strike","punch","stab","slash","swing at","assault","bash","smack","clobber",
            "whack","beat up","engage","pummel","thrash","clout","hammer","lunge at","charge at","go after","kick",
            "headbutt","wrestle","duel","clash with","swing sword","swing weapon","use weapon","smite","jab",
            "cut","slice","bash skull","try to kill"
        ],
        north: [
            "north","go north","move north","head north","proceed north","travel north","northward","to north",
            "venture north","walk north","step north","head up","go upwards","north direction"
        ],
        south: [
            "south","go south","move south","head south","proceed south","travel south","southward","to south",
            "venture south","walk south","step south","head down","go downwards","south direction"
        ],
        east: [
            "east","go east","move east","head east","proceed east","travel east","eastward","to east",
            "venture east","walk east","step east","east direction","go right way"
        ],
        west: [
            "west","go west","move west","head west","proceed west","travel west","westward","to west",
            "venture west","walk west","step west","west direction","go left way"
        ],
        up: [
            "up","go up","move up","climb up","head up","ascend","upward","go upward","go upstairs","go upward path"
        ],
        down: [
            "down","go down","move down","climb down","descend","downward","go downward","go downstairs","go downward path"
        ],
        left: [
            "left","go left","move left","step left","head left","turn left","veer left","to the left"
        ],
        right: [
            "right","go right","move right","step right","head right","turn right","veer right","to the right"
        ],
        back: [
            "back","go back","move back","head back","return","go backward","go backwards","go behind","retreat"
        ],
        forward: [
            "forward","go forward","move forward","head forward","proceed forward","advance","go forth","go straight"
        ],
        run: [
            "run","sprint","dash","bolt","hurry","rush","flee","escape","leg it","make a run for it","race",
            "charge away","hightail","scurry","scuttle","beat it","clear out","jog","run away","run off","run forward"
        ],
        jump: [
            "jump","leap","hop","bounce","spring","vault","bound","skip"
        ],
        climb: [
            "climb","scaling","go climbing","scramble up","clamber","ascend using hands","climb upwards"
        ],
        crawl: [
            "crawl","creep","go on all fours","slither","move low","crawl around","crawl slowly"
        ],
        duck: [
            "duck","crouch","bend down","lower yourself","kneel","stoop","hunch down"
        ],
        dance: [
            "dance","boogie","groove","shake it","jig","twirl","waltz","tap dance","breakdance"
        ],
        pickNose: [
            "pick nose","pick your nose","dig nose","nose pick","clean nostril","dig in nostril","extract booger"
        ],
        sing: [
            "sing","croon","hum a tune","belt out a song","serenade","chant","warble","carol"
        ],
        yell: [
            "yell","shout","scream","call out","holler","bellow","cry out","roar"
        ],
        inventory: [
            "inventory","inv","show inventory","what do i have","check bag","check pouch","items on me","my stuff",
            "my items","open inventory","open bag","examine inventory","list items","what am i carrying"
        ],
        help: [
            "help","instructions","what can i do","commands","assist","how to play","guide","explain","show help",
            "help me","what are my options","i need help"
        ],
        use: [
            "use","utilize","apply","wield","equip","put on","activate","operate","make use of","handle",
            "use item","use weapon","use tool","employ"
        ],
        equip: [
            "equip","arm","wield","hold weapon","ready weapon","prepare sword","draw weapon","put weapon in hand"
        ],
        talk: [
            "talk","speak","converse","chat","address","greet","say hello","ask","question","communicate","engage in dialogue"
        ],
        trade: [
            "trade","barter","exchange","offer","negotiate","deal","swap"
        ],
        give: [
            "give","offer item","hand over","present","deliver","donate","contribute"
        ],
        eat: [
            "eat","consume","devour","bite","taste","chew","ingest"
        ],
        drink: [
            "drink","sip","gulp","quench","swallow","imbibe"
        ]
    },
    inventory: [],
    player: {
        attackPower: 10,
        weapon: null // can equip a sword to increase attackPower later
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

function processCommand(input) {
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

    // Helper functions
    function getWeaponBonus() {
        if (gameData.player.weapon === "sword") {
            return 10; // sword doubles attack power
        }
        return 0;
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
            addOutput("You can CHOOSE: give berries (if you have them) or refuse. Your choice may have consequences...");
        } else if (npc.name === "cloaked figure" && npc.hasQuest) {
            addOutput(`The cloaked figure whispers: 'I seek the strange amulet. Bring it to me and I shall reward you. Will you help or betray me?'`);
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
        // Moral choice: If you help traveler by giving berries, they may give you a reward.
        if (npc.name === "weary traveler" && item === "berries") {
            gameData.inventory.splice(itemIndex, 1);
            addOutput("You give the berries to the weary traveler. He thanks you and hands you a healing potion!");
            gameData.inventory.push("healing potion");
            npc.wantsHelp = false;
        } else {
            addOutput(`You give the ${item} to the ${npc.name}. They nod quietly.`);
            gameData.inventory.splice(itemIndex, 1);
        }
    }

    // handle actions
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
        showRoomDetails();

    } else if (["north","south","east","west","up","down","left","right","back","forward"].includes(action)) {
        const directionMap = {
            north: "north", south: "south", east: "east", west: "west",
            up: "north", down: "south",
            left: "west", right: "east",
            back: "south", forward: "north"
        };
        const dir = directionMap[action];
        if (dir && currentRoom.next && currentRoom.next[dir]) {
            gameData.currentRoom = currentRoom.next[dir];
            addOutput(gameData.rooms[gameData.currentRoom].description);
        } else {
            addOutput("You can't go that way.");
        }

    } else if (action === "attack") {
        if (currentRoom.enemies && currentRoom.enemies.length > 0) {
            const enemy = currentRoom.enemies[0];
            attackEnemy(enemy);
        } else {
            addOutput("There's nothing here to attack.");
        }

    } else if (action === "run") {
        addOutput("You try to run, but end up where you started. Perhaps choose a direction instead.");

    } else if (action === "jump") {
        addOutput("You jump around. It doesn't accomplish much.");

    } else if (action === "climb") {
        addOutput("You try to climb but find nothing suitable to scale.");

    } else if (action === "crawl") {
        addOutput("You crawl on the floor. It's cold and uncomfortable.");

    } else if (action === "duck") {
        addOutput("You duck down. Nothing passes overhead.");

    } else if (action === "dance") {
        addOutput("You dance merrily. It lightens your mood but changes little else.");

    } else if (action === "pickNose") {
        addOutput("You pick your nose, feeling a bit silly. No one saw that, right?");

    } else if (action === "sing") {
        addOutput("You sing a tune, your voice echoing in the surroundings.");

    } else if (action === "yell") {
        addOutput("You yell loudly. The echo returns, mocking your outburst.");

    } else if (action === "inventory") {
        if (gameData.inventory.length === 0) {
            addOutput("Your inventory is empty.");
        } else {
            addOutput("You are carrying: " + gameData.inventory.join(", "));
        }

    } else if (action === "help") {
        addOutput("You can look, take items, attack enemies, move in directions, check inventory, run, jump, climb, dance, sing, yell, use or equip items, talk to NPCs, trade, give items, and more. Experiment and see what happens!");
        addOutput("You might find swords to increase your attack power, potions to heal, and NPCs offering quests or moral dilemmas.");

    } else if (action === "use" || action === "equip") {
        // Check if trying to equip weapon
        if (input.includes("sword") && gameData.inventory.includes("sword")) {
            gameData.player.weapon = "sword";
            addOutput("You equip the sword, feeling its weight. Your attack power grows!");
        } else if (input.includes("potion") && gameData.inventory.includes("healing potion")) {
            addOutput("You drink the healing potion. You feel invigorated! (For now, this just makes you feel good.)");
            // Remove the potion after use
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
        // try giving item: user might type "give berries", "offer berries"
        const words = input.split(" ");
        const possibleItem = words[words.length-1]; // last word might be item
        if (currentRoom.npc) {
            giveItemToNPC(currentRoom.npc, possibleItem);
        } else {
            addOutput("There's no one here to trade with.");
        }

    } else if (action === "eat") {
        if (input.includes("berries") && gameData.inventory.includes("berries")) {
            addOutput("You eat the berries. They taste sweet and give you a slight boost of energy.");
            const berryIndex = gameData.inventory.indexOf("berries");
            if (berryIndex !== -1) {
                gameData.inventory.splice(berryIndex, 1);
            }
        } else {
            addOutput("You have nothing edible or you're not sure what to eat.");
        }

    } else if (action === "drink") {
        // If user tries to drink from river without a container?
        addOutput("You don't have anything suitable to drink right now.");

    } else {
        addOutput("You can't do that here.");
    }
}
