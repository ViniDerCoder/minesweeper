import { updateGrid } from "./index.js";


export class Minesweeper {
    //0 = grass, -1 = mine, 1 = flag, 2 = dirt

    constructor(size, mines) {
        this.size = size;
        this.mines = mines;
        this.board = this.generateBoard();
        this.mineBoard = this.randomizeMines();
    }

    generateBoard() {
        let board = [];
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(0);
            }
            board.push(row);
        }
        return board;
    }

    randomizeMines() {
        let mineBoard = [];
        let mines = this.mines;
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(false);
            }
            mineBoard.push(row);
        }
        while (mines > 0) {
            let x = Math.floor(Math.random() * this.size);
            let y = Math.floor(Math.random() * this.size);
            if (!mineBoard[x][y]) {
                mineBoard[x][y] = true
                mines--;
            }
        }
        return mineBoard
    }

    render() {
        updateGrid(this.board)
        setTimeout(() => {
            this.render()
        }, 100)
    }

    click(x, y) {
        if (this.mineBoard[y][x]) {
            this.board[y][x] = -1;
        } else {
            this.board[y][x] = 2;
        }
    }

}