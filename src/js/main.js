const DEFAULT_SIZE = 50;
const DEFAULT_SPEED = 1; // Grid updates per SECOND 

var g,
    grid;

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

const Playback = {
    init(speed=DEFAULT_SPEED) {
        this.intervalId = null;

        this.submitStateButton = document.getElementById('startSubmit');

        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        this.resetButton = document.querySelector('#reset');

        this.startStopButton.onclick = this.toggleStart.bind(this);
        this.rewindButton.onclick = this.rewind.bind(this);
        this.forwardButton.onclick = this.forward.bind(this);
        this.resetButton.onclick = this.reset.bind(this);
        
        this.buttons = ['startStopButton', 'rewindButton', 'forwardButton', 'resetButton', ];

        this.setSpeed(speed);
    },
    stateChangeHandler(e) {
        console.log('Playback, handling state change')
        if (e.detail.state === 'edit') {
            this.disable();
        } else if (e.detail.state === 'playback') {
            this.enable();
        }
    },
    disable(except=[]) {
        const buttonsToDisable = this.buttons.filter( button => !except.includes(button));
        console.log(`disabling playback on ${buttonsToDisable}`)
        buttonsToDisable.forEach( button => { this[button].disabled = true });
    },
    enable(except=[]) {
        const buttonsToEnable = this.buttons.filter( button => !except.includes(button));
        console.log(`enabling playback on ${buttonsToEnable}`);
        buttonsToEnable.forEach( button => { this[button].disabled = false });
    },
    startLoop() {
        if (!this.loopInProgress()) {
            const updateState = _ => nextState(g);
            const timeBetweenUpdates = 1000 / this.speed
            this.intervalId = setInterval(updateState, timeBetweenUpdates);
        }
    },
    stopLoop() {
        if (this.loopInProgress()) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    start() {
        if (!g) {
            InitialStateEditor.random();
        } 
        this.startLoop();
        this.startStopButton.removeEventListener('click', this.start);
        this.startStopButton.addEventListener('click', this.stop);
        this.startStopButton.innerText = 'Stop';
        
    },
    stop() {
        this.stopLoop();
        this.startStopButton.removeEventListener('click', this.stop);
        this.startStopButton.addEventListener('click', this.start);
        this.startStopButton.innerText = 'Start';
    },
    loopInProgress() {
        return this.intervalId !== null;
    },
    toggleStart() {
        if (this.loopInProgress()) this.stop();
        else this.start();
    },
    rewind() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            previousState(g);
        } catch {
            setStatePosition(0);
        }
    },
    forward() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            nextState(g);
        } catch {
            previousState(g);
        }
    },
    reset() {
        if (this.loopInProgress()) this.stop();
        setStatePosition(g,0);
    },
    // relative to default
    setSpeed(speed) {
        this.speed = speed;
        if (this.loopInProgress()) {
            this.stopLoop();
            this.startLoop();
        }
    },
};


