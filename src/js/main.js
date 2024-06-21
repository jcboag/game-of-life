const DEFAULT_UPDATE_RATE = 90;
const DEFAULT_SIZE = 50;

var g,grid;

const Playback = {
    init() {
        this.initialized = true;
        this.intervalId = null;

        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        this.resetButton = document.querySelector('#reset');

        this.startStopButton.onclick = this.toggleStart.bind(this);
        this.rewindButton.onclick = this.rewind.bind(this);
        this.forwardButton.onclick = this.forward.bind(this);
        this.resetButton.onclick = this.reset.bind(this);
    },

    startLoop(maxLoop=Infinity,updateRate=DEFAULT_UPDATE_RATE) {

        let count = 0;
        const updateState = () => {
            if (count >= maxLoop) {
                this.stop();
                return;
            }
            nextState(g);
            count++;
        };
        this.intervalId = setInterval(updateState, updateRate);
    },
    stopLoop() {

        if (this.loopInProgress) {
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
};


const KeyboardShortcuts = {
    init() {
        this.initialized = true;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    keyMap: {
        ArrowLeft: Playback.rewind.bind(Playback),
        ArrowRight: Playback.forward.bind(Playback),
        ArrowUp: Playback.reset.bind(Playback),
        Space: Playback.toggleStart.bind(Playback),
    },
    handleKeyDown(e) {
        let action = this.keyMap[e.code.replace(/Key|Digit/,'')];
        if (action) {
            e.preventDefault();
            e.stopPropagation();
            action();
        }
    }
};

function createInitialState(size) {

    const canvas = grid.gridEngine.canvas;

    let squares = [];
    let firstSquareValue;


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

        // Use that value as the value to make all other points in
        // the path of the drag
        firstSquareValue = firstSquare ? Matrix.getItem(initialState, firstSquare) : 0;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    const onMouseUp = _ => document.removeEventListener('mousemove', onMouseMove);

    const onSubmit = _ => {
            document.removeEventListener('keydown', onSubmit);
            document.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('click', onGridClick)
            dispatchInitialState(Matrix.map(initialState, a => a ? 1 : 0 )) 
    }

    const onGridClick = e => {
        toggleSquare(grid.squareFromPoint([e.clientX,e.clientY]));
        render();
    }

    const toggleSquare = square => Matrix.setItem(initialState, square, !Matrix.getItem(initialState, square) );
    const initialState = Matrix.map(Matrix.getNullMatrix(size,size), _ => false);
    const render = _ => grid.render(colorizeMatrix(initialState));

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onSubmit);

    const startStopButton = Playback.startStopButton;

    if (startStopButton) {

        const currentOnClick = startStopButton.onclick;

        if (currentOnClick) {
            startStopButton.onclick = _ => {
                onSubmit();
                currentOnClick();
                startStopButton.onclick = currentOnClick;
            }
        } else {
            startStopButton.onclick = _ => {
                onSubmit();
                startStopButton.onclick = ""
            }
        }

    }

    grid.init(Matrix.getDimensions(initialState), true);

    render();
}

function getRandomInitialState(size) {
    dispatchInitialState(GameOfLifeMatrix.randomInitialState(size).matrix);
}

function colorizeMatrix(matrix,method) {
    // Monochrome
    if (!method) return Matrix.map( matrix, a => a ? Colorizer.colors.black : Colorizer.colors.white );
}

function setStatePosition(game,pos) {
    game.statePosition = pos;
    document.dispatchEvent( new CustomEvent('gameStateChange') )
}

function nextState(game) {
    setStatePosition(game, ++game.statePosition);
}

function previousState(game) {
    setStatePosition(game, --game.statePosition);
}


function dispatchInitialState(initialState) {
    document.dispatchEvent( new CustomEvent('initialStateCreated',{detail: {initialState: initialState}}));
}


function init() {
    const size = 100;

    grid = new Grid();
    grid.init([size,size],true);

    // KeyboardShortcuts.init();

    document.getElementById('customState').onclick = _ =>{ g = null; createInitialState(size); }
    document.getElementById('randomState').onclick = _ =>{ g = null;  getRandomInitialState(size); }

    document.addEventListener('initialStateCreated', e => {
        g = new GameOfLife(e.detail.initialState);
        grid.init(
            g.dimensions,
            grid.gridLines,
            colorizeMatrix(g.currentState.matrix)
        );

    });

    document.addEventListener('gameStateChange', _ => {
        grid.render(colorizeMatrix(g.currentState.matrix));
    });

    const gridlinesButton = document.getElementById('gridLines');
    gridlinesButton.oninput =  _ => {
        if (grid.gridLines) {
            grid.removeGridLines();
            gridlinesButton.checked = false;
        } else {
            grid.addGridLines();
            gridlinesButton.checked = true;
        }
    }

    const setScale = value => {
        value = parseFloat(value);
        if (value) { 
            grid.setScale(parseFloat(value)) ;
            scaleInputField.value = value;;
        }
    }

    const scaleInputField = document.getElementById('scaleFactor');
    scaleInputField.value = 1;

    const scaleInputSetButton = document.getElementById('setScale');
    const scaleInputResetButton = document.getElementById('resetSize')
    scaleInputSetButton.onclick = _ => setScale(scaleInputField.value);
    scaleInputField.addEventListener('keydown', e => {
        if (e.code === 'Enter') setScale(scaleInputField.value);
    });
    scaleInputResetButton.onclick = _ => setScale(1);


    Playback.init();
}

init();
