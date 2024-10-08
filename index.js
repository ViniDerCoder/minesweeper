import { Minesweeper } from './Minesweeper.js';

const gridElement = document.getElementById('game-board-grid');

const games = {
    "normal": {
        name: "Normal",
        type: "normal",
        width: 10,
        bombs: 10
    },
    "hard": {
        name: "Hard",
        type: "normal",
        width: 30,
        bombs: 80
    },
    "impossible": {
        name: "Impossible",
        type: "normal",
        width: 100,
        bombs: 750
    },
    "bigbombs": {
        name: "Big-Bombs",
        type: "bigbombs",
        width: 30,
        bombs: 30
    },
    "bigbigbombs": {
        name: "Big Big-Bombs",
        type: "bigbombs",
        width: 60,
        bombs: 90
    },
    "noflags": {
        name: "No Flags",
        type: "noflags",
        width: 10,
        bombs: 10
    },
    "bignoflags": {
        name: "Big No Flags",
        type: "noflags",
        width: 40,
        bombs: 125
    },
    "nonumbers": {
        name: "No Numbers",
        type: "nonumbers",
        width: 10,
        bombs: 10
    },
    "chunkyhand": {
        name: "Chunky Hand",
        type: "chunkyhand",
        width: 10,
        bombs: 10
    },
    "gravitation": {
        name: "Gravitation",
        type: "gravitation",
        width: 10,
        bombs: 10
    },
    "biggravitation": {
        name: "Big Gravitation",
        type: "gravitation",
        width: 30,
        bombs: 80
    },
    "teleport": {
        name: "Teleporting Bombs",
        type: "teleportingbombs",
        width: 10,
        bombs: 10
    },
    "bigteleport": {
        name: "Big Teleporting Bombs",
        type: "teleportingbombs",
        width: 30,
        bombs: 80
    },
    "flashlight": {
        name: "Flashlight",
        type: "flashlight",
        width: 10,
        bombs: 10
    },
    "bigflashlight": {
        name: "Big Flashlight",
        type: "flashlight",
        width: 30,
        bombs: 80
    },
    "doublebombs": {
        name: "Double Bombs",
        type: "doublemines",
        width: 16,
        bombs: 40
    },
    "bigdoublebombs": {
        name: "Big Double Bombs",
        type: "doublemines",
        width: 30,
        bombs: 100
    },
    "antimines": {
        name: "Anti-Mines",
        type: "antimines",
        width: 10,
        bombs: 10
    },
    "bigantimines": {
        name: "Big Anti-Mines",
        type: "antimines",
        width: 30,
        bombs: 80
    },
    "connectededges": {
        name: "Connected Edges",
        type: "connectededges",
        width: 10,
        bombs: 15
    },
    "flagscount": {
        name: "Flags Count",
        type: "flagscount",
        width: 10,
        bombs: 10
    },
    "diggingdog": {
        name: "Digging Dog",
        type: "diggingdog",
        width: 10,
        bombs: 10
    },
    "bigdiggingdog": {
        name: "Big Digging Dog",
        type: "diggingdog",
        width: 30,
        bombs: 80
    },
    "walkinghorse": {
        name: "Walking Horse",
        type: "walkinghorse",
        width: 10,
        bombs: 10
    },
    "bigwalkinghorse": {
        name: "Big Walking Horse",
        type: "walkinghorse",
        width: 30,
        bombs: 80
    },
    "unreaveal": {
        name: "Unreaveal",
        type: "unreavealing",
        width: 10,
        bombs: 10
    },
    "tickingbombs": {
        name: "Ticking Bombs",
        type: "tickingbombs",
        width: 10,
        bombs: 10
    },
    "daynight": {
        name: "Day Night",
        type: "daynight",
        width: 10,
        bombs: 10
    },
    "math": {
        name: "Math",
        type: "math",
        width: 10,
        bombs: 10
    },
}

const gameSettings = document.getElementById('game-presets');

for (let game in games) {
    const setting = document.createElement('div');
    setting.classList.add('settings-row');
    setting.id = game;
    const label = document.createElement('div')
    label.classList.add('settings-label');
    label.innerText = games[game].name;
    setting.appendChild(label);
    gameSettings.appendChild(setting);
}

const gameTypesSelector = document.getElementById('gamemode-select');
let selectedGameTypeItem = "normal";

let added = []
for (let game in games) {
    if(added.includes(games[game].type)) continue;
    added.push(games[game].type);
    const option = document.createElement('option');
    option.value = games[game].type;
    option.innerText = games[game].type;
    gameTypesSelector.appendChild(option);
}

gameTypesSelector.addEventListener('change', (e) => {
    selectedGameTypeItem = e.target.value;
});


const minesweeper = new Minesweeper();

let selectedGame = 'normal';

let currentStreak = 0;

let flagMode = false;

const gameInfoBar = document.getElementById('game-info');
console.log(gameInfoBar);

const flagButton = document.getElementById('flag-toggler');
const flagCounter = document.getElementById('flag-counter');

let reavealTimeout = setTimeout(() => {}, 0);

flagButton.addEventListener('click', () => {
    flagMode = !flagMode;
    flagButton.dataset.activated = flagMode;
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        flagMode = !flagMode;
        flagButton.dataset.activated = flagMode;
    }
});

const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', () => {
    reset(selectedGame, selectedGame === "custom" ? { width: minesweeper.size, bombs: minesweeper.bombs, type: selectedGameTypeItem } : undefined);
});

let mousePos = { x: 0, y: 0 };

