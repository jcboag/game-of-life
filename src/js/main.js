const WINDOW_RESIZE_FACTOR = 0.75;

const DEFAULT_SIZE = 50;
const DEFAULT_SPEED = 1; // Grid updates per SECOND 

var g,
    editor,
    maxCanvasHeight,maxCanvasWidth;


class Settings {
    static #key = 'lastPageState';
    static #settings;

    static defaults = new Map([
        ['gridScale', 1],
        ['gridLines', true],
        ['dimensions', [50,50]],
        ['speed', 10],
        ['state', 'playback']
    ])

    static init(reset=false) {
        if (reset) {
            this.#settings = this.defaults;
            this.save();
        } else {
            this.load();
        }
        this.load(reset);
        document.addEventListener('pagePropsChanged', _ => Settings.save());
    }

    static load() {
        this.#settings = new Map(JSON.parse(localStorage.getItem(this.#key))) || this.defaults;
    }

    static save() {
        localStorage.setItem(this.#key, JSON.stringify(Array.from(this.#settings.entries())));
    }

    static get(setting) {
        return this.#settings.get(setting) || this.defaults.get(setting);
    }

    static set(setting,value) {
        this.#settings.set(setting,value);
        this.save();
    }
}


function fitCanvasToWindow(canvas,scaleFactor=WINDOW_RESIZE_FACTOR) {
    if (!canvas) return;

    const measure =  Math.min(window.innerWidth, window.innerHeight);
    canvas.width = canvas.height = measure * scaleFactor;

    // Anytime it is resized, we need to track the max size it can 
    // take on to properly scale it
    maxCanvasWidth = canvas.width;
    maxCanvasHeight = canvas.height
    reinitGrid();
}

function reinitGrid() {
    let grid;

    switch( PageState.currentState ) {
        case 'playback' : grid = g?.grid; break;
        case 'edit': grid = editor?.grid; break;
    }

    if (grid) grid.init([grid.rows,grid.columns], grid.gridLines, grid.state);
}

function rescaleGrid(grid,scaleFactor) {
    fitCanvasToWindow();
    grid.gridEngine.canvas.width = maxCanvasWidth * scaleFactor;
    grid.gridEngine.canvas.height = maxCanvasHeight * scaleFactor;
}

function initializeGameOfLife(initialState=DEFAULT_SIZE,speed=10,canvas) {
    g = new GameOfLife({initialState, speed, canvas});
    g.initGrid();
}

function getPageState() {
    return g.gameState.set('gridLines', g.grid.gridLines);
}

function init() {
    Settings.init();
    PageState.currentState = 'playback';

    const canvas = document.querySelector('canvas');
    fitCanvasToWindow(canvas);

    const speed = Settings.get('speed');
    const dimensions = Settings.get('dimensions')?.at(0);

    initializeGameOfLife(dimensions,speed,canvas)

    Playback.init();
    KeyboardShortcuts.init();

    document.addEventListener('pageStateChange', _ => handlePageStateChange(PageState.currentState));


    window.addEventListener('resize', () => {
        fitCanvasToWindow(canvas);
    });

    const customStateButton = document.getElementById('customState');
    customStateButton.onclick = () => { 
        editor = new Editor(); 
    } 
}

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
            document.dispatchEvent(new CustomEvent('pageStateChange', { detail: { state: this.currentState}}));
        }
    }
}

function handlePageStateChange(state) {
    if (state === 'edit' ) {
        activeGrid = editor?.grid;
        Playback.disable();
        KeyboardShortcuts.disable();

    } else if (state === 'playback') {
        Playback.enable();
        KeyboardShortcuts.enable();
    }
} 

init();
