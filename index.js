const gridElement = document.getElementById('game-board-grid');

const gridWidth = 10;

gridElement.style.gridTemplateRows = 'repeat(' + gridWidth + ', 1fr)';
gridElement.style.gridTemplateColumns = 'repeat(' + gridWidth + ', 1fr)';


for (let i = 0; i < gridWidth * gridWidth; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.id = 'grid-item.' + i;
    gridItem.dataset.style = (i + Math.floor(i/gridWidth)) % 2 === 0 ? 'light' : 'dark';
    gridElement.appendChild(gridItem);
}