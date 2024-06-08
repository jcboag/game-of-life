const GLOBALS = {
    DEFAULT_GRID_SIZE: 100, // Each 'Game Of Life' Matrix is an nxn grid
    DEFAULT_UPDATE_LIMIT: Infinity,
    DEFAULT_DEAD_TOKEN: " ",
    DEFAULT_ALIVE_TOKEN: "+",
}

class GameOfLifeMatrix extends Matrix {
    static randomInitialState(size) {
        return new Matrix(Matrix.getNullMatrix(size, size)).map(() => Math.random() > 0.5 ? 1 : 0);
    }

    constructor(initialState = null, n = GLOBALS.DEFAULT_GRID_SIZE) {
        const state = initialState instanceof Matrix ? initialState.matrix : initialState || GameOfLifeMatrix.randomInitialState(n).matrix;

        super(state);

        this.length = state.length;

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

        // Track states for rewinding / forwarding
        initialState = new GameOfLifeMatrix(initialState);
        this._states = [initialState];
        this._statePosition = 0;

        this.init(initialState.matrix.length, initialState.aliveCells);
    }

    get currentState(){
        return this._states[this.statePosition];
    }


    get statePosition() {
        return this._statePosition;
    }

    set statePosition(index) {
        if ( Number.isNaN(parseInt(index)) || index > this._states.length) throw Error('`set statePosition`: invalid index');
        else if ( index === this._states.length ) this.incrementState(index-1)
        else {
            this._statePosition = index;
            this.generateGrid(this.currentState.aliveCells);
        }
    }

    incrementState() {
        // Go to the state at given index 
        if (this.statePosition === (this._states.length-1)) {
        // Extend the states array with the next state
            this._states.push(this.currentState.nextState);
        }
        this.statePosition = this.statePosition + 1
    }


    goToState(index) {
        this.stop(); // Stop if looping
        this.statePosition = index;
    }

    start(maxLoop=GLOBALS.DEFAULT_UPDATE_LIMIT) {
        let count = 0;

        const updateState = () => {
            if (count >= maxLoop) {
                clearInterval(this.intervalId);
                return;
            }
            this.incrementState(this.statePosition);
            this.generateGrid(this.currentState.aliveCells);
            count++;

        }
        this.intervalId = setInterval(updateState, 200);
    }

    stop() { 
        clearInterval(this.intervalId);
    }

}