const KeyboardShortcuts = {
    init() {
        this.enabled = true;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    keyMap: {
        ArrowLeft: Playback.rewind.bind(Playback),
        ArrowRight: Playback.forward.bind(Playback),
        ArrowUp: Playback.reset.bind(Playback),
        Space: Playback.toggleStart.bind(Playback),
    },
    handleKeyDown(e) {
        if (this.enabled) {
            let action = this.keyMap[e.code.replace(/Key|Digit/,'')];
            if (action) {
                e.preventDefault();
                e.stopPropagation();
                action();
            }
        }
    },
    disable() {
        console.log('disabled keybinds')
        if (this.enabled) this.enabled = false;
    },
    enable() {
        console.log('enabled keybinds');
        if (!this.enabled) this.enabled = true;
    }
};

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



function colorizeMatrix(matrix,method) {
    // Monochrome
    if (!method) return Matrix.map( matrix, a => a ? Colorizer.colors.black : Colorizer.colors.white );
}

function newDisplayMatrixHandler(e) {
    grid.render(e.detail.displayMatrix);
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

function dispatchInitialState(initialState) {
    g = new GameOfLife(initialState);
    grid.init(
        g.dimensions,
        grid.gridLines,
        colorizeMatrix(g.currentState.matrix)
    );
    PageState.currentState = 'playback'
}

function setLastGridState() {
    const currentState = grid.currentState;
    currentState.set('speed', Playback.speed);

    console.log(currentState);

    localStorage.setItem('lastGridState', JSON.stringify(Array.from(currentState.entries()))) ;
}

function getLastGridState() {
    return new Map(JSON.parse( localStorage.getItem('lastGridState')));
}

// class Settings {
//     #key = 'lastPageState';
//     #settings;

//     static defaults = [
//         ['gridScale', 1],
//         ['gridLines', true],
//         ['dimensions', [50,50]],
//         ['speed', 1],
//         ['state', 'playback']
//     ]

//     init(reset=false) {
//         load(reset);
//         document.addEventListener('pagePropsChanged', _ => Settings.save());
//     }

//     load(reset=false) {
//         this.#settings = new Map(reset ? defaults : (JSON.parse(localStorage.getItem(this.#key)) || defaults));
//     }

//     save() {
//         localStorage.setItem(this.#key, Array.from(this.#settings.entries()));
//     }

//     get(setting) {
//         this.#settings.get(setting);
//     }

//     set(setting) {
//         this.#settings.set(setting);
//     }
// }


function init() {

    function initializeGrid(dimensions,gridLines,scale) {
        grid = new Grid();
        grid.init(dimensions, gridLines);
        grid.scale = parseFloat(scale);
    }

    function initializeStateCreators() {
        document.getElementById('customState').onclick = _ => InitialStateEditor.init();
        document.getElementById('randomState').onclick = _ => InitialStateEditor.random();

        // Important! 'Binds' the  matrix of the game state to the
        // grid, so changes in the matrix cause changes in the grid
        //
        document.addEventListener('displayMatrixCreated', newDisplayMatrixHandler);

        document.addEventListener('stateCreationFinished', e => {
            g = new GameOfLife(e.detail.initialState);
            grid.init(
                g.dimensions,
                grid.gridLines,
                colorizeMatrix(g.currentState.matrix)
            );
        });
    }

    function initializeGridManipulators() {
        const getById = id => document.getElementById(id);

        const [ gridLinesButton, scaleInputField, rowsField, colsField ] =  ['gridLines', 'scaleFactor', 'mRows', 'nCols'].map( id => getById(id))

        // Initialize values to the state of grid
        gridLinesButton.checked = grid.gridLines;
        scaleInputField.value = grid.scale;
        rowsField.value = grid.rows;
        colsField.value = grid.columns;


        // 'Bind' the values of the buttons to the state of the grid
        gridLinesButton.oninput =  _ => {
            if (gridLinesButton.checked && !grid.gridLines ) {
                grid.addGridLines();
            } else if ( !gridLinesButton.checked && grid.gridLines) {
                grid.removeGridLines();
            }
            setLastGridState();
        }
        scaleInputField.onchange = _ => {
            const value = parseFloat(scaleInputField.value);
            if (value) grid.scale = value;
            setLastGridState();
        };

        [rowsField, colsField].forEach(field => {
            field.onchange = e => { 
                grid.init([parseInt(e.target.value), parseInt(e.target.value)], grid.gridLines);
                rowsField.value = colsField.value = e.target.value;
                setLastGridState();
            }
        });
    }

    function initializePlayback() {
        const speedField = document.getElementById("speed");
        Playback.init( getLastGridState().get('speed') || DEFAULT_SPEED);
        // Initialize speed slider value
        speedField.value = Playback.speed;
        // 'Bind' the value of the slider to the actual value
        speedField.onchange = _ => {
            const value = parseFloat(speedField.value);
            Playback.setSpeed(value);
            setLastGridState();
        }
    }

    function initializeKeyboardShortcuts() {
        KeyboardShortcuts.init();
    }

    // Settings.init();

    // Get last values for persistence
    const lastGrid = getLastGridState();
    const dimensions = lastGrid.get('dimensions') || [DEFAULT_SIZE,DEFAULT_SIZE];
    const gridLines = lastGrid.get('gridLines') || true;
    const scale = lastGrid.get('scale') || 1;

    initializeGrid(dimensions,gridLines,scale);
    initializeStateCreators();
    initializeGridManipulators();
    initializePlayback();
    initializeKeyboardShortcuts();

    document.addEventListener('stateChange', _ => handlePageStateChange(PageState.currentState));

    InitialStateEditor.random( grid.dimensions );
}

init();
