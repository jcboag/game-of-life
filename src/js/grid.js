const DEFAULT_GRID_LENGTH = 100;
const GRID_SELECTOR = 'canvas';

// An nxn collection of 'Squares'
class Grid {
    constructor(n=DEFAULT_GRID_LENGTH) {
        this.canvas = document.querySelector(GRID_SELECTOR);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.length = n;
        this.step = this.width / n;

        this.generateGrid(); // Empty grid
    }
    // Dynamically update the offsets based on the canvas position
    get offsets() {
        const rect = this.canvas.getBoundingClientRect();
        return { x: rect.left, y: rect.top };
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
                const step = this.step;
                const square = {
                    row: j,
                    column: i,
                    xMin: step * i,
                    xMax: step * (i + 1),
                    yMin: step * j,
                    yMax: step * (j + 1),
                    midPoint: [(step * i + step * (i + 1)) / 2, (step * j + step * (j + 1)) / 2]
                };
                squares.push(square);
            }
        }
        return squares;
    }

    getSquare(i, j) {
        return this.squares.find(square => (square.row === i) && (square.column === j));
    }

    // Get square from a point on the entire document
    getSquareFromPoint(x,y) {
        x -= this.offsets.x;
        y -= this.offsets.y;
        return this.squares.find( square => square.xMin <= x && x < square.xMax && square.yMin < y && y < square.yMax );
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

// State Grid is a grid that maintains a memory of past states
// and with the ability to move to the next state

class StateGrid extends Grid {
    #states;

    // initialState is a matrix-like object
    // assumed to be supplied with a `filledCells` property
    // and a transition function `transitionFunc` which goes to
    // the next state
    
    constructor(initialState, transitionFunc) {

        super(initialState.length || initialState.matrix.length);

        this.generateGrid(initialState.filledCells);
        this.transitionFunc = transitionFunc

        // Track states for rewinding / forwarding
        this.#states = [initialState];
        this._statePosition = 0;

    }

    get currentState(){
        return this.#states[this.statePosition];
    }

    // statePosition points to the current position with states.
    get statePosition() {
        return this._statePosition;
    }

    // Need to insure statePosition is an integer within range
    set statePosition(index) {
        if ( !Number.isInteger(parseInt(index)) || index > this.#states.length) throw Error('`set statePosition`: invalid index');
        else if (index === this.#states.length ) this.incrementState()
        // If it is larger we simply generate the state
        else {
            this._statePosition = index;
            this.generateGrid(this.currentState.filledCells);
        }
    }

    // If state already exists, the state has been saved, so we can 
    // just move to it. Otherwise, generate the state
    incrementState() {
        // Go to the state at given index 
        if (this.statePosition === (this.#states.length-1)) {
        // Extend the states array with the next state
            this.#states.push(this.transitionFunc(this.currentState));
        }
        this.statePosition++;
    }

    get states() {
        return this.#states;
    }
}
