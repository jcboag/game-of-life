DEFAULT_EDITOR_DIMENSIONS = [50,50];

class Editor {
    static appname = 'editor';

    #firstValue = null;

    constructor({canvas, dimensions = null, initialState = null, gridlines = true}) {
        this.canvas = canvas;
        initialState = this.getInitialMatrix(initialState, dimensions);
        this.initGrid(initialState, gridlines);
        this.bindEventListeners();
    }

    bindEventListeners() {
        this.onCanvasDrag = this.onCanvasDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.canvas.addEventListener('mousedown', this.onMouseDown);
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

    initGrid(initialState,gridlines) {
        this.matrix = initialState;
        const dimensions = Matrix.getDimensions(this.matrix);
        this.grid = new Grid(this.canvas);
        this.grid.init({dimensions, gridlines, initialState: this.matrix});
        this.render();
    }

    get appname() {
        return Editor.appname;
    }

    get dimensions() {
        return [this.grid.rows, this.grid.columns]
    }

    onMouseDown(e) {
        const startPos = this.grid.getSquareFromPoint([e.clientX, e.clientY]);
        const firstValue = !Matrix.getItem(this.matrix, startPos);

        this.updateSquare(startPos, firstValue);

        document.addEventListener('mousemove', this.onCanvasDrag);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    onCanvasDrag(e) {
        const pos = this.grid.getSquareFromPoint([e.clientX, e.clientY]);
        if (pos) this.updateSquare(pos, this.#firstValue);
    }

    onMouseUp(e) {
        document.removeEventListener('mousemove', this.onCanvasDrag);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    updateSquare(pos, value) {
        this.#firstValue = value;
        Matrix.setItem(this.matrix, pos, value);
        this.render();
    }

    render() {
        this.grid.render(Colorizer.monochrome(this.matrix));
    }

    set gridlines(bool) {
        if (typeof bool === 'boolean') this.grid.gridlines = bool;
        this.render();
    }

    get gridlines() {
        return this.grid.gridlines;
    }

    cleanup() {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onCanvasDrag);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    changeDimensions([m,n]) {
        const newMatrix = Matrix.map(
            Matrix.getNullMatrix(m,n),
            (a,[i,j]) => ( i < m && j < n ) ? Matrix.getItem(this.matrix,[i,j]) : a
        );

        const gridlines = this.gridlines;
        this.initGrid(newMatrix, gridlines);
    }
}
