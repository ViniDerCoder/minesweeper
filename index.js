import { Minesweeper } from './Minesweeper.js';

const gridElement = document.getElementById('game-board-grid');

const gridWidth = 10;

gridElement.style.gridTemplateRows = 'repeat(' + gridWidth + ', 1fr)';
gridElement.style.gridTemplateColumns = 'repeat(' + gridWidth + ', 1fr)';


const minesweeper = new Minesweeper(gridWidth, 10);

let flagMode = false;

for (let i = 0; i < gridWidth * gridWidth; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.id = 'grid-item.' + i;
    gridItem.dataset.style = (i + Math.floor(i/gridWidth)) % 2 === 0 ? 'light' : 'dark';
    gridItem.addEventListener('click', () => {
        console.log('clicked ', Math.floor(i/gridWidth), i - Math.floor(i/gridWidth) * gridWidth);
        minesweeper.click(i - Math.floor(i/gridWidth) * gridWidth, Math.floor(i/gridWidth), flagMode);
    });
    gridElement.appendChild(gridItem);
}

const flagButton = document.getElementById('flag-toggler');
const flagCounter = document.getElementById('flag-counter');
flagButton.addEventListener('click', () => {
    flagMode = !flagMode;
    flagButton.dataset.activated = flagMode;
});

minesweeper.render();

minesweeper.onEnd((state) => {
    if(state === 'win') {
        alert('You won!');
    } else {
        alert('You lost!');
    }
})

/**
 * @param {Array<Array<number>>} grid 
 */
export function updateGrid(grid) {
    for (let row in grid) {
        for (let cell in grid[row]) {
            const gridItem = document.getElementById('grid-item.' + (Number(cell) + Number(row) * gridWidth));
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
            } else {
                gridItem.dataset.bomb = false;
                gridItem.dataset.flag = false;
                gridItem.innerText = grid[row][cell];
            }

        }
    }
    flagCounter.innerText = minesweeper.bombs - minesweeper.flags;
}