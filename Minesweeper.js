import { getHoveringField, updateGrid } from "./index.js";


export class Minesweeper {
    //-1 = grass, -2 = mine, -3 = flag, -4 = dirt, -5 = black, > 0 = dirt with n mines around

    gameLocked = false;
    clicksMade = 0;
    isRendering = true;

    init(size, mines) {
        this.special = null;
        this.isRendering = true;
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
        this.size = size;
        this.mines = mines;
        
        switch (id) {
            case "bigbombs":
                this.special = new BigBombMinesweeper();
                this.special.init(size, mines);
                break;
            case "noflags":
                this.special = new NoFlagMinesweeper();
                this.special.init(size, mines);
                break;
            case "nonumbers":
                this.special = new NoNumbersMinesweeper();
                this.special.init(size, mines);
                break;
            case "chunkyhand":
                this.special = new ChunkyHandMineSweeper();
                this.special.init(size, mines);
                break;
            case "gravitation":
                this.special = new GravitationMinesweeper();
                this.special.init(size, mines);
                break;
            case "teleportingbombs":
                this.special = new TeleportingBombsMinesweeper();
                this.special.init(size, mines);
                break;
            case "flashlight":
                this.special = new FlashLightMinesweeper();
                this.special.init(size, mines);
                break;
            case "doublemines":
                this.special = new DoubleMinesMineSweeper();
                this.special.init(size, mines);
                break;
            case "antimines":
                this.special = new AntiMinesMineSweeper();
                this.special.init(size, mines);
                break;
        }
    }

    generateBoard() {
        if (this.special) return this.special.generateBoard();
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
        if (this.special) return this.special.randomizeMines();
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
        if(!this.isRendering) return;
        if (this.special) return this.special.render();
        updateGrid(this.board)
    }

    userClick(x, y, flag = false) {
        if (this.special) return this.special.userClick(x, y, flag);
        if (this.gameLocked) return;
        console.log('user clicked', x, y, flag);
        this.click(x, y, flag);
        this.clicksMade++;
        this.render();
    }

    click(x, y, flag = false) {
        if (this.special) return this.special.click(x, y, flag);
        if (x < 0 || x >= this.size || y < 0 || y >= this.size || this.board[y][x] === -4 || this.gameLocked) return
        console.log('clicking', x, y, flag);
        if (this.board[y][x] === -3) {
            this.board[y][x] = -1;
        } else if (flag) {
            if (this.board[y][x] === -1) {
                this.board[y][x] = -3;
            }
        } else {
            if (this.mineBoard[y][x]) {
                if (this.clicksMade === 0) {
                    console.log('mine on first click, moving mine');
                    this.mineBoard = this.randomizeMines();
                    this.click(x, y);
                } else {
                    this.board[y][x] = -2;
                    this.gameLocked = true;
                    this.render();
                    Minesweeper.endCallback ? Minesweeper.endCallback("lose") : null;
                }
            } else {
                const bombs = this.getFieldNumber(x, y);
                if (bombs === 0) {
                    this.board[y][x] = -4;
                    this.click(x - 1, y);
                    this.click(x + 1, y);
                    this.click(x, y - 1);
                    this.click(x, y + 1);
                    this.click(x - 1, y - 1);
                    this.click(x + 1, y + 1);
                    this.click(x + 1, y - 1);
                    this.click(x - 1, y + 1);
                } else {
                    this.board[y][x] = bombs;
                }
            }
        }
        if (this.checkWin()) {
            console.log('wins');
            this.gameLocked = true;
            Minesweeper.endCallback ? Minesweeper.endCallback("win") : null;
        }
    }

    getFieldNumber(x, y) {
        if (this.special) return this.special.getFieldNumber(x, y);
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
        if (this.special) return this.special.bombs;
        return this.mines;
    }

