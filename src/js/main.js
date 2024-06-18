const DEFAULT_UPDATE_RATE = 90;
const DEFAULT_SIZE = 50;

var g,grid;

const Playback = {
    init() {
        this.intervalId = null;
        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        this.randomButton = document.querySelector('#random');
        this.resetButton = document.querySelector('#reset');

        this.startStopButton.onclick = this.toggleStart.bind(this);
        this.rewindButton.onclick = this.rewind.bind(this);
        this.forwardButton.onclick = this.forward.bind(this);
        this.randomButton.onclick = this.random.bind(this);
        this.resetButton.onclick = this.reset.bind(this);
    },
    startLoop(maxLoop=Infinity,updateRate=DEFAULT_UPDATE_RATE) {
        let count = 0;

        const updateState = () => {
            if (count >= maxLoop) {
                this.stop();
                return;
            }
            g.statePosition++;
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
            g.statePosition--;
        } catch {
            g.statePosition = 0;
        }
    },
    forward() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            g.statePosition++;
        } catch {
            g.statePosition--;
        }
    },
    reset() {
        if (this.loopInProgress()) this.stop();
        g.statePosition = 0;
    },
    random() {
        if (this.loopInProgress()) this.stop();
        g = new GameOfLife();
        g.init();
        grid.init(g.monochrome);
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

function getInitialState() {

    return new GameOfLifeMatrix();
}

function initializeGameOfLifeClass() {

    // Deocrate the setter `GameOfLife.statePosition` so changes in state are rendered anytime it changes
    const statePositionSetter = Object.getOwnPropertyDescriptor(GameOfLife.prototype, 'statePosition').set;
    Object.defineProperty( GameOfLife.prototype, 'statePosition', {
        set(statePosition) { 
            statePositionSetter.call(this,statePosition);
            grid.render(grid.render(g.monochrome));
        }
    });

    // Add a 'mononchrome' property to `GameOfLife` which gives its current state as as a monochrome
    // matrix for input into `Grid`.
    Object.defineProperty( GameOfLife.prototype, 'monochrome' , {
        get() {
            return this.currentState.map( a => a ? 'black' : 'white' ).matrix
        }
    });

}


function init() {

    initializeGameOfLifeClass();
    g = new GameOfLife(DEFAULT_SIZE); 

    grid = new Grid(); 
    grid.init(g.monochrome);

    GridManipulations.init();
    KeyboardShortcuts.init();
    Playback.init();
}

init();
