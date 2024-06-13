const DEFAULT_GRID_HEIGHT = 100;

// The `GridEngine` is responsible for the lower level details of the grid,
// While the `Grid` itself only deals with `squares`.

class CanvasGridEngine {
    static DEFAULT_CANVAS_SELECTOR = 'canvas';

    constructor(canvasNode=document.querySelector(CanvasGridEngine.DEFAULT_CANVAS_SELECTOR)) {
        this.canvas = canvasNode;
        if (!this.canvas) throw Error("No canvas element found");

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

    }
    init(m,n) {
        this.rows = m;
        this.cols = n;
        this.squareWidth = this.width / this.rows
        this.squareHeight = this.height / this.cols;
    }

    setDimensions(m,n) {
        this.clearGrid();
        this.init(m,n);
    }

    generateGridLines() {
        const width = this.squareWidth;
        const height = this.squareHeight;

        for (let i=0;i<this.rows;i++) {
            this.#addLine([width * i,0],[width*i,this.height]);
        }
        for (let j=0;j<this.cols;j++) {
            this.#addLine([0,height*j],[this.width,height*j])
        }
    }

    #addLine(startPos, endPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(...startPos);
        this.ctx.lineTo(...endPos);
        this.ctx.stroke();
    }

    render(matrix) {
        this.clearGrid();
        Matrix.forEach(matrix, (color, [i,j]) => { 
            this.fillSquare([i,j], color);
        });
    }


    #clear(x,y,w,h) {
        this.ctx.clearRect(x,y,w,h);
    }

    #fill(x,y,w,h,fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(x,y,w,h);
    }

    fillSquare([i,j],fillStyle) {
        const [ x, y ] = [i * this.squareWidth, j * this.squareHeight];
        this.#fill(x,y,this.squareWidth,this.squareHeight,fillStyle);
    }

    clearGrid() {
        this.#clear(0,0,this.width,this.height);
    }
}


// Deals with higher level operations of the grid (square level)
// `Grid` can render matrices of RGBA values
class Grid {
    #state;

    constructor(el) {
        this.gridEngine = new CanvasGridEngine(el);
    }

    init(initialState) {
        initialState = initialState || Matrix.getNullMatrix(DEFAULT_GRID_HEIGHT,DEFAULT_GRID_HEIGHT);
        [this.rows, this.columns] = Matrix.getDimensions(initialState);
        this.gridEngine.init(this.rows,this.columns);
        this.render(initialState);

    }

    render(state) {
        this.clear();
        if (state) this.#state = state;
        Matrix.forEach(this.#state, (a,index) => this.#setSquareRGBA(index,a));
    }

    clear() {
        if (!this.#state) this.#state = [];;
        this.gridEngine.clearGrid();
    }

    #setSquareRGBA([i,j],fillStyle) {
        this.gridEngine.fillSquare([i,j],fillStyle);
    }

    toggleGridLines() {
    }

}