    get flags() {
        if (this.special) return this.special.flags;
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
        if (this.special) return this.special.checkWin();
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[j][i] === -1 && !this.mineBoard[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }

    reveal() {
        if (this.special) return this.special.reveal();
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.mineBoard[j][i]) {
                    this.board[j][i] = -2;
                } else {
                    const num = this.getFieldNumber(i, j);
                    this.board[j][i] = num ? num : -4;
                }
            }
        }
        this.render();
    }

    stopRendering() {
        if(this.special) this.special.stopRendering();
        this.isRendering = false;
    }

    /**
     * 
     * @param {(state: "win" | "lose") => void} callback 
     */
    static onEnd(callback) {
        this.endCallback = callback;
    }
}



class NoFlagMinesweeper extends Minesweeper {
    get flags() {
        return this.mines;
    }

    userClick(x, y, flag = false) {
        if (this.gameLocked) return;
        if (flag) return;
        console.log('user clicked', x, y, flag);
        this.click(x, y, flag);
        this.clicksMade++;
        this.render();
    }
}


class NoNumbersMinesweeper extends Minesweeper {
    render() {
        updateGrid(this.board.map(row => row.map(cell => cell > 0 ? -4 : cell)))
    }
}


class ChunkyHandMineSweeper extends Minesweeper {
    userClick(x, y, flag = false) {
        if (this.gameLocked) return;
        console.log('user clicked', x, y, flag);
        this.click(x, y, flag);
        this.click(x + 1, y, flag);
        this.click(x - 1, y, flag);
        this.click(x, y + 1, flag);
        this.click(x, y - 1, flag);

        this.clicksMade++;
        this.render();
    }
}


class GravitationMinesweeper extends Minesweeper {
    userClick(x, y, flag = false) {
        if (this.gameLocked) return;
        console.log('user clicked', x, y, flag);
        while (y < this.size - 1 && this.board[y + 1][x] === -1) {
            console.log('falling', x, y);
            y++;
        }
        this.click(x, y, flag);

        this.clicksMade++;
        this.render();
    }
}


class TeleportingBombsMinesweeper extends Minesweeper {
    userClick(x, y, flag = false) {
        if (this.gameLocked) return;
        console.log('user clicked', x, y, flag);
        this.click(x, y, flag);

        this.clicksMade++;

        const bombs = this.mineBoard.map((row, ind) => row.map((cell, i) => cell ? { y: ind, x: i } : undefined)).flat().filter(row => row);

        console.log('searching for teleporting bomb');
        let trys = 0;
        let rndBombIndex = Math.floor(Math.random() * bombs.length);
        while (this.board[bombs[rndBombIndex].y][bombs[rndBombIndex].x] !== -1 && trys < 100) {
            rndBombIndex = Math.floor(Math.random() * bombs.length);
            trys++;
        }

        if (trys >= 100) return this.render();
        console.log('teleporting bomb from', bombs[rndBombIndex].x, bombs[rndBombIndex].y);

        trys = 0;
        let freeCells = this.board.map((row, ind) => row.map((cell, i) => cell === -1 && !this.mineBoard[ind][i]? { y: ind, x: i } : undefined)).flat().filter(row => row);
        if (freeCells.length === 0) return this.render();
        let rndEmptyIndex = Math.floor(Math.random() * freeCells.length);
        while (this.board[freeCells[rndEmptyIndex].y][freeCells[rndEmptyIndex].x] !== -1 && trys < 1000) {
            rndEmptyIndex = Math.floor(Math.random() * freeCells.length);
            trys++;
        }

        if (trys >= 1000) return this.render();
        console.log('teleporting bomb to', freeCells[rndEmptyIndex].x, freeCells[rndEmptyIndex].y);
        this.mineBoard[bombs[rndBombIndex].y][bombs[rndBombIndex].x] = false;
        this.mineBoard[freeCells[rndEmptyIndex].y][freeCells[rndEmptyIndex].x] = true;
        

        const numsToUpdate = this.board.map((row, ind) => row.map((cell, i) => cell >= 0 || cell === -4 ? { y: ind, x: i } : undefined)).flat().filter(row => row);
        

        for (let num of numsToUpdate) {
            const n = this.getFieldNumber(num.x, num.y);
            this.board[num.y][num.x] = n ? n : -4;
        }


        this.render();
    }
}


