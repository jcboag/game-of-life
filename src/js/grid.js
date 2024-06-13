const DEFAULT_GRID_HEIGHT = 100;
const DEFAULT_FILL_STYLE = 'black';

class CanvasGridEngine {
    static DEFAULT_CANVAS_SELECTOR = 'canvas';

    constructor(m=DEFAULT_GRID_HEIGHT,n=DEFAULT_GRID_HEIGHT,canvasNode) {
        this.canvas = canvasNode || document.querySelector(CanvasGridEngine.DEFAULT_CANVAS_SELECTOR);
        if (!this.canvas) throw Error("No canvas element found");
        this.ctx = this.canvas.getContext('2d');
        this.init(m,n);

    }
    init(m,n) {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.rows = m;
        this.cols = n;
        this.squareWidth = this.width / this.rows
        this.squareHeight = this.height / this.cols;

        this.initSquares();

    }

    setDimensions(m,n) {
        this.clearGrid();
        this.init(m,n);
    }

    initSquares() {
        const squareWidth = this.squareWidth;
        const squareHeight = this.squareHeight;
        this.squares = [];
        for (let i=0;i<this.rows;i++) {
            for (let j=0;j<this.cols;j++) {
                this.squares.push({ 
                    location: [i,j],
                    xBounds: [squareWidth * i, squareWidth * (i+1)], 
                    yBounds: [squareHeight * j, squareHeight * (j+1)],
                    width: squareWidth,
                    height: squareHeight,
                });
            }
        }
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

    getSquare([i,j]) {
        return this.squares.find(sq => sq.location[0] === i && sq.location[1] === j);
    }

    #clear(x,y,w,h) {
        this.ctx.clearRect(x,y,w,h);
    }

    #fill(x,y,w,h,fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(x,y,w,h);
    }

    fillSquare([i,j],fillStyle=DEFAULT_FILL_STYLE) {
        let square = this.getSquare([i,j]);
        if (square) {
            this.#fill( square.xBounds[0], square.yBounds[0], square.width, square.height, fillStyle );
        }
    }

    clearGrid() {
        this.#clear(0,0,this.width,this.height)
    }
}

class Grid {
    // initialState: 2D Matrix
    // toRGB: function that maps matrix entries to colors
    // generateGridLines: boolean
    constructor(initialState=null,toRGB=null,generateGridLines=true) {
        const zeroWhiteOneBlack = a => a ? 'black' : 'white';

        initialState = initialState || Matrix.getNullMatrix(DEFAULT_GRID_HEIGHT,DEFAULT_GRID_HEIGHT);

        this.gridEngine = new CanvasGridEngine(...Matrix.getDimensions(initialState));

        if (generateGridLines) this.gridEngine.generateGridLines();

        this.toRGB = toRGB ||  zeroWhiteOneBlack;

    }

    init(state) {
        if (state) {
            this.gridEngine.regenerateGrid(...Matrix.getDimensions(state));
            this.render(state);
        }
    }

    // Need to match the grid dimensions with that of the `state`
    reinit(state) {
        if (state) {
            this.gridEngine.regenerateGrid(...Matrix.getDimensions(state));
            this.render(state);
        } else {
            this.gridEngine.regenerateGrid();
        }
    }

    clear() {
        this.gridEngine.clearGrid();
    }

    get squares() {
        return this.gridEngine.squares;
    }

    get length() {
        return this.gridEngine.length;
    }

    get width() {
        return this.gridEngine.width;
    }

    render(matrix,func=this.toRGB) {
        this.gridEngine.render(Matrix.map( matrix, func));
    }
}
