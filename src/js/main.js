const DEFAULT_SIZE = 50;
const DEFAULT_SPEED = 1; // Grid updates per SECOND 

var g,
    grid;

function colorizeMatrix(matrix,method) {
    // Monochrome
    if (!method) return Matrix.map( matrix, a => a ? Colorizer.colors.black : Colorizer.colors.white );
}

function newDisplayMatrixHandler(e) {
    grid.render(e.detail.displayMatrix);
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