class FlashLightMinesweeper extends Minesweeper {
    render() {
        if(!this.isRendering) return;
        const hoveringField = getHoveringField();
        const x = hoveringField % this.size;
        const y = Math.floor(hoveringField / this.size);

        const newBoard = this.board
        .map((row, ind) => 
            row.map((cell, i) => 
                (((x === i || x === i-1 || x === i+1) && (y === ind || y === ind-1 || y === ind+1)) || (x === i+2 && y === ind) || (x === i-2 && y === ind) || (x === i && y === ind+2) || (x === i && y === ind-2)) ? cell : -5
            )
        );
        
        updateGrid(newBoard)
        setTimeout(() => {
            this.render();
        }, 100)
    }
}


class AntiMinesMineSweeper extends Minesweeper {
    antimines = 0;
    randomizeMines() {
        console.log('randomizing anti mines');
        let mineBoard = [];
        let mines = this.mines;
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(0);
            }
            mineBoard.push(row);
        }
        while (mines > 0) {
            let x = Math.floor(Math.random() * this.size);
            let y = Math.floor(Math.random() * this.size);
            if (!mineBoard[y][x]) {
                mineBoard[y][x] = (Math.floor(Math.random() * 2) + 1 === 1) ? 1 : -1;
                if(mineBoard[y][x] === -1) this.antimines++;
                mines--;
            }
        }
        return mineBoard
    }

    getFieldNumber(x, y) {
        let count = undefined;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (x + i >= 0 && x + i < this.size && y + j >= 0 && y + j < this.size) {
                    if (this.mineBoard[y + j][x + i]) {
                        if(!count) count = 0;
                        count += this.mineBoard[y + j][x + i];
                    }
                }
            }
        }
        return count;
    }

    click(x, y, flag = false) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size || this.board[y][x] === -4 || this.gameLocked) return
        console.log('clicking', x, y, flag);
        if ((this.board[y][x] === -3 && !flag) || this.board[y][x] === -3.2) {
            this.board[y][x] = -1;
        } else if (flag) {
            if (this.board[y][x] === -1) {
                this.board[y][x] = -3;
            } else if (this.board[y][x] === -3) {
                this.board[y][x] = -3.2;
            }
        } else {
            if (this.mineBoard[y][x]) {
                if (this.clicksMade === 0) {
                    console.log('mine on first click, moving mine');
                    this.mineBoard = this.randomizeMines();
                    this.click(x, y);
                } else {
                    this.board[y][x] = this.mineBoard[y][x] === -1 ? -2.2 : -2;
                    this.gameLocked = true;
                    this.render();
                    Minesweeper.endCallback ? Minesweeper.endCallback("lose") : null;
                }
            } else {
                const bombs = this.getFieldNumber(x, y);
                if (bombs === undefined) {
                    this.board[y][x] = -4;
                    this.click(x - 1, y);
                    this.click(x + 1, y);
                    this.click(x, y - 1);
                    this.click(x, y + 1);
                    this.click(x - 1, y - 1);
                    this.click(x + 1, y + 1);
                    this.click(x + 1, y - 1);
                    this.click(x - 1, y + 1);
                } else {
                    if(bombs < 0) this.board[y][x] = (-bombs) + 100;
                    else this.board[y][x] = bombs;
                }
            }
        }
        if (this.checkWin()) {
            console.log('wins');
            this.gameLocked = true;
            Minesweeper.endCallback ? Minesweeper.endCallback("win") : null;
        }
    }

    reveal() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.mineBoard[j][i]) {
                    this.board[j][i] = this.mineBoard[j][i] === -1 ? -2.2 : -2;
                } else {
                    const num = this.getFieldNumber(i, j);
                    if(num < 0) this.board[j][i] = (-num) + 100;
                    else this.board[j][i] = ((num !== undefined) ? num : -4);
                }
            }
        }
        this.render();
    }

    get flags() {
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[j][i] === -3) {
                    count++;
                } else if (this.board[j][i] === -3.2) {
                    count--;
                }
            }
        }
        return count;
    }

    get bombs() {
        return this.mines - this.antimines;
    }
}


