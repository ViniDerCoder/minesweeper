import { updateGrid } from "./index.js";


export class Minesweeper {
    //-1 = grass, -2 = mine, -3 = flag, -4 = dirt, > 0 = dirt with n mines around

    gameLocked = false;
    clicksMade = 0;

    init(size, mines) {
        this.special = null;
        this.gameLocked = true;
        this.clicksMade = 0;
        this.size = size;
        this.mines = mines;
        this.board = this.generateBoard();
        this.mineBoard = this.randomizeMines();
        setTimeout(() => {
            this.gameLocked = false;
        }, 500);
    }

    initSpecial(id, size, mines) {
        switch (id) {
            case "bigbombs":
                this.special = new BigBombMinesweeper();
                this.special.init(size, mines);
            break;
        }
    }

    generateBoard() {
        if(this.special) return this.special.generateBoard();
        console.log('generating board with size: ' + this.size);
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
        if(this.special) return this.special.randomizeMines();
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
        if(this.special) return this.special.render();
        updateGrid(this.board)
    }

    userClick(x, y, flag = false) {
        if(this.special) return this.special.userClick(x, y, flag);
        console.log('user clicked', x, y, flag);
        this.click(x, y, flag);
        this.clicksMade++;
    }

    click(x, y, flag = false) {
        if(this.special) return this.special.click(x, y, flag);
        console.log(this.board)
        console.log('clicking', x, y, flag);
        if(x < 0 || x >= this.size || y < 0 || y >= this.size || this.board[y][x] === -4 || this.gameLocked) return
        if (this.board[y][x] === -3) {
            this.board[y][x] = -1;
        } else if (flag) {
            if (this.board[y][x] === -1) {
                this.board[y][x] = -3;
            }
        } else {
            if (this.mineBoard[y][x]) {
                if(this.clicksMade === 0) {
                    console.log('mine on first click, moving mine');
                    this.mineBoard = this.randomizeMines();
                    this.click(x, y);
                } else {
                    this.board[y][x] = -2;
                    this.gameLocked = true;
                    this.render();
                    this.endCallback ? this.endCallback("lose") : null;
                }
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
        if(this.special) return this.special.getFieldNumber(x, y);
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
        if(this.special) return this.special.bombs;
        return this.mines;
    }

    get flags() {
        if(this.special) return this.special.flags;
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
        if(this.special) return this.special.checkWin();
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



class BigBombMinesweeper extends Minesweeper {
    randomizeMines() {
        console.log('randomizing big bomb mines');
        let mineBoard = [];
        let mines = this.mines;
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(0);
            }
            mineBoard.push(row);
        }
        let unnsuccessful = 0;
        while (mines > 0 && unnsuccessful < 100) {
            let x = Math.ceil(Math.random() * (this.size - 2));
            let y = Math.ceil(Math.random() * (this.size - 2));
            console.log('trying to place mine at', x, y);
            if (
                mineBoard[x][y] === 0 && 
                mineBoard[x-1][y] === 0 &&
                mineBoard[x+1][y] === 0 &&
                mineBoard[x][y-1] === 0 &&
                mineBoard[x][y+1] === 0 &&
                mineBoard[x-1][y-1] === 0 &&
                mineBoard[x+1][y+1] === 0 &&
                mineBoard[x+1][y-1] === 0 &&
                mineBoard[x-1][y+1] === 0

            ) {
                mineBoard[x][y] = mines;
                mineBoard[x-1][y] = mines;
                mineBoard[x+1][y] = mines;
                mineBoard[x][y-1] = mines;
                mineBoard[x][y+1] = mines;
                mineBoard[x-1][y-1] = mines;
                mineBoard[x+1][y+1] = mines;
                mineBoard[x+1][y-1] = mines;
                mineBoard[x-1][y+1] = mines;
                unnsuccessful = 0;
                console.log('placed mine at', x, y);
                mines--;
            } else unnsuccessful++; 
        }
        console.log('mines placed', this.mines - mines);
        console.log(mineBoard);
        return mineBoard
    }

    getFieldNumber(x, y) {
        const foundBombs = {}
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                if (x + i >= 0 && x + i < this.size && y + j >= 0 && y + j < this.size) {
                    if (this.mineBoard[y + j][x + i]) {
                        foundBombs[this.mineBoard[y + j][x + i]] = true;
                    }
                }
            }
        }
        return Object.keys(foundBombs).length;
    }
}