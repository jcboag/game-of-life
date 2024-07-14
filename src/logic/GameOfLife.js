import Grid  from './Grid';
import Colorizer from './Colorizer';
import Matrix from './Matrix';

// Matrix with only ones and zeros
class GameOfLifeMatrix extends Matrix {
    static convert(matrix) {
        matrix = matrix instanceof Matrix ? matrix.matrix : matrix;
        return Matrix.map(matrix , a => a ? 1 : 0 );
    }
    static randomInitialState(size) {
        return new Matrix(Matrix.getNullMatrix(size, size)).map(() => Math.random() > 0.5 ? 1 : 0);
    }
    constructor(state = null) {
        if (Number.isInteger(state)) state = GameOfLifeMatrix.randomInitialState(state).matrix;

        // Ensure the matrix is a "game of life " matrix
        state =  GameOfLifeMatrix.convert( state instanceof Matrix ? state.matrix : state );

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

class StateManager {
    #statePosition = 0
    constructor(initialState) {
        // Objects input into the`#states` are assumed to have `nextState` methods
        this.states = [ initialState ];
    }

    get statePosition() {
        return this.#statePosition;
    }

    set statePosition(n) {
        if ( n >= 0 && n <= this.states.length) this.#statePosition = n;
    }

    get currentState()  {
        return this.states[ this.statePosition ];
    }

    addState(state) {
        this.states.push(state);
    }

    nextState() {
        if ( this.statePosition === (this.states.length-1)) {
            this.addState( this.currentState.nextState );
        }
        this.statePosition++;
    }

    previousState() {
        if ( this.statePosition > 0 ) {
            this.statePosition--;
        }
    }


}

// Handles the processing of playback on the `grid`
class GameOfLife {

    static random(size) {
        return GameOfLifeMatrix.randomInitialState(size)?.matrix;
    }

    static appname = 'gameoflife';

    #speed = 10;
    constructor( {initialState = 10 , canvas, speed, gridLines} = {} ) {

        if (!(Number.isInteger(initialState) || initialState.matrix || Matrix.isMatrixLike(initialState))) throw Error("Invalid initial state for Game Of Life");

        this.stateManager = new StateManager( new GameOfLifeMatrix(initialState) );
        this.speed = speed;
        this.intervalId = null;
        this.grid = new Grid(canvas);
        this.initGrid(gridLines);
    }


    get appname() {
        return GameOfLife.appname;
    }

    get dimensions() {
        return [this.grid.rows, this.grid.columns]
    }

    initGrid(gridLines) {
        this.grid.init( { dimensions: this.stateManager.currentState.dimensions, gridLines, initialState: this.colorizedMatrix} );
    }

    get playing() {
        return Number.isInteger(this.intervalId);
    }

    set playing(bool) {

        if ( bool && !this.playing) {

            this.start();

        } else if ( !bool && this.playing ) {

            this.stop();
        }
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

    // Display the current state of the game on the grid
    render() {
        this.grid.render(this.colorizedMatrix);
    }

    get colorizedMatrix() {
        return Colorizer.monochrome(this.stateManager.currentState.matrix);
    }

    set gridLines(bool) {
        this.grid.gridLines = bool;
        this.render();
    }

    get gridLines() {
        return this.grid.gridLines
    }


    get currentState() {
        return this.stateManager.currentState.matrix;
    }

    goToState(n) {
        this.stateManager.statePosition = n;
        this.render();
    }

    nextState() {
        this.stateManager.nextState();
        this.render();
    }

    previousState() {
        this.stateManager.previousState();
        this.render();
    }

    reset() {
        this.goToState(0);
    }

    start() {
        this.intervalId = setInterval(() => {
            this.nextState();
        }, this.updateInterval); 
    }

    stop() {
        if (!this.playing) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    toggleStartStop() {
        if (this.playing) {
            this.stop();
        } else {
            this.start();
        }
    }

    get matrix() {
        return this.stateManager?.currentState?.matrix;
    }

    cleanup() {
        this.stop();
    }

}

export default GameOfLife;
