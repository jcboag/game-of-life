const GLOBALS = {
    DEFAULT_GRID_SIZE: 10, // Each 'Game Of Life' Matrix is an nxn grid
    DEFAULT_UPDATE_LIMIT: Infinity,
    DEFAULT_DEAD_TOKEN: " ",
    DEFAULT_ALIVE_TOKEN: "+",
}

// An nxn collection of Squares
class Grid {
    constructor(gridSelector="#gameOfLifeGrid") {
        this.canvas = document.querySelector(gridSelector);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.updateOffsets();
    }

    init(n, filledSquares = []) {
        this.step = this.width / n;
        this.length = n;
        this.size = n * n;
        this.generateGrid(filledSquares);
        return this;
    }

    // Dynamically update the offsets based on the canvas position
    updateOffsets() {
        const rect = this.canvas.getBoundingClientRect();
        this.offsetX = rect.left;
        this.offsetY = rect.top;
    }

    generateGrid(filledSquares = []) {
        this.clearGrid();
        for (let i = 0; i < this.length; i++) {
            this.addGridLine('x', i);
            this.addGridLine('y', i);
        }
        this.squares = this.getSquares();
        filledSquares.forEach(([i, j]) => this.fillSquare(this.getSquare(i, j)));
    }

    clearGrid() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    addLine(startPos, endPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(...startPos);
        this.ctx.lineTo(...endPos);
        this.ctx.stroke();
    }

    addGridLine(axis, n) {
        const step = this.step * n;
        switch (axis) {
            case 'x':
                this.addLine([0, step], [this.width, step]);
                break;
            case 'y':
                this.addLine([step, 0], [step, this.height]);
                break;
            default:
                break;
        }
    }

    getSquares() {
        const n = this.length;
        let squares = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const square = {
                    row: j,
                    column: i,
                    xMin: this.step * i,
                    xMax: this.step * (i + 1),
                    yMin: this.step * j,
                    yMax: this.step * (j + 1),
                    midPoint: [(this.step * i + this.step * (i + 1)) / 2, (this.step * j + this.step * (j + 1)) / 2]
                };
                squares.push(square);
            }
        }
        return squares;
    }

    getSquare(i, j) {
        return this.squares.find(square => (square.row === i) && (square.column === j));
    }

    fillSquare(square, fillStyle = 'black') {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(square.xMin, square.yMin, this.step, this.step);
    }

    isFilled(square) {
        let imageData = this.ctx.getImageData(...square.midPoint, 1, 1).data;
        let [r, g, b, a] = imageData;
        return !(r === 0 && g === 0 && b === 0 && a === 0);
    }

    getFilledSquares() {
        return this.squares.filter(square => this.isFilled(square));
    }

    clearSquare(row, col) {
        let square = this.getSquare(row, col);
        this.ctx.clearRect(square.xMin, square.yMin, this.step, this.step);
        // Need to replace the lost lines
        this.addGridLine('x', row);
        this.addGridLine('y', col);
    }
}

class Matrix {
    // An mxn "Matrix" is an array of length n where every entry is an array of length m.
    static isMatrixLike(object) {
        return object?.every( el => typeof el === 'number' ) || (Array.isArray(object) && object.length >= 0 && object.every(row => Array.isArray(row) && row.length === object[0].length));
    }

