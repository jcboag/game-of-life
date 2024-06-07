// An nxn collection of 'Squares'
class Grid {
    constructor(gridSelector='canvas') {
        this.canvas = document.querySelector(gridSelector);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.updateOffsets();
    }

    init(n, filledSquares = []) {
        this.step = this.width / n;
        this.length = n;
        this.size = n * n;
        this.generateGrid(filledSquares);
        return this;
    }

    // Dynamically update the offsets based on the canvas position
    updateOffsets() {
        const rect = this.canvas.getBoundingClientRect();
        this.offsetX = rect.left;
        this.offsetY = rect.top;
    }

    generateGrid(filledSquares = []) {
        this.clearGrid();
        for (let i = 0; i < this.length; i++) {
            this.addGridLine('x', i);
            this.addGridLine('y', i);
        }
        this.squares = this.getSquares();
        filledSquares.forEach(([i, j]) => this.fillSquare(this.getSquare(i, j)));
    }

    clearGrid() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    addLine(startPos, endPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(...startPos);
        this.ctx.lineTo(...endPos);
        this.ctx.stroke();
    }

    addGridLine(axis, n) {
        const step = this.step * n;
        switch (axis) {
            case 'x':
                this.addLine([0, step], [this.width, step]);
                break;
            case 'y':
                this.addLine([step, 0], [step, this.height]);
                break;
            default:
                break;
        }
    }

    getSquares() {
        const n = this.length;
        let squares = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const square = {
                    row: j,
                    column: i,
                    xMin: this.step * i,
                    xMax: this.step * (i + 1),
                    yMin: this.step * j,
                    yMax: this.step * (j + 1),
                    midPoint: [(this.step * i + this.step * (i + 1)) / 2, (this.step * j + this.step * (j + 1)) / 2]
                };
                squares.push(square);
            }
        }
        return squares;
    }

    getSquare(i, j) {
        return this.squares.find(square => (square.row === i) && (square.column === j));
    }

    fillSquare(square, fillStyle = 'black') {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(square.xMin, square.yMin, this.step, this.step);
    }

    isFilled(square) {
        let imageData = this.ctx.getImageData(...square.midPoint, 1, 1).data;
        let [r, g, b, a] = imageData;
        return !(r === 0 && g === 0 && b === 0 && a === 0);
    }

    getFilledSquares() {
        return this.squares.filter(square => this.isFilled(square));
    }

    clearSquare(row, col) {
        let square = this.getSquare(row, col);
        this.ctx.clearRect(square.xMin, square.yMin, this.step, this.step);
        // Need to replace the lost lines
        this.addGridLine('x', row);
        this.addGridLine('y', col);
    }
}
