import { Minesweeper } from './Minesweeper.js';

const gridElement = document.getElementById('game-board-grid');

const games = {
    "normal": {
        type: "normal",
        width: 10,
        bombs: 10
    },
    "hard": {
        type: "normal",
        width: 30,
        bombs: 80
    },
    "impossible": {
        type: "normal",
        width: 100,
        bombs: 750
    },
    "bigbombs": {
        type: "bigbombs",
        width: 30,
        bombs: 30
    },
    "bigbigbombs": {
        type: "bigbombs",
        width: 60,
        bombs: 90
    },
    "noflags": {
        type: "noflags",
        width: 10,
        bombs: 10
    },
    "bignoflags": {
        type: "noflags",
        width: 40,
        bombs: 125
    },
    "nonumbers": {
        type: "nonumbers",
        width: 10,
        bombs: 10
    },
    "chunkyhand": {
        type: "chunkyhand",
        width: 10,
        bombs: 10
    },
    "gravitation": {
        type: "gravitation",
        width: 10,
        bombs: 10
    },
    "biggravitation": {
        type: "gravitation",
        width: 30,
        bombs: 80
    },
    "teleport": {
        type: "teleportingbombs",
        width: 10,
        bombs: 10
    },
    "bigteleport": {
        type: "teleportingbombs",
        width: 30,
        bombs: 80
    },
    "flashlight": {
        type: "flashlight",
        width: 10,
        bombs: 10
    },
    "bigflashlight": {
        type: "flashlight",
        width: 30,
        bombs: 80
    },
    "doublebombs": {
        type: "doublemines",
        width: 16,
        bombs: 40
    },
}


const minesweeper = new Minesweeper();

let selectedGame = 'normal';

let flagMode = false;

const gameInfoBar = document.getElementById('game-info');

const flagButton = document.getElementById('flag-toggler');
const flagCounter = document.getElementById('flag-counter');

let reavealTimeout = setTimeout(() => {}, 0);

flagButton.addEventListener('click', () => {
    flagMode = !flagMode;
    flagButton.dataset.activated = flagMode;
});

const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', () => {
    reset(selectedGame);
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

function reset(id) {
    clearTimeout(reavealTimeout);
    selectedGame = id;

    while (gridElement.firstChild) {
        gridElement.removeChild(gridElement.firstChild);
    }

    gridElement.style.gridTemplateRows = 'repeat(' + games[id].width + ', 1fr)';
    gridElement.style.gridTemplateColumns = 'repeat(' + games[id].width + ', 1fr)';

    for (let i = 0; i < games[id].width * games[id].width; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.id = 'grid-item.' + i;
        gridItem.dataset.style = (i + Math.floor(i/games[id].width)) % 2 === 0 ? 'light' : 'dark';
        gridElement.style.fontSize = `${Math.floor(1000 / games[id].width) / 2}px`;
    
        gridItem.addEventListener('click', () => {
            minesweeper.userClick(i - Math.floor(i/games[id].width) * games[id].width, Math.floor(i/games[id].width), flagMode);
        });

        gridItem.addEventListener('mouseover', (e) => {
            hoveringFieldIndex = i;
        });

        gridItem.addEventListener('touchstart', (e) => {
            hoveringFieldIndex = i;
        });
    
        gridElement.appendChild(gridItem);
    }

    minesweeper.stopRendering();
    if(games[id].type !== "normal") minesweeper.initSpecial(games[id].type, games[id].width, games[id].bombs);
    else minesweeper.init(games[id].width, games[id].bombs);
    minesweeper.render();

    gameInfoBar.innerText = 'Minesweeper (' + selectedGame + ')';
    flagMode = false;
    flagButton.dataset.activated = false;
    flagCounter.innerText = minesweeper.bombs - minesweeper.flags;
}

reset(selectedGame);


const settings = document.getElementsByClassName('settings-row');

for (let setting of settings) {
    setting.addEventListener('click', () => {
        reset(setting.id);
    });
}


minesweeper.render();

Minesweeper.onEnd((state) => {
    if(state === 'win') {
        gameInfoBar.innerText = 'You won!';
    } else {
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
            const gridItem = document.getElementById('grid-item.' + (Number(cell) + Number(row) * games[selectedGame].width));
            if(!gridItem) {
                continue;
            }
            delete gridItem.dataset.blacked;
            delete gridItem.dataset.bomb;
            delete gridItem.dataset.bombs;
            delete gridItem.dataset.flag;
            delete gridItem.dataset.flags;

            if(grid[row][cell] === -3) {
                gridItem.dataset.flag = true;
            } else if(grid[row][cell] === -3.1) {
                gridItem.dataset.flags = true;
            } else if(grid[row][cell] === -4) {
                gridItem.dataset.bomb = false;
                gridItem.innerText = '';
            } else if(grid[row][cell] === -2) {
                gridItem.dataset.bomb = true;
            } else if(grid[row][cell] === -2.1) {
                gridItem.dataset.bombs = true;
            } else if(grid[row][cell] === -1) {
                gridItem.innerText = '';
            } else if(grid[row][cell] === -5) {
                gridItem.innerText ='';
                gridItem.dataset.blacked = true;
            } else {
                gridItem.dataset.bomb = false;
                gridItem.dataset.flag = false;
                gridItem.innerText = grid[row][cell];
            }
        }
    }
    flagCounter.innerText = minesweeper.bombs - minesweeper.flags;
}