DEFAULT_EDITOR_DIMENSIONS = [70,70];

class Editor {
    #matrix;
    #states = [];
    constructor(canvas=document.querySelector('canvas'),dim=DEFAULT_EDITOR_DIMENSIONS,initialState) {
        PageState.currentState = 'edit';
        // Underlying matrix the grid 'binds' to 
        this.#matrix = Matrix.getNullMatrix(...dim);
        this.grid = new Grid(canvas);
        this.grid.init(dim,true, initialState || undefined);
        this.onMouseDown = this.onMouseDown.bind(this);

        canvas.addEventListener('mousedown', this.onMouseDown);

    }

    get matrix() {
        return JSON.parse(JSON.stringify(this.#matrix));
    }

    setSquare(matrix, [i,j],value) {
        Matrix.setItem(matrix, [i,j], value);
        this.render(matrix);
    }

    onMouseDown(e) {
        // Save current state for persistence
        const currentState = JSON.parse(JSON.stringify(this.#matrix));
        const lastState = this.#states[0];

        if (!Matrix.areEqual(lastState,currentState)) this.#states.push(currentState);
        
        const onCanvasDrag = e => {
            const square = this.grid.squareFromPoint([e.clientX,e.clientY]);
            if (square) {
                this.setSquare(this.#matrix, square, firstValue);
            }
        }

        // Toggle the value fo the first clicked square,
        // which changes all squares to that value upon drag.
        const firstSquare = this.grid.squareFromPoint([e.clientX,e.clientY]);
        const firstValue = !Matrix.getItem(this.#matrix,firstSquare);

        if (firstSquare) {
            this.setSquare(this.#matrix, firstSquare, firstValue);

            document.addEventListener('mousemove', onCanvasDrag );
            document.addEventListener('mouseup', _ => {
                document.removeEventListener('mousemove',onCanvasDrag)
            });
            
        }
    }

    render(matrix) {
        this.grid.render(Colorizer.monochrome(matrix));
    }

    cleanup() {
        canvas.removeEventListener('mousedown');
    }
}
