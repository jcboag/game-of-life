const GLOBALS = {
    DEFAULT_GRID_SIZE: 10, // Each 'Game Of Life' Matrix is an nxn grid
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
