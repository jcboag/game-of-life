const DEFAULT_DIMENSIONS = [25,25];
const DEFAULT_GAME_OF_LIFE = [25,25];
const DEFAULT_GAME_SPEED = 5;

class Page {
    static init() {
        this.shortcuts = new KeyboardShortcuts();

        this.customStateButton = document.getElementById('customState');
        this.randomStateButton = document.getElementById('randomState');
        this.modifyStateButton = document.getElementById('modifyState');

        this.randomStateButton.onclick = () => this.initializeGameOfLife();
        this.modifyStateButton.onclick = () => this.editCurrentState();
        this.customStateButton.onclick = () => this.initializeEditor();

        this.canvas = document.querySelector('canvas');
        this.setInitialApp();

        CanvasManipulator.fitCanvasToScreen(Page.canvas);

        this.trackPageChanges();

        window.addEventListener( 'resize', () => {
            if (Page.canvas) {
                CanvasManipulator.fitCanvasToScreen(Page.canvas);
            }
            window.app.render()
        });
    }

    static setInitialApp() {
        const dimensions = window.settings.get('dimensions') || DEFAULT_DIMENSIONS;
        const gridlines = window.settings.get('gridlines');

        const initGameOfLife = () => this.initializeGameOfLife(dimensions[0], gridlines);

        switch(window.settings.get('lastApp')) {
            case 'editor': 
                this.initializeEditor({dimensions, gridlines}); 
                break
            case 'gameoflife': 
                initGameOfLife();
                break;
            default:  
                initGameOfLife();
        }
        window.settings.savePageState();
    }

    static cleanup() {
        ['app', 'playback'].forEach( objName => {
            const obj = window[objName];
            if (obj?.cleanup) obj.cleanup();
            window[objName] = null;
        });

    }

    static setApp(app) {
        if (window.app) {
            if (app.stop) app.stop();
            this.cleanup();
        }
        window.app = app;
        GridManipulator.init();
        window.playback = new Playback(app);
        if (this.shortcuts) this.shortcuts.keyMap = this.getDefaultKeymap(app);
        window.settings.set('lastApp', app.appname);
    }

    static initializeGameOfLife(initialState,gridlines=app.gridlines) {
        initialState = initialState || app?.dimensions?.at(0) || DEFAULT_GAME_OF_LIFE[0];
        const speed = window.settings.get('speed') || DEFAULT_GAME_SPEED;
        const canvas = this.canvas;
        const gameOfLife = new GameOfLife({initialState, speed, canvas, gridlines});
        this.setApp(gameOfLife);
    }

    static initializeEditor({initialState,dimensions=app.dimensions, gridlines=app.gridlines}={}) {
        const canvas = this.canvas;
        const editor = new Editor({canvas, initialState, dimensions, gridlines});
        this.setApp(editor);
    }

    static getDefaultKeymap(app) {
        return new Map(KeyboardShortcuts.defaultShortcuts.get( app.appname ));
    }

    static trackPageChanges() {
        const relevantTarget = target => [ 'rows', 'cols', 'speed', 'gridlines' ].includes( target.id );
        const debouncedSave = debounce( () => window.settings.savePageState(), 300 );

        const handlePossiblePageChange = e => { 
            if (relevantTarget (e.target))  debouncedSave();
        }

        document.addEventListener( 'change', handlePossiblePageChange);
        document.addEventListener('input', handlePossiblePageChange);
    }

    // Initialize the editor with the underlying matrix of the
    // current grid
    static editCurrentState() {
        if (window.app.appname === GameOfLife.appname) {
            const currentState = window.app.currentState;
            Page.initializeEditor({ initialState: currentState });
        }
    }

}

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Initialize the state of the game using the underlying
//  matrix of the current grid
function getInitialStateFromEditor( { run = false } = {}) {
    const matrix = window.app.matrix;
    if ( window.app.appname === Editor.appname )  {
        Page.initializeGameOfLife(GameOfLifeMatrix.convert( matrix ));
        if (run) playback.startStopButton.click();
    }
}

// class StateManipulator {

//     static init() {
//         this.customStateButton = document.getElementById('customState');
//         this.randomStateButton = document.getElementById('randomState');
//         this.modifyStateButton = document.getElementById('modifyState');

//         this.randomStateButton.onclick = () => this.initializeGameOfLife();
//         this.modifyStateButton.onclick = () => this.editCurrentState();
//         this.customStateButton.onclick = () => this.initializeEditor();
//     }
// }

class GridManipulator {
    static toggleGridlines(app) {
        if (app && typeof app?.gridlines === 'boolean') app.gridlines = !app.gridlines; 
        if (this.gridlinesButton) this.gridlinesButton.checked = app.gridlines;
    }

    static changeDimensions(app, [m,n]) {
        switch( app.appname ) {
            case 'gameoflife':
                Page.initializeGameOfLife(m);
                break;
            case 'editor':
                app.changeDimensions([m,n]);
                break;
            default:
                null;
        }
        if ( this.dimensions ) this.setDimensionInputs();

        window.settings.savePageState();
    }

    static setDimensionInputs() {
        this.rowsInput.value = app?.grid.rows;
        this.colsInput.value = app?.grid.columns;
    }

    static init() {
        this.gridlinesButton = document.getElementById('gridlines');
        this.dimensions = document.getElementById('dimensions');
        this.rowsInput = document.getElementById('mRows');
        this.colsInput = document.getElementById('nCols');

        this.gridlinesButton.checked = window.app.gridlines;

        this.gridlinesButton.oninput = () => this.toggleGridlines(window.app);

        this.rowsInput.value = app?.grid.rows;
        this.colsInput.value = app?.grid.columns;

        this.dimensions.onchange = e => {
            if ( e.target.type === 'text' ) {
                const rows = parseInt(this.rowsInput.value);
                const cols = parseInt(this.colsInput.value);
                if (rows && cols) {
                    this.changeDimensions(window.app, [rows,cols] );
                }

            }
        }

    }

}

class CanvasManipulator {
    static resizeCanvas(canvas, [w,h], app=window.app) {
        canvas.width = w;
        canvas.height = h;
        if (app) app.render();
    }

    static scaleCanvas(canvas, scaleFactor) {
        const [w,h] = [ canvas.width, canvas.height];
        this.resizeCanvas(canvas, w * scaleFactor, h * scaleFactor);
    }
    static fitCanvasToScreen(canvas) {
        const MAX_SCALE_FACTOR = 0.8;
        const canvasHeight = canvas.height;
        const canvasWidth = canvas.width;
        let newHeight,
            newWidth;
        newHeight = window.innerHeight * MAX_SCALE_FACTOR;
        newWidth = newHeight * (canvasWidth / canvasHeight);
        this.resizeCanvas(canvas, [newWidth,newHeight]);
    }
}

window.settings = new Settings();

Page.init();