export function getMousePos() {
    return { x: mousePos.x, y: mousePos.y };
}

document.addEventListener('mousemove', (e) => {
    mousePos = { x: e.clientX, y: e.clientY };
});

let hoveringFieldIndex = null;

export function getHoveringField() {
    return hoveringFieldIndex;
}

function reset(id, { width, bombs, type } = games[id]) {
    if(!minesweeper.checkWin()) currentStreak = 0;

    clearTimeout(reavealTimeout);
    selectedGame = id;
    console.log("Starting game: " + id + "(" + type + ")" + " with width: " + width + " and bombs: " + bombs);

    while (gridElement.firstChild) {
        gridElement.removeChild(gridElement.firstChild);
    }

    gridElement.style.gridTemplateRows = 'repeat(' + width + ', 1fr)';
    gridElement.style.gridTemplateColumns = 'repeat(' + width + ', 1fr)';

    for (let i = 0; i < width * width; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.id = 'grid-item.' + i;
        gridItem.dataset.style = (i + Math.floor(i/width)) % 2 === 0 ? 'light' : 'dark';
        gridItem.dataset.type = -1;
        gridElement.style.fontSize = `${Math.floor(1000 / width) / 2}px`;
    
        gridItem.addEventListener('click', () => {
            minesweeper.userClick(i - Math.floor(i/width) * width, Math.floor(i/width), flagMode);
        });

        gridItem.addEventListener('mouseover', (e) => {
            hoveringFieldIndex = i;
        });

        gridItem.addEventListener('touchstart', (e) => {
            hoveringFieldIndex = i;
        });

        gridItem.addEventListener('touchmove', (e) => {
            hoveringFieldIndex = i;
        })
    
        gridElement.appendChild(gridItem);
    }

    minesweeper.stopRendering();
    if(type !== "normal") minesweeper.initSpecial(type, width, bombs);
    else minesweeper.init(width, bombs);
    minesweeper.render();

    const streakDiv = document.getElementById('streak-count');
    streakDiv.innerText = currentStreak;

    gameInfoBar.innerText = (games[id] ? games[id].name : "Custom") + '-Minesweeper';
    flagMode = false;
    flagButton.dataset.activated = false;
    flagCounter.innerText = minesweeper.bombs - minesweeper.flags;
}

reset(selectedGame);

const customGameButton = document.getElementById('custom-game-button');

customGameButton.addEventListener('click', () => {
    const width = document.getElementById('width-input').value;
    const bombs = document.getElementById('bomb-input').value;
    if(width < 1 || bombs < 1) return;
    reset('custom', { width, bombs, type: selectedGameTypeItem });
})


const settings = document.getElementsByClassName('settings-row');

for (let setting of settings) {
    setting.addEventListener('click', () => {
        reset(setting.id);
    });
}


minesweeper.render();

Minesweeper.onEnd((state) => {
    if(state === 'win') {
        console.log("wins");
        currentStreak++;
        gameInfoBar.innerText = 'You won!';
    } else {
        console.log("lost");
        currentStreak = 0;
        gameInfoBar.innerText = 'You lost!';
        reavealTimeout = setTimeout(() => {
            minesweeper.reveal();
        }, 1500);
    }
})

/**
 * @param {Array<Array<number>>} grid 
 */
export function updateGrid(grid) {
    for (let row in grid) {
        for (let cell in grid[row]) {
            const gridItem = document.getElementById('grid-item.' + (Number(cell) + Number(row) * minesweeper.size));
            if(!gridItem) {
                continue;
            }

            if(typeof grid[row][cell] === 'object') {
                if(gridItem.dataset.type == grid[row][cell].style && gridItem.dataset.value == grid[row][cell].text) continue;
                if(grid.length <= 30 && grid[row][cell].style !== -3) gridItem.dataset.rotation = 90;
                setTimeout(() => {
                    gridItem.dataset.type = grid[row][cell].style;
                    gridItem.innerText = grid[row][cell].text;
                    gridItem.dataset.value = grid[row][cell].text;
                    if(grid[row][cell].length) {
                        gridItem.style.fontSize = `${Math.floor(1000 / minesweeper.size) / grid[row][cell].length}px`;
                    }
                    else if(gridItem.dataset.value.length > 2) gridItem.style.fontSize = `${Math.floor(1000 / minesweeper.size) / 3}px`;
    
                    gridItem.dataset.rotation = 0;
                }, 100);
            } else {
                if(gridItem.dataset.type == (grid[row][cell] >= 0 ? (gridItem.innerText == (grid[row][cell] > 100 ? -(grid[row][cell] - 100) : grid[row][cell]) ? -4 : 0) : grid[row][cell])) continue;
                if(grid.length <= 30 && grid[row][cell] !== -3) gridItem.dataset.rotation = 90;
                setTimeout(() => {
                    gridItem.dataset.type = grid[row][cell];
                    gridItem.innerText = '';
    
                    if(grid[row][cell] >= 0) {
                        gridItem.dataset.type = -4;
                        gridItem.innerText = grid[row][cell] > 100 ? -(grid[row][cell] - 100) : grid[row][cell];
                        if(gridItem.innerText.length > 2) gridItem.style.fontSize = `${Math.floor(1000 / minesweeper.size) / 3}px`;
                    }
    
                    gridItem.dataset.rotation = 0;
                }, 100);
            }
        }
    }
    setTimeout(() => MathJax.typeset(), 120 );
    flagCounter.innerText = minesweeper.bombs - minesweeper.flags;
}