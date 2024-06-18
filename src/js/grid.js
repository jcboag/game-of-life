const DEFAULT_GRID_HEIGHT = 100;

// The `GridEngine` is responsible for the lower level details of the grid,
// While the `Grid` itself only deals with `squares`.


class CanvasGridEngine {
    #ctx;
    constructor(canvasNode) {
        this.canvas = canvasNode;
        if (!this.canvas) throw Error("No canvas element found");
        this.#ctx = this.canvas.getContext('2d');
    }

    // Needs to be re initialized anytime the number of squares changes
    init(m,n) {
        this.rows = m;
        this.cols = n;
        this.originalHeight = this.canvasHeight;
        this.originalWidth = this.canvasWidth;
    }

    get canvasHeight() {
        return this.canvas.height
    }

    set canvasHeight(height) {
        this.canvas.height = height;
    }

    get canvasWidth() {
        return this.canvas.width
    }

    set canvasWidth(width) {
        this.canvas.width = width;
    }

    get squareWidth() {
        // squareWidth * numRowSquares = canvasWidth
        return this.canvasWidth / this.cols
    }

    get squareHeight() {
        // squareHeight * numColSquares = canvafsHeight
        return this.canvasHeight / this.rows

    }

    get offset() {
        const rect = this.canvas.getBoundingClientRect();
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        return {
            x: rect.left + scrollLeft,
            y: rect.top + scrollTop,
        }
    }

    #addLine(startPos, endPos) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(...startPos);
        this.#ctx.lineTo(...endPos);
        this.#ctx.stroke();
    }

    #clear(x,y,w,h) {
        this.#ctx.clearRect(x,y,w,h);
    }

    addLineAcrossCanvas(axis,p) {
        axis = axis.toLowerCase();
        if (axis === 'x') this.#addLine( [0,p], [this.canvas.width,p]);
        if (axis === 'y') this.#addLine( [p,0], [p,this.canvas.height]);
    }

    render(matrix) {
        this.clearGrid();
        Matrix.forEach(matrix, (color, [i,j]) => { 
            this.fillSquare([i,j], color);
        });
    }

    clearGrid() {
        this.#clear(0,0,this.canvas.width,this.canvas.height);
    }

    canvasPositionFromPoint([x,y]) {
        x = x - this.offset.x;
        y = y - this.offset.y;
        return  x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height ? [x,y] : null;
    }

    squareFromCanvasPosition([x,y]) {
        return [ x / this.squareWidth, y / this.squareHeight ].map(a => Math.floor(a));
    }

    #setSize(w,h) {
        this.canvas.width = w;
        this.canvas.height = h;
    }

    setScale(scaleFactor) {
        if (!parseFloat(scaleFactor)) throw Error("Invalid scale factor");
        this.#setSize( this.originalWidth * scaleFactor, this.originalHeight * scaleFactor );
    }

    getPointRGBA([x,y]) {
        const [r,g,b,a] = this.#ctx.getImageData(x,y,1,1)?.data;
        return [r,g,b,a];
    }

    fillRect(x,y,w,h,fillStyle) {
        this.#ctx.fillStyle = fillStyle;
        this.#ctx.fillRect(x,y,w,h);
    }

    clearRect(x,y,w,h) {
        this.#ctx.clearRect(x,y,w,h);
    }
}


// Deals with higher level operations of the grid (square level)
// `Grid` can render matrices of RGBA values
class Grid {
    #state;

    static blankState = (m,n) => Matrix.getNullMatrix(m,n);

    constructor(el=document.querySelector('canvas')) {
        this.gridEngine = new CanvasGridEngine(el);
    }

    init(initialState,gridLines) {
        if (!initialState) initialState = DEFAULT_GRID_HEIGHT;
        const state = Number.isInteger(initialState) ? Grid.blankState(initialState,initialState) : initialState;
        [this.rows, this.columns] = Matrix.getDimensions(state);
        this.nullState = Number.isInteger(initialState) ? state : Grid.blankState(this.rows,this.columns);
        if (!Matrix.isMatrixLike(state)) throw Error("Input into Grid must be a Matrix-like object");
        this.gridLines = gridLines;
        this.gridEngine.init(this.rows,this.columns);
        this.render(state);
    }

    get squareWidth() {
        return this.gridEngine.squareWidth;
    }

    get squareHeight() {
        return this.gridEngine.squareHeight;
    }

    getSquarePosition([i,j]) {
        return [this.squareWidth * i , this.squareHeight * j];
    }

    midPoint([i,j]) {
        return [ this.squareWidth * ( 2 * i + 1 ) / 2, this.squareHeight * ( 2 * j + 1 ) / 2 ];
    }

    getSquareColor([i,j]) {
        return this.gridEngine.getPointRGBA(this.midPoint([i,j]));
    }

    setSquareColor([i,j], color) {
        if (color === null) this.clearSquare([i,j]);
        else this.gridEngine.fillRect(...this.getSquarePosition([i,j]), this.squareWidth, this.squareHeight, color);
    }

    clearSquare([i,j]) {
        this.gridEngine.clearRect(...this.getSquarePosition([i,j]),this.squareWidth,this.squareHeight);
    }

    // axis: x or y
    // `p` : row (if axis is `x`) and col ( if axis `y` )
    #addLine(axis,p) {
        p = Math.floor(p) * this.gridEngine.squareWidth;
        this.gridEngine.addLineAcrossCanvas(axis, Math.floor(p) ); 
    }

    addGridLines() {
        for (let i=0; i < this.rows; i++) {
            this.#addLine('x',i)
        }
        for (let j=0; j < this.columns; j++ ) {
            this.#addLine('y',j)
        }
        this.gridLines=true;
    }

    // Just re-render the stored state
    removeGridLines() {
        this.gridLines = false;
        this.render(this.#state);
    }

    render(state,gridLines=this.gridLines) {
        this.clear(false);
        if (state) this.#state = state;
        Matrix.forEach(this.#state, (a,index) => this.setSquareColor(index, a))
        if(gridLines === true) this.addGridLines();
        else (this.gridLines = false);
    }

    clear(gridLines=this.gridLines) {
        this.gridEngine.clearGrid();
        if (!this.#state) this.#state = this.nullState;
        if (gridLines) this.addGridLines();
        else this.gridLines = false;
    }

    squareFromPoint([x,y]){
        const canvasPosition = this.gridEngine.canvasPositionFromPoint([x,y]);
        return canvasPosition ? this.gridEngine.squareFromCanvasPosition(canvasPosition) : null;
    }

    setScale(scaleFactor) {
        this.gridEngine.setScale(scaleFactor);
        this.render();
    }
}
