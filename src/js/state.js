class PageState {
    static #currentState;

    static get EDIT() {
        return 'edit'
    }

    static get PLAYBACK() {
        return 'playback'
    }

    static get currentState() {
        return this.#currentState;
    }

    static set currentState(state) {
        state = state.toUpperCase();
        if (this[state]) {
            this.#currentState = this[state];
            document.dispatchEvent(new CustomEvent('stateChange', { detail: { state: this.currentState}}));
        }
    }
}

class InitialStateEditor {
    static initialState;
    static squares;
    static firstSquareValue;

    static init(matrix) {
        PageState.currentState = 'edit';

        if (matrix) {
            this.initialState = matrix
        } else {
            this.initialState = Matrix.getNullMatrix(...grid.dimensions);
        }

        grid.clear();
        grid.init(Matrix.getDimensions(this.initialState), grid.gridLines);

        this.squares = [];
        this.firstSquareValue = [];

        document.addEventListener('mousedown', this.onMouseDown);
    }

    // Set the square color
    static toggleSquare (square) {
        Matrix.setItem(this.initialState, square, !Matrix.getItem(this.initialState, square));
    }

    // Much faster than event-based trigger
    static render = _ =>  grid.render(colorizeMatrix(this.initialState));

    // Drag the cursor across the grid, assigning each crossed square
    // the appropriate value
    static onMouseMove = e => {
        const square = grid.squareFromPoint([e.clientX,e.clientY]);
        if (!square) return;
        if (!this.squares.includes(JSON.stringify(square))) {
            if (Matrix.getItem(this.initialState,square) !== this.firstSquareValue) {
                Matrix.setItem(this.initialState, square, this.firstSquareValue )
            }
            this.squares.push(JSON.stringify(square));
        }
        this.render();
    }
    static onMouseDown = e => {
        this.squares = [];
        // Toggle the value of the first clicked square
        const firstSquare = grid.squareFromPoint([e.clientX,e.clientY]);
        if  (firstSquare) {
            this.toggleSquare(firstSquare);
            this.render();
        }
        // Set all other crossed squares to the value of the first square
        this.firstSquareValue = firstSquare ? Matrix.getItem(this.initialState, firstSquare) : 0;
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    static onMouseUp = _ => document.removeEventListener('mousemove', this.onMouseMove);

    // Remove added eventlisteners
    static cleanUp = () => {
        this.firstSquares = [];
        this.firstSquareValue = null;
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    static submit() {
        dispatchInitialState(Matrix.map(this.initialState, a => a ? 1 : 0)) ;
    }

    static random(dimensions=grid.dimensions) {
        dispatchInitialState(GameOfLifeMatrix.randomInitialState(dimensions[0]).matrix);
    }
}

function handlePageStateChange(state) {

    if (state === 'edit' ) {
        Playback.disable(['startStopButton']);
        Playback.startStopButton.onclick = function(){ 
            InitialStateEditor.submit();
            Playback.toggleStart();
        }
        KeyboardShortcuts.disable();

    } else if (state === 'playback') {
        Playback.startStopButton.onclick = Playback.toggleStart.bind(Playback);
        InitialStateEditor.cleanUp();
        Playback.enable();
        KeyboardShortcuts.enable();
    }
} 

function setStatePosition(game,pos) {
    game.statePosition = pos;
    const displayMatrix = colorizeMatrix(game.currentState.matrix);
    document.dispatchEvent(new CustomEvent('displayMatrixCreated', { detail: {displayMatrix}}));
}

function nextState(game) {
    setStatePosition(game, ++game.statePosition);
}

function previousState(game) {
    setStatePosition(game, --game.statePosition);
}



