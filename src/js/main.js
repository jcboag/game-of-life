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
    random() {
        if (this.loopInProgress()) this.stop();
        g = getInitialState(DEFAULT_SIZE);
        initializeGrid(g);
    }
};


const GridManipulations = {
    init() {
        this.initGridLines();
        this.initScaling();
    },
    initGridLines() {
        const gridLinesCheckbox = document.getElementById('gridLines');
        gridLinesCheckbox.checked = JSON.parse(localStorage.getItem('gridLines'));
        this.setGridLines();
        document.addEventListener('input', e => {
            if (e.target.id === 'gridLines') this.setGridLines();
        });
    },
    setGridLines() {
        const gridLinesEnabled = document.getElementById('gridLines').checked;
        if (gridLinesEnabled) grid.addGridLines();
        else grid.removeGridLines();

        // Save state for reaload
        localStorage.setItem('gridLines', JSON.stringify(grid.gridLines));
    },
    toggleGridLines() {
        const gridLinesCheckbox = document.getElementById("gridLines");
        gridLinesCheckbox.checked = !grid.gridLines;
        GridManipulations.setGridLines();
    },
    initScaling() {
        const scaleDiv = document.getElementById('scale');
        const resetSizeButton = scaleDiv.querySelector('#resetSize');
        const setScaleButton = scaleDiv.querySelector('#setScale');
        const scaleFactorInput = scaleDiv.querySelector('#scaleFactor');

        const setScale = scaleFactor => {  
            grid.setScale(parseFloat(scaleFactor));
            scaleFactorInput.value = scaleFactor;
            localStorage.setItem('scaleFactor', JSON.stringify(scaleFactorInput.value));
        }

        resetSizeButton.onclick = _ => {
            setScale(1);
        }

        setScaleButton.onclick = _ => {
            setScale(scaleFactorInput.value);
        }

        const initValue = scaleFactorInput.value = parseFloat(JSON.parse(localStorage.getItem('scaleFactor'))) || 1;
        setScale(initValue);
    },
}

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
        G: GridManipulations.toggleGridLines,
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

    const onSubmit = e => {
        if (e.code === 'Enter') {
            document.removeEventListener('keydown', onSubmit);
            document.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('click', onGridClick)

            g = new GameOfLife(Matrix.map(initialState, a => a ? 1 : 0 ));
            Playback.init();
            Playback.startLoop();
        }
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

    grid.init(Matrix.getDimensions(initialState), true);

    render();
}

function colorizeMatrix(matrix,method) {
    // Monochrome
    if (!method) return Matrix.map( matrix, a => a ? Colorizer.colors.black : Colorizer.colors.white );
}

function getInitialState() {
    return new GameOfLife(DEFAULT_SIZE);
}

function renderDisplayMatrix(matrix) {
    grid.render(matrix);
}

function renderGame(game) {
    const displayMatrix = colorizeMatrix(game.currentState.matrix);
    renderDisplayMatrix(displayMatrix)
}

function setStatePosition(game,pos) {
    game.statePosition = pos;
    renderGame(game);
}

function nextState(game) {
    setStatePosition(game, ++game.statePosition);
}

function previousState(game) {
    setStatePosition(game, --game.statePosition);
}

function initializeGrid(game) {
    grid.init(Matrix.getDimensions(game.currentState.matrix), false);
    renderGame(game);
}

function createRandomState(n) {
    if (Playback.loopInProgress()) Playback.stop();
    g = new GameOfLife(n);  
    renderGame(g);
}

function init() {
    const size = 10;

    grid = new Grid();
    grid.init([size,size],true);

    KeyboardShortcuts.init();
    Playback.init();

    document.getElementById('customState').onclick = _ => createInitialState(size);
    document.getElementById('randomState').onclick = _ => createRandomState(size);

}

init();