    // Returns all adjacent indices (at  the sides and the diagonals )
    // within the infiinite-dimension matrix
    static adjacentIndices([i, j]) {
        const indices = [];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di !== 0 || dj !== 0) indices.push([i + di, j + dj]);
            }
        }
        return indices;
    }

    static isInMatrix(matrix, [i, j]) {
        return i >= 0 && j >= 0 && j < matrix.length && i < matrix[0].length;
    }

    static forEach(matrix, callback) {
        matrix.forEach((row, j) => row.forEach((item, i) => callback(item, [i, j])));
    }

    static map(matrix, callback) {
        return matrix.map((row, j) => row.map((item, i) => callback(item, [i, j])));
    }

    static getNullMatrix(m, n) {
        return Array.from({ length: n }, () => Array(m).fill(null));
    }

    static setItem(matrix, [i, j], value) {
        matrix[j][i] = value;
    }

    static getItem(matrix, [i, j]) {
        return matrix[j]?.[i];
    }

    static transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    // Current implementation will fail if values contain functions
    static clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static isMatrix(object) {
        return object instanceof Matrix;
    }
    // Returns if two matrices are equal
    static areEqual(A,B) {
        return JSON.stringify(A) === JSON.stringify(B);
    }

    constructor(arr) {
        if (!Matrix.isMatrixLike(arr)) throw new Error('Invalid matrix');
        this.matrix = Matrix.clone(arr);
    }

    // Two matrices are equal when all of their entries are the same
    equals(A) {
        if (!Matrix.isMatrix(A)) throw Error("Must be of type `Matrix`");
        return Matrix.areEqual(this.matrix, A.matrix);
    }

    get transpose() {
        return new Matrix(Matrix.transpose(this.matrix));
    }

    adjacentIndices(index) {
        return Matrix.adjacentIndices(index).filter(idx => Matrix.isInMatrix(this.matrix, idx));
    }

    setItem(index, value) {
        Matrix.setItem(this.matrix, index, value);
    }

    getItem(index) {
        return Matrix.getItem(this.matrix, index);
    }

    map(callback) {
        return new Matrix(Matrix.map(this.matrix, callback));
    }

    forEach(callback) {
        Matrix.forEach(this.matrix, callback);
    }

    toString() {
        return this.matrix.map(row => row.join(' ')).join('\n');
    }
}

class GameOfLifeMatrix extends Matrix {
    static randomInitialState(size) {
        return new Matrix(Matrix.getNullMatrix(size, size)).map(() => Math.random() > 0.5 ? 1 : 0);
    }

    constructor(initialState = null, n = GLOBALS.DEFAULT_GRID_SIZE) {
        const state = initialState instanceof Matrix ? initialState.matrix : initialState || GameOfLifeMatrix.randomInitialState(n).matrix;

        super(state);
        this.length = initialState.length;

    }

    get aliveCells() {
        let alive = [];
        for (let j=0;j<this.matrix.length;j++) {
            for (let i=0;i<this.matrix[0].length;i++) {
                if ( this.isAlive([i,j]) ) {
                    alive.push([i,j]);
                }
            }
        }
        return alive;
    }
    isAlive(index) {
        return this.getItem(index) === 1;
    }

    isAliveNextState(index) {
        const isAlive = this.isAlive(index);
        const aliveNeighbors = this.getAliveNeighbors(index).length;
        return isAlive ? [2, 3].includes(aliveNeighbors) : aliveNeighbors === 3;
    }

    getAliveNeighbors(index) {
        return this.adjacentIndices(index).filter(idx => this.isAlive(idx));
    }

    get nextState() {
        return new GameOfLifeMatrix(this.map((_, index) => this.isAliveNextState(index) ? 1 : 0));
    }

    // For console based
    display({ deadToken = GLOBALS.DEFAULT_DEAD_TOKEN, aliveToken = GLOBALS.DEFAULT_ALIVE_TOKEN } = {}) {
        console.log(this.matrix.map(row => row.map(cell => (cell === 0 ? deadToken : aliveToken)).join(' ')).join('\n'));
    }
}

class GameOfLife extends Grid {
    constructor(initialState=null) {
        super();

        this.active = false;
        this.intervalId = null;

        if (Matrix.isMatrixLike(initialState)) {
            initialState = initialState;
        } else if (initialState?.matrix && Matrix.isMatrixLike(initialState.matrix)) {
            initialState = initialState.matrix;
        } else {
            initialState = GameOfLifeMatrix.randomInitialState(GLOBALS.DEFAULT_GRID_SIZE);
        }

        initialState = new GameOfLifeMatrix(initialState);

        this.previousState = null;
        this.currentState = initialState;

        this.init(initialState.matrix.length, initialState.aliveCells);
    }

    start(maxLoop=GLOBALS.DEFAULT_UPDATE_LIMIT) {
        let count = 0;
        const updateState = () => {
            if (count >= maxLoop) {
                clearInterval(this.intervalId);
                return;
            }
            this.previousState = this.currentState;
            this.currentState = this.currentState.nextState;
            this.generateGrid(this.currentState.aliveCells);
            count++;
        }
        this.intervalId = setInterval(updateState, 1000);
    }

    stop() { 
        clearInterval(this.intervalId);
    }
}

function main() {
    let start = _ => {
        g.start();
        document.removeEventListener('click', start);
        document.addEventListener('click', stop);
    }
    let stop = _ => {
        g.stop();
        document.removeEventListener('click', stop);
        document.addEventListener('click', start);
    }

    let g = new GameOfLife();

    document.addEventListener('click', start);
}

main();
