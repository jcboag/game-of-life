import Grid  from './Grid';
import Colorizer  from './Colorizer';
import Matrix from './Matrix';

const DEFAULT_EDITOR_DIMENSIONS = [50,50];

// Should communicate to `Editor` that a point
// was touched. `Editor` then does not have to
// concern with the the input method

class EditorInputManager {

    constructor(canvas, { handleInputStart, handleDrag, handleInputEnd } = {}) {
        this.canvas = canvas;
        this.handleInputStart = handleInputStart;
        this.handleDrag = handleDrag;
        this.handleInputEnd = handleInputEnd;
        this.dragStartPosition= null;
        this.bindListeners();

        [ 'mousedown', 'touchstart' ].forEach(  eventName => {
            this.canvas.addEventListener( eventName, this.onInputStart );
        });
    }

    bindListeners() {
        this.onInputStart = this.onInputStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onInputEnd = this.onInputEnd.bind(this);
    }

    getPosition(e) {
        const posSource = e.touches ? e.touches[0] : e;
        return [posSource.clientX, posSource.clientY]
    }

    onInputStart(e) {
        try {
            this.dragStartPosition = this.getPosition(e);
        } catch(e) {
            console.error(e);
            return;
        }

        if (e.touches) {
            e.preventDefault();
            document.addEventListener('touchend', this.onInputEnd, { one: true });
            document.addEventListener('touchmove', this.onDrag, { passive: false });
        } else {
            document.addEventListener('mouseup', this.onInputEnd);
            document.addEventListener('mousemove', this.onDrag);
        }
        this.handleInputStart(this.dragStartPosition);
    }

    onDrag(e) {
        if ( e.touches ) e.preventDefault();

        const position = this.getPosition(e);
        if (position) this.handleDrag(position, this.dragStartPosition);
        
    }

    onInputEnd(e) {
        if ( e.touches ) e.preventDefault();

        document.removeEventListener('touchend', this.onInputEnd);
        document.removeEventListener('touchmove', this.onDrag);
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onInputEnd);
        this.dragStartPosition = null;

        if ( this.handleInputEnd ) this.handleInputEnd();

    }

    cleanup() {
        [ 'mousedown', 'touchstart' ].forEach(  eventName => {
            this.canvas.removeEventListener( eventName, this.onInputStart );
        });
    }
}

class Editor {
    static appname = 'editor';

    constructor({canvas, dimensions = null, initialState = null, gridLines = true}) {
        this.canvas = canvas;

        initialState = this.getInitialMatrix(initialState, dimensions);

        this.initGrid(initialState, gridLines);

        this.handleInputStart = this.handleInputStart.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.inputManager = new EditorInputManager(
            this.canvas, 
            {
                handleInputStart: this.handleInputStart,
                handleDrag : this.handleDrag,
            }
        );

    }

    get appname() {
        return Editor.appname;
    }

    get dimensions() {
        return [this.grid.rows, this.grid.columns]
    }

    initGrid(initialState,gridLines) {
        this.matrix = initialState;
        const dimensions = Matrix.getDimensions(this.matrix);
        this.grid = new Grid(this.canvas);
        this.grid.init({dimensions, gridLines, initialState: this.matrix});
        this.render();
    }

    getInitialMatrix(initialState, dimensions) {
        // Enables dimensions to be larger than the actually inputted initial state
        if (initialState) {
            const initialStateDimensions = Matrix.getDimensions(initialState);
            // If dimensions are given, ensure they are at least as large as the matrix
            dimensions = dimensions ? initialStateDimensions.map((a,i) => Math.max(a, dimensions[i])) : initialStateDimensions;
        } else {
            dimensions = dimensions || DEFAULT_EDITOR_DIMENSIONS;
            initialState = Matrix.getNullMatrix( ...dimensions);
        }
        return initialState;
    }

    render() {
        this.grid.render(Colorizer.monochrome(this.matrix));
    }

    getSquare(pos) {
        return this.grid.getSquareFromPoint(pos);
    }

    setSquareValue(index,value) {
        try {
            Matrix.setItem( this.matrix, index, value )
            this.render();
        } catch(e) {
            
        }
    }

    getSquareValue(index) {
        return Matrix.getItem( this.matrix, index );
    }

    handleInputStart(pos) {
        const square = this.getSquare(pos);
        if (square) this.setSquareValue(square, !this.getSquareValue(square))
    }

    handleDrag(pos) {
        const square = this.getSquare(pos);
        const value = this.getSquareValue ( this.getSquare( this.inputManager.dragStartPosition ) );

        this.setSquareValue( square, value );
    }

    set gridLines(bool) {
        if (typeof bool === 'boolean') this.grid.gridLines = bool;
        this.render();
    }

    get gridLines() {
        return this.grid.gridLines;
    }

    changeDimensions([m,n]) {
        const newMatrix = Matrix.map(
            Matrix.getNullMatrix(m,n),
            (a,[i,j]) => ( i < m && j < n ) ? Matrix.getItem(this.matrix,[i,j]) : a
        );

        const gridLines = this.gridLines;
        this.initGrid(newMatrix, gridLines);
    }

    cleanup() {

        this.inputManager.cleanup();
    }

    clear() {
        this.matrix = Matrix.getNullMatrix(...this.dimensions);
        this.render();
    }
}

export default Editor;
