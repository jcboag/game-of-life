import Matrix from './Matrix';

class CanvasGridEngine {
    #ctx;
    constructor(canvasNode, [m,n]) {
        this.canvas = canvasNode;
        if (!this.canvas) throw Error("No canvas element found");
        this.#ctx = this.canvas.getContext('2d');
        this.rows = m;
        this.columns = n;

        this.originalHeight = this.canvas.height;
        this.originalWidth = this.canvas.width;
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
        return this.canvasWidth / this.columns
    }

    get squareHeight() {
        // squareHeight * numcolumnsquares = canvafsHeight
        return this.canvasHeight / this.rows

    }

    get offset() {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: rect.left,
            y: rect.top,
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
// `Grid` can render matrices of hex/RGBA/color values

class Grid {

    constructor({canvas = document.querySelector('canvas'), dimensions: [ rows, columns ], gridLines = true}) {

        this.dimensions = [ rows, columns ];
        this.gridEngine = new CanvasGridEngine(canvas, this.dimensions );

        this.rows = rows;
        this.columns = columns;

        this.gridLines = gridLines;

    }

    render(state) {
        this.clear();

        Matrix.forEach(state, (value, index) => this.setSquareColor(index, value));

        if (this.gridLines) {
            this.addGridLines();
        }
    }

    clear() {
        this.gridEngine.clearGrid();
    }

    setSquareColor([i, j], color) {
        if (color === null) {
            this.clearSquare([i, j]);
        } else {
            this.gridEngine.fillRect(...this.getSquarePosition([i, j]), this.squareWidth, this.squareHeight, color);
        }
    }

    clearSquare([i, j]) {
        this.gridEngine.clearRect(...this.getSquarePosition([i, j]), this.squareWidth, this.squareHeight);
    }

    getSquarePosition([i, j]) {
        return [this.squareWidth * i, this.squareHeight * j];
    }

    getSquareFromPoint([x,y]){
        const canvasPosition = this.gridEngine.canvasPositionFromPoint([x,y]);
        return canvasPosition ? this.gridEngine.squareFromCanvasPosition(canvasPosition) : null;
    }

    addGridLines() {
        for (let i = 0; i < this.rows; i++) {
            this.addLine('x', i);
        }
        for (let j = 0; j < this.columns; j++) {
            this.addLine('y', j);
        }
    }

    addLine(axis, p) {
        p = Math.floor(p) * (axis === 'x' ? this.gridEngine.squareHeight : this.gridEngine.squareWidth);
        this.gridEngine.addLineAcrossCanvas(axis, Math.floor(p));
    }

    get squareWidth() {
        return this.gridEngine.squareWidth;
    }

    get squareHeight() {
        return this.gridEngine.squareHeight;
    }
}


// const monochrome = (m) => Matrix.map( m, (e) => e ? 'black' :  'white' );

// document.addEventListener( 'DOMContentLoaded'  , () => {

//     const el = document.querySelector('canvas');
//     const dimensions = [10,10];
    
//     g = new Grid( { el, dimensions } );

//     g.render(monochrome(
//         Matrix.map(
//             Matrix.getNullMatrix(10,10),
//             (e) => 0.5 < Math.random() ? 0 : 1
//         )
//     ));


// });


export default Grid;
