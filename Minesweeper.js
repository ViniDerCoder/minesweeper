import { updateGrid } from "./index.js";


export class Minesweeper {
    //-1 = grass, -2 = mine, -3 = flag, -4 = dirt, > 0 = dirt with n mines around

    gameLocked = false;

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
                row.push(-1);
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
    }

    click(x, y, flag = false) {
        if(x < 0 || x >= this.size || y < 0 || y >= this.size || this.board[y][x] === -4 || this.gameLocked) return
        if (flag) {
            if (this.board[y][x] === -3) {
                this.board[y][x] = -1;
            } else if (this.board[y][x] === -1) {
                this.board[y][x] = -3;
            }
        } else {
            if (this.mineBoard[y][x]) {
                this.board[y][x] = -2;
                this.gameLocked = true;
                this.render();
                this.endCallback ? this.endCallback("lose") : null;
            } else {
                const bombs = this.getFieldNumber(x, y);
                if (bombs === 0) {
                    this.board[y][x] = -4;
                    setTimeout(() => {
                        this.click(x - 1, y);
                        this.click(x + 1, y);
                        this.click(x, y - 1);
                        this.click(x, y + 1);
                        this.click(x - 1, y - 1);
                        this.click(x + 1, y + 1);
                        this.click(x + 1, y - 1);
                        this.click(x - 1, y + 1);
                    }, 300);
                } else {
                    this.board[y][x] = bombs;
                }
            }
        }
        this.render();
        if(this.checkWin()) {
            this.gameLocked = true;
            this.endCallback ? this.endCallback("win") : null;
        }
    }

    getFieldNumber(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (x + i >= 0 && x + i < this.size && y + j >= 0 && y + j < this.size) {
                    if (this.mineBoard[y + j][x + i]) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    get bombs() {
        return this.mines;
    }

    get flags() {
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[j][i] === -3) {
                    count++;
                }
            }
        }
        return count;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[j][i] === -1 && !this.mineBoard[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * 
     * @param {(state: "win" | "lose") => void} callback 
     */
    onEnd(callback) {
        this.endCallback = callback;
    }
}