const DEFAULT_GRID_HEIGHT = 100;

// The `GridEngine` is responsible for the lower level details of the grid,
// While the `Grid` itself only deals with `squares`.

class CanvasGridEngine {
    constructor(canvasNode) {
        this.canvas = canvasNode;
        if (!this.canvas) throw Error("No canvas element found");
        this.ctx = this.canvas.getContext('2d');

    }

    // Needs to be re initialized anytime the number of squares 
    // or the size of the grid changes
    init(m,n) {
        this.squareWidth = this.canvas.width / n;
        this.squareHeight = this.canvas.height / m;
    }

    #addLine(startPos, endPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(...startPos);
        this.ctx.lineTo(...endPos);
        this.ctx.stroke();
    }


    #clear(x,y,w,h) {
        this.ctx.clearRect(x,y,w,h);
    }

    #fill(x,y,w,h,fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(x,y,w,h);
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

    fillSquare([i,j],fillStyle) {
        const [ x, y ] = [i * this.squareWidth, j * this.squareHeight];
        this.#fill(x,y,this.squareWidth,this.squareHeight,fillStyle);
    }

    clearGrid() {
        this.#clear(0,0,this.canvas.width,this.canvas.height);
    }
}


// Deals with higher level operations of the grid (square level)
// `Grid` can render matrices of RGBA values
class Grid {
    #state;

    constructor(el=document.querySelector('canvas')) {
        this.gridEngine = new CanvasGridEngine(el);
    }

    init(initialState,gridLines=false) {
        this.gridLines = gridLines;
        initialState = initialState || Matrix.getNullMatrix(DEFAULT_GRID_HEIGHT,DEFAULT_GRID_HEIGHT);
        [this.rows, this.columns] = Matrix.getDimensions(initialState);
        this.gridEngine.init(this.rows,this.columns);

        this.render(initialState);
    }

    #setSquareRGBA([i,j],fillStyle) {
        this.gridEngine.fillSquare([i,j],fillStyle);
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

    render(state) {
        this.clear();
        if (state) this.#state = state;
        Matrix.forEach(this.#state, (a,index) => this.#setSquareRGBA(index,a));
        if (this.gridLines) this.addGridLines();
    }

    clear() {
        if (!this.#state) this.#state = [];;
        this.gridEngine.clearGrid();
    }

}
