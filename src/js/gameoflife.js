// import { Matrix } from './matrix';
// import { Grid, Colorizer} from './grid';

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
}

class GameOfLife {
    #states;
    #statePosition;
    #speed = 10;
    constructor(initialState,speed=10) {
        this.init(initialState,speed);
    }

    init(initialState,speed) {
        if (Number.isInteger(initialState) && initialState > 0 || Matrix.isMatrixLike(initialState)) initialState = new GameOfLifeMatrix(initialState);
        else if (initialState?.matrix) initialState = new GameOfLife( initialState.matrix );
        else throw Error("Incorrect Input into `GameOfLife` contstructor");

        this.canvas = null;
        this.speed = speed || this.#speed;
        this.intervalId = null;

        this.#states = [ initialState ];
        this.#statePosition = 0;

    }

    get playing() {
        return Number.isInteger(this.intervalId);
    }

    get updateInterval() {
        return 1000 / this.speed 
    }

    get speed() {
        return this.#speed;
    }

    set speed(updatesPerSecond) {
        if (updatesPerSecond <= 0) throw Error("Speed must be positive");
        this.#speed = updatesPerSecond;
        if (this.playing) {
            this.stop();
            this.start();
        }

    }

    setCanvas(canvas) {
        this.canvas = canvas;
    }

    initGrid() {
        if (!this.canvas) throw new Error('Canvas not set');
        const dimensions = Matrix.getDimensions(this.currentState.matrix);
        this.grid = new Grid(this.canvas);
        this.grid.init( dimensions, gridLines, Colorizer.monochrome(this.currentState.matrix));
    }

    render() {
        this.grid.render(Colorizer.monochrome(this.#states[this.statePosition].matrix));
    }

    get dimensions() {
        return this.currentState.dimensions;
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
            this.render();
        }
    }
    start() {
        if (this.playing) return;
        this.intervalId = setInterval(() => {
            this.nextState();
        }, this.updateInterval); 
    }

    stop() {
        if (!this.playing) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    reset() {
        if (this.playing) this.stop();
        this.statePosition = 0;
    }

    toggleStartStop() {
        if (this.playing) {
            this.stop();
        } else {
            this.start();
        }
    }

    nextState() {
        if (this.statePosition < this.#states.length - 1) {
            this.statePosition++;
        } else {
            const nextState = this.#states[this.statePosition].nextState;
            this.#states.push(nextState);
            this.statePosition++;
        }
    }

    previousState() {
        if (this.statePosition != 0) this.statePosition--;
    }
}
