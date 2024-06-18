const GLOBALS = {
    DEFAULT_LENGTH: 150,
    DEFAULT_GRID_SIZE: 150, // Each 'Game Of Life' Matrix is an nxn grid
}

// Matrix with only ones and zeros, an algorithm to classify entries, and a transition function.
class GameOfLifeMatrix extends Matrix {
    static randomInitialState(size) {
        return new Matrix(Matrix.getNullMatrix(size, size)).map(() => Math.random() > 0.5 ? 1 : 0);
    }
    constructor(state = null) {
        if (Number.isInteger(state)) state = GameOfLifeMatrix.randomInitialState(state).matrix;
        state = state instanceof Matrix ? state.matrix : state;
        if (!Matrix.isMatrixLike(state)) throw Error("Invalid input");
        super(state);
        // A cell dies if it has more neighbors than overPopNumber or 
        // less neighbors than underPopNumber
        this.overPopNumber = 3;
        this.underPopNumber = 2;
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

    get filledCells() {
        return this.aliveCells;
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
        return new GameOfLifeMatrix(this.map((_, cell) => this.isAliveNextState(cell) ? 1 : 0));
    }

    get reachedSteadyState() {
        return this.equals(this.nextState);
    }

}

class GameOfLife {
    #states;
    #statePosition;
    constructor(initialState) {
        this.init(initialState);
    }

    init(state) {
        if (Number.isInteger(state) && state > 0 || Matrix.isMatrixLike(state)) state = new GameOfLifeMatrix(state);
        else if (state?.matrix) state = new GameOfLife( state.matrix );
        else throw Error("Incorrect Input into `GameOfLife` contstructor");

        this.#states = [ state ];
        this.#statePosition = 0;
    }

    get statePosition() {
        return this.#statePosition;
    }

    get currentState() {
        return this.#states[this.statePosition];
    }

    set statePosition(index) {
        if (!(Number.isInteger(index) && index >= 0 && index <= this.#states.length)) throw Error("Invalid Index");
        else {
            if (index === this.#states.length) {
                this.#states.push(this.currentState.nextState);
            }
            this.#statePosition = index;
        }
    }
}
