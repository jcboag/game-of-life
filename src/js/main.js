const WINDOW_RESIZE_FACTOR = 0.75;

const DEFAULT_SIZE = 50;
const DEFAULT_SPEED = 1; // Grid updates per SECOND 


var g,
    grid,
    maxCanvasHeight,maxCanvasWidth;

// Re-initialize grid with same state
// Useful when external changes have been made to grid (eg size)
function reInitGrid() {
    grid.init( grid.dimensions, grid.gridLines, grid.state );
}

function colorizeMatrix(matrix,method) {
    // Monochrome
    if (!method) return Matrix.map( matrix, a => a ? Colorizer.colors.black : Colorizer.colors.white );
}

function newDisplayMatrixHandler(e) {
    grid.render(e.detail.displayMatrix);
}

function scaleCanvas(factor) {
    const canvas = grid.gridEngine.canvas;
    canvas.height = factor * maxCanvasHeight;
    canvas.width = factor * maxCanvasWidth;
    reInitGrid();
}

function fitCanvasToWindow() {
    const canvas = document.getElementById('grid');
    const measure =  Math.min(window.innerWidth, window.innerHeight);
    canvas.width = canvas.height = measure * WINDOW_RESIZE_FACTOR;

    // Anytime it is resized, we need to track the max size it can 
    // take on to properly scale it
    maxCanvasWidth = canvas.width;
    maxCanvasHeight = canvas.height
}

class Settings {
    static #key = 'lastPageState';
    static #settings;

    static defaults = new Map([
        ['gridScale', 1],
        ['gridLines', true],
        ['dimensions', [50,50]],
        ['speed', 1],
        ['state', 'playback']
    ])

    static init(reset=false) {
        this.load(reset);
        document.addEventListener('pagePropsChanged', _ => Settings.save());
    }

    static load(reset=false) {
        this.#settings = reset ? new Map( this.defaults ) : new Map (JSON.parse(localStorage.getItem(this.#key)) || this.defaults);
    }

    static save() {
        localStorage.setItem(this.#key, JSON.stringify(Array.from(this.#settings.entries())));
    }

    static get(setting) {
        console.log(this.#settings);
        console.log(this.#settings.get(setting));
        return this.#settings.get(setting) || this.defaults.get(setting);
    }

    static set(setting,value) {
        this.#settings.set(setting,value);
        this.save();
    }
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
    localStorage.setItem('lastGridState', JSON.stringify(Array.from(currentState.entries()))) ;
}

function getLastGridState() {
    return new Map(JSON.parse( localStorage.getItem('lastGridState')));
}

function init() {

    function initializeGrid(dimensions,gridLines) {
        grid = new Grid();
        grid.init(dimensions, gridLines);
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
        rowsField.value = grid.rows;
        colsField.value = grid.columns;


        // 'Bind' the values of the buttons to the state of the grid
        gridLinesButton.oninput =  _ => {
            if (gridLinesButton.checked && !grid.gridLines ) {
                grid.addGridLines();
            } else if ( !gridLinesButton.checked && grid.gridLines) {
                grid.removeGridLines();
            }
            Settings.set('gridLines',grid.gridLines);
        }
        [rowsField, colsField].forEach(field => {
            field.onchange = e => { 
                grid.init([parseInt(e.target.value), parseInt(e.target.value)], grid.gridLines);
                rowsField.value = colsField.value = e.target.value;
                Settings.set('dimensions', grid.dimensions);
            }
        });

        scaleInputField.value = Settings.get('gridScale');
        scaleCanvas(scaleInputField.value);
        scaleInputField.onchange = _ => {
            const value = parseFloat(scaleInputField.value);
            if (value) {
                scaleCanvas(value);
                Settings.set('gridScale', value);

            }
        };

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

    Settings.init();
    
    // Need to ensure canvas is where it is supposed to be relative
    fitCanvasToWindow();

    // Get last values for persistence
    const lastGrid = getLastGridState();
    const dimensions = lastGrid.get('dimensions') || [DEFAULT_SIZE,DEFAULT_SIZE];
    const gridLines = lastGrid.get('gridLines') || true;

    initializeGrid(dimensions,gridLines);
    initializeStateCreators();
    initializeGridManipulators();
    initializePlayback();
    initializeKeyboardShortcuts();

    document.addEventListener('stateChange', _ => handlePageStateChange(PageState.currentState));

    window.addEventListener('resize', () => {
        // Scale grid relative to window
        fitCanvasToWindow();
        scaleCanvas( document.getElementById('scaleFactor').value )
        reInitGrid();
    });
    InitialStateEditor.random(grid.dimensions);
}


init();
