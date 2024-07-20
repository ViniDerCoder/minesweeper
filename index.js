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
        type: "special",
        width: 10,
        bombs: 2
    }
}


const minesweeper = new Minesweeper();

let selectedGame = 'bigbombs';

let flagMode = false;

const gameInfoBar = document.getElementById('game-info');

const flagButton = document.getElementById('flag-toggler');
const flagCounter = document.getElementById('flag-counter');

flagButton.addEventListener('click', () => {
    flagMode = !flagMode;
    flagButton.dataset.activated = flagMode;
});

const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', () => {
    reset(selectedGame);
});

function reset(id) {
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
    
        gridElement.appendChild(gridItem);
    }

    if(games[id].type === "special") minesweeper.initSpecial(id, games[id].width, games[id].bombs);
    else minesweeper.init(games[id].width, games[id].bombs);
    minesweeper.render();

    gameInfoBar.innerText = 'Minesweeper (' + selectedGame + ')';
    flagMode = false;
    flagButton.dataset.activated = false;
    flagCounter.innerText = minesweeper.bombs;
}

reset(selectedGame);


const settings = document.getElementsByClassName('settings-row');

for (let setting of settings) {
    setting.addEventListener('click', () => {
        reset(setting.id);
    });
}


minesweeper.render();

minesweeper.onEnd((state) => {
    if(state === 'win') {
        gameInfoBar.innerText = 'You won!';
    } else {
        gameInfoBar.innerText = 'You lost!';
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
            if(grid[row][cell] === -3) {
                gridItem.dataset.flag = true;
            } else if(grid[row][cell] === -4) {
                gridItem.dataset.bomb = false;
            } else if(grid[row][cell] === -2) {
                gridItem.dataset.bomb = true;
            } else if(grid[row][cell] === -1) {
                delete gridItem.dataset.bomb;
                delete gridItem.dataset.flag;
                gridItem.innerText = '';
            } else {
                gridItem.dataset.bomb = false;
                gridItem.dataset.flag = false;
                gridItem.innerText = grid[row][cell];
            }
        }
    }
    flagCounter.innerText = minesweeper.bombs - minesweeper.flags;
}