const DEFAULT_SIZE = 50;
const DEFAULT_SPEED = 1; // Changes per SECOND

var g,
    grid;

const Playback = {
    init(speed=DEFAULT_SPEED) {
        this.initialized = true;
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
    disable() {
        this.buttons.forEach( button => { this[button].disabled = true });
    },
    enable() {
        this.buttons.forEach( button => { this[button].disabled = false });
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
            getRandomInitialState(grid.dimensions[0]);
            return;
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
        if (this.enabled) this.enabled = false;
    },
    enable() {
        if (!this.enabled) this.enabled = true;
    }
};

function createInitialState(size) {
    // Toggle the color of a square
    const toggleSquare = square => Matrix.setItem(initialState, square, !Matrix.getItem(initialState, square));
    // Much faster than rewdrawing via event
    const render = _ =>  grid.render(colorizeMatrix(initialState));

    // Drag the cursor across the grid, assigning each crossed square
    // the appropriate value
    const onMouseMove = e => {
        const square = grid.squareFromPoint([e.clientX,e.clientY]);
        if (!square) return;

        if (!squares.includes(JSON.stringify(square))) {
            if (Matrix.getItem(initialState,square) !== firstSquareValue) {
                Matrix.setItem(initialState, square, firstSquareValue )
            }
            squares.push(JSON.stringify(square));
        }
        render();
    }

    const onMouseDown = e => {
        squares = [];
        // Toggle the value of the first clicked square
        const firstSquare = grid.squareFromPoint([e.clientX,e.clientY]);
        if  (firstSquare) {
            toggleSquare(firstSquare);
            render();
        }
        // Set all other crossed squares to the value of the first square
        firstSquareValue = firstSquare ? Matrix.getItem(initialState, firstSquare) : 0;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    const onMouseUp = _ => document.removeEventListener('mousemove', onMouseMove);

    const submit = _ => {
        document.removeEventListener('keydown', onSubmit);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('keydown', onSubmit);

        dispatchInitialState(Matrix.map(initialState, a => a ? 1 : 0 ));
    }

    const onSubmit = e => {
        if (e.code === 'Enter') {
            submit();
            Playback.start();
        }
    }

    Playback.stop();

    document.dispatchEvent(new CustomEvent('stateCreationInitiated'));

    const initialState = Matrix.map(Matrix.getNullMatrix(size,size), _ => false);
    let squares = [];
    let firstSquareValue;

    grid.clear();
    grid.init(Matrix.getDimensions(initialState), grid.gridLines);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onSubmit);
}


function getRandomInitialState(size) {
    dispatchInitialState(GameOfLifeMatrix.randomInitialState(size).matrix);
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
    document.dispatchEvent( new CustomEvent('stateCreationFinished',{detail: {initialState: initialState}}));
}

function setLastGridState() {
    const currentState = grid.currentState;
    currentState.set('speed', Playback.speed);
    localStorage.setItem('lastGridState', JSON.stringify(Array.from( currentState.entries()))) ;
}

function getLastGridState() {
    return new Map(JSON.parse( localStorage.getItem('lastGridState')));
}


function init() {
    const createState = _ => createInitialState(grid.dimensions[0]);
    const getRandomState = _ => getRandomInitialState(grid.dimensions[0]);

    function initializeGrid(dimensions,gridLines,scale) {
        grid = new Grid();
        grid.init(dimensions, gridLines);
        grid.scale = parseFloat(scale);
    }

    function initializeStateCreators() {
        document.getElementById('customState').onclick = _ => { 
            g = null; 
            createState();
        }
        document.getElementById('randomState').onclick = _ => { 
            g = null; 
            getRandomState() ;
        }
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
        const gridLinesButton = document.getElementById('gridLines');
        const scaleInputField = document.getElementById('scaleFactor');
        const rowsField = document.getElementById('mRows');
        const colsField  = document.getElementById('nCols');

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
        document.addEventListener('stateCreationInitiated', _ => Playback.disable());
        document.addEventListener('stateCreationFinished', _ => Playback.enable());
    }

    function initializeKeyboardShortcuts() {
        KeyboardShortcuts.init();
        document.addEventListener('stateCreationInitiated', _ => KeyboardShortcuts.disable());
        document.addEventListener('stateCreationFinished', _ => KeyboardShortcuts.enable());
    }

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

    getRandomState();
}

init();
