const GLOBALS = {
    DEFAULT_GRID_SIZE: 100, // Each 'Game Of Life' Matrix is an nxn grid
    DEFAULT_DEAD_TOKEN: " ",
    DEFAULT_ALIVE_TOKEN: "+",
}

// Matrix with only ones and zeros, an algorithm to classify entries, and a transition function.
class GameOfLifeMatrix extends Matrix {
    static randomInitialState(size) {
        return new Matrix(Matrix.getNullMatrix(size, size)).map(() => Math.random() > 0.5 ? 1 : 0);
    }

    // overPopNumber: if the surrounding population is greater than this, the cell dies
    // underPopNumber: if the surrounding population is less than this, the cell dies
    constructor(initialState = null, n = GLOBALS.DEFAULT_GRID_SIZE, options={overPopNumber:3,underPopNumber:2}) {
        const state = initialState instanceof Matrix ? initialState.matrix : initialState || GameOfLifeMatrix.randomInitialState(n).matrix;
        super(state);

        this.options = options;
        this.overPopNumber = options.overPopNumber;
        this.underPopNumber = options.underPopNumber;
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

    isAlive(cell) {
        return this.getItem(cell) === 1;
    }

    isAliveNextState(cell) {
        const isAlive = this.isAlive(cell);
        const aliveNeighbors = this.getAliveNeighbors(cell).length;
        return isAlive ? [this.underPopNumber, this.overPopNumber].includes(aliveNeighbors) : aliveNeighbors === this.overPopNumber;
    }

    getAliveNeighbors(cell) {
        return this.adjacentIndices(cell).filter(idx => this.isAlive(idx));
    }

    get nextState() {
        return new GameOfLifeMatrix(this.map((_, cell) => this.isAliveNextState(cell) ? 1 : 0),null, this.options);
    }

    // For console based
    display({ deadToken = GLOBALS.DEFAULT_DEAD_TOKEN, aliveToken = GLOBALS.DEFAULT_ALIVE_TOKEN } = {}) {
        console.log(this.matrix.map(row => row.map(cell => (cell === 0 ? deadToken : aliveToken)).join(' ')).join('\n'));
    }
}

class GameOfLife {
    #states;
    constructor(initialState=null) {
        // Agnostic about "Grid" implementation
        this.grid = new Grid();
        // Generate a random initial state if one isn't given
        if (Matrix.isMatrixLike(initialState)) {
            initialState = initialState;
        } else if (initialState?.matrix && Matrix.isMatrixLike(initialState.matrix)) {
            initialState = initialState.matrix;
        } else {
            initialState = GameOfLifeMatrix.randomInitialState(GLOBALS.DEFAULT_GRID_SIZE);
        }
        // Track states for rewinding / forwarding
        initialState = new GameOfLifeMatrix(initialState);
        this.#states = [initialState];
        this._statePosition = 0;

        this.grid.init(initialState.matrix.length, initialState.aliveCells);
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
        else if ( index === this.#states.length ) this.incrementState()
        // If it is larger we simply generate the state
        else {
            this._statePosition = index;
            this.grid.generateGrid(this.currentState.aliveCells);
        }
    }

    // If state already exists, the state has been saved, so we can 
    // just move to it. Otherwise, generate the state
    incrementState() {
        // Go to the state at given index 
        if (this.statePosition === (this.#states.length-1)) {
        // Extend the states array with the next state
            this.#states.push(this.currentState.nextState);
        }
        this.statePosition++;
    }
}