class DoubleMinesMineSweeper extends Minesweeper {
    randomizeMines() {
        console.log('randomizing double mines');
        let mineBoard = [];
        let mines = this.mines;
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(0);
            }
            mineBoard.push(row);
        }
        while (mines > 0) {
            let x = Math.floor(Math.random() * this.size);
            let y = Math.floor(Math.random() * this.size);
            if (!mineBoard[y][x]) {
                let double = (Math.floor(Math.random() * 2) + 1) === 1;
                if(mines === 1) double = false;

                mineBoard[y][x] = double ? 2 : 1;
                mines--;
                double ? mines-- : null;
            }
        }
        return mineBoard
    }

    getFieldNumber(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (x + i >= 0 && x + i < this.size && y + j >= 0 && y + j < this.size) {
                    if (this.mineBoard[y + j][x + i]) {
                        count += this.mineBoard[y + j][x + i];
                    }
                }
            }
        }
        return count;
    }

    click(x, y, flag = false) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size || this.board[y][x] === -4 || this.gameLocked) return
        console.log('clicking', x, y, flag);
        if ((this.board[y][x] === -3 && !flag) || this.board[y][x] === -3.1) {
            this.board[y][x] = -1;
        } else if (flag) {
            if (this.board[y][x] === -1) {
                this.board[y][x] = -3;
            } else if (this.board[y][x] === -3) {
                this.board[y][x] = -3.1;
            }
        } else {
            if (this.mineBoard[y][x]) {
                if (this.clicksMade === 0) {
                    console.log('mine on first click, moving mine');
                    this.mineBoard = this.randomizeMines();
                    this.click(x, y);
                } else {
                    this.board[y][x] = this.mineBoard[y][x] === 1 ? -2 : -2.1;
                    this.gameLocked = true;
                    this.render();
                    Minesweeper.endCallback ? Minesweeper.endCallback("lose") : null;
                }
            } else {
                const bombs = this.getFieldNumber(x, y);
                if (bombs === 0) {
                    this.board[y][x] = -4;
                    this.click(x - 1, y);
                    this.click(x + 1, y);
                    this.click(x, y - 1);
                    this.click(x, y + 1);
                    this.click(x - 1, y - 1);
                    this.click(x + 1, y + 1);
                    this.click(x + 1, y - 1);
                    this.click(x - 1, y + 1);
                } else {
                    this.board[y][x] = bombs;
                }
            }
        }
        if (this.checkWin()) {
            console.log('wins');
            this.gameLocked = true;
            Minesweeper.endCallback ? Minesweeper.endCallback("win") : null;
        }
    }

    get flags() {
        if (this.special) return this.special.flags;
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[j][i] === -3) {
                    count++;
                } else if (this.board[j][i] === -3.1) {
                    count += 2;
                }
            }
        }
        return count;
    }

    reveal() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.mineBoard[j][i]) {
                    this.board[j][i] = this.mineBoard[j][i] === 1 ? -2 : -2.1;
                } else {
                    const num = this.getFieldNumber(i, j);
                    this.board[j][i] = num ? num : -4;
                }
            }
        }
        this.render();
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
                mineBoard[x - 1][y] === 0 &&
                mineBoard[x + 1][y] === 0 &&
                mineBoard[x][y - 1] === 0 &&
                mineBoard[x][y + 1] === 0 &&
                mineBoard[x - 1][y - 1] === 0 &&
                mineBoard[x + 1][y + 1] === 0 &&
                mineBoard[x + 1][y - 1] === 0 &&
                mineBoard[x - 1][y + 1] === 0

            ) {
                mineBoard[x][y] = mines;
                mineBoard[x - 1][y] = mines;
                mineBoard[x + 1][y] = mines;
                mineBoard[x][y - 1] = mines;
                mineBoard[x][y + 1] = mines;
                mineBoard[x - 1][y - 1] = mines;
                mineBoard[x + 1][y + 1] = mines;
                mineBoard[x + 1][y - 1] = mines;
                mineBoard[x - 1][y + 1] = mines;
                unnsuccessful = 0;
                console.log('placed mine at', x, y);
                mines--;
            } else unnsuccessful++;
        }
        console.log('mines placed', this.mines - mines);
        return mineBoard
    }

    render() {
        updateGrid(this.board.map(row => row.map(cell => cell <= -10 ? -3 : cell)))
    }

    click(x, y, flag = false) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size || this.board[y][x] === -4 || this.gameLocked) return
        console.log('clicking', x, y, flag);
        if (this.board[y][x] <= -10) {
            const removeNumber = this.board[y][x];
            this.board = this.board.map(row => row.map(cell => cell === removeNumber ? -1 : cell));
        } else if (flag) {
            if (
                this.board[y][x] === -1 &&
                this.board[y - 1][x] === -1 &&
                this.board[y + 1][x] === -1 &&
                this.board[y][x - 1] === -1 &&
                this.board[y][x + 1] === -1 &&
                this.board[y - 1][x - 1] === -1 &&
                this.board[y + 1][x + 1] === -1 &&
                this.board[y + 1][x - 1] === -1 &&
                this.board[y - 1][x + 1] === -1
            ) {
                const flags = this.flags;
                this.board[y][x] = -flags * 10 - 10
                this.board[y - 1][x] = -flags * 10 - 10
                this.board[y + 1][x] = -flags * 10 - 10
                this.board[y][x - 1] = -flags * 10 - 10
                this.board[y][x + 1] = -flags * 10 - 10
                this.board[y - 1][x - 1] = -flags * 10 - 10
                this.board[y + 1][x + 1] = -flags * 10 - 10
                this.board[y + 1][x - 1] = -flags * 10 - 10
                this.board[y - 1][x + 1] = -flags * 10 - 10
            }
        } else {
            if (this.mineBoard[y][x]) {
                if (this.clicksMade === 0) {
                    console.log('mine on first click, moving mine');
                    this.mineBoard = this.randomizeMines();
                    this.click(x, y);
                } else {
                    this.board[y][x] = -2;
                    this.gameLocked = true;
                    Minesweeper.endCallback ? Minesweeper.endCallback("lose") : null;
                }
            } else {
                const bombs = this.getFieldNumber(x, y);
                if (bombs === 0) {
                    this.board[y][x] = -4;
                    this.click(x - 1, y);
                    this.click(x + 1, y);
                    this.click(x, y - 1);
                    this.click(x, y + 1);
                    this.click(x - 1, y - 1);
                    this.click(x + 1, y + 1);
                    this.click(x + 1, y - 1);
                    this.click(x - 1, y + 1);
                } else {
                    this.board[y][x] = bombs;
                }
            }
        }
        if (this.checkWin()) {
            console.log('wins');
            this.gameLocked = true;
            Minesweeper.endCallback ? Minesweeper.endCallback("win") : null;
        }
    }

    getFieldNumber(x, y) {
        let count = {};
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (x + i >= 0 && x + i < this.size && y + j >= 0 && y + j < this.size) {
                    if (this.mineBoard[y + j][x + i]) {
                        count[this.mineBoard[y + j][x + i]] = true;
                    }
                }
            }
        }
        return Object.keys(count).length;
    }

    get flags() {
        let count = {};
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[j][i] <= -10) {
                    count[this.board[j][i]] = true;
                }
            }
        }
        return Object.keys(count).length;
    }
}