

//logic/Colorizer.js

import Matrix from './Matrix';

export default class Colorizer {
    static colors = {
        white: '#ffffff',
        black: '#000000'
    }

    static rgbaArrayToString(array) {
        return `rgba(${[array.join(',')]})`
    }
    static monochrome = (matrix,invert=false) => Matrix.map( invert ? Matrix.map(matrix, a => !a) : matrix, a => a ? this.colors.black: this.colors.white )
}


//logic/Editor.js

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


//logic/GameOfLife.js

import Grid  from './Grid';
import Colorizer from './Colorizer';
import Matrix from './Matrix';

// Matrix with only ones and zeros
class GameOfLifeMatrix extends Matrix {
    static convert(matrix) {
        matrix = matrix instanceof Matrix ? matrix.matrix : matrix;
        return Matrix.map(matrix , a => a ? 1 : 0 );
    }
    static randomInitialState(size) {
        return new Matrix(Matrix.getNullMatrix(size, size)).map(() => Math.random() > 0.5 ? 1 : 0);
    }
    constructor(state = null) {
        if (Number.isInteger(state)) state = GameOfLifeMatrix.randomInitialState(state).matrix;

        // Ensure the matrix is a "game of life " matrix
        state =  GameOfLifeMatrix.convert( state instanceof Matrix ? state.matrix : state );

        if (!Matrix.isMatrixLike(state)) throw Error("Invalid input");

        super(state);
        // A cell dies if it has more neighbors than overPopNumber or 
        // less neighbors than underPopNumber
        this.overPopNumber = 3;
        this.underPopNumber = 2;
    }

    get aliveCells() {
        let alive = [];
        for (let j=0;j<this.matrix.length;j++) {
            for (let i=0;i<this.matrix[0].length;i++) {
                if ( this.isAlive([i,j]) ) {
                    alive.push([i,j]);
                }
            }
        }
        return alive;
    }

    isAlive(cell) {
        return this.getItem(cell) === 1;
    }

    isAliveNextState(cell) {
        const isAlive = this.isAlive(cell);
        const aliveNeighbors = this.getAliveNeighbors(cell).length;
        return isAlive ? [this.underPopNumber, this.overPopNumber].includes(aliveNeighbors) : aliveNeighbors === this.overPopNumber;
    }

    getAliveNeighbors(cell) {
        return this.adjacentIndices(cell).filter(idx => this.isAlive(idx));
    }

    get nextState() {
        return new GameOfLifeMatrix(this.map((_, cell) => this.isAliveNextState(cell) ? 1 : 0));
    }
}

class StateManager {
    #statePosition = 0
    constructor(initialState) {
        // Objects input into the`#states` are assumed to have `nextState` methods
        this.states = [ initialState ];
    }

    get statePosition() {
        return this.#statePosition;
    }

    set statePosition(n) {
        if ( n >= 0 && n <= this.states.length) this.#statePosition = n;
    }

    get currentState()  {
        return this.states[ this.statePosition ];
    }

    addState(state) {
        this.states.push(state);
    }

    nextState() {
        if ( this.statePosition === (this.states.length-1)) {
            this.addState( this.currentState.nextState );
        }
        this.statePosition++;
    }

    previousState() {
        if ( this.statePosition > 0 ) {
            this.statePosition--;
        }
    }


}

// Handles the processing of playback on the `grid`
class GameOfLife {

    static addGlider(stateMatrix, [i,j])  {
        const GLIDER = [ [0,1,0],[0,0,1],[1,1,1] ];
        Matrix.setItem( stateMatrix, [i,j],  GLIDER  );
    }

    static random(size) {
        return GameOfLifeMatrix.randomInitialState(size)?.matrix;
    }

    static appname = 'gameoflife';

    #speed = 10;
    constructor( {initialState = 10 , canvas, speed, gridLines} = {} ) {
        initialState = Number.isInteger(initialState) ? GameOfLife.random(initialState) : initialState;
        this.canvas = canvas;
        this.stateManager = new StateManager( new GameOfLifeMatrix(initialState) );
        this.speed = speed;
        this.intervalId = null;
        this.initGrid(gridLines);

    }

    get appname() {
        return GameOfLife.appname;
    }

    get dimensions() {
        return [this.grid.rows, this.grid.columns]
    }

    initGrid(gridLines) {
        this.grid = new Grid( { canvas: this.canvas,  dimensions: this.stateManager.currentState.dimensions, gridLines, initialState: this.colorizedMatrix} );
    }

    get playing() {
        return Number.isInteger(this.intervalId);
    }

    set playing(bool) {
        if ( bool && !this.playing) {
            this.start();
        } else if ( !bool && this.playing ) {
            this.stop();
        }
    }

    get updateInterval() {
        return 1000 / this.speed 
    }

    get speed() {
        return this.#speed;
    }

    set speed(updatesPerSecond) {
        if (updatesPerSecond <= 0) throw Error("Speed must be positive");
        this.#speed = updatesPerSecond;
        if (this.playing) {
            this.stop();
            this.start();
        }

    }

    // Display the current state of the game on the grid
    render() {
        this.grid.render(this.colorizedMatrix);
    }

    get colorizedMatrix() {
        return Colorizer.monochrome(this.stateManager.currentState.matrix);
    }

    set gridLines(bool) {
        this.grid.gridLines = bool;
        this.render();
    }

    get gridLines() {
        return this.grid.gridLines
    }


    get currentState() {
        return this.stateManager.currentState.matrix;
    }

    goToState(n) {
        this.stateManager.statePosition = n;
        this.render();
    }

    nextState() {
        this.stateManager.nextState();
        this.render();
    }

    previousState() {
        this.stateManager.previousState();
        this.render();
    }

    reset() {
        this.goToState(0);
    }

    start() {
        this.intervalId = setInterval(() => {
            this.nextState();
        }, this.updateInterval); 
    }

    stop() {
        if (!this.playing) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    toggleStartStop() {
        if (this.playing) {
            this.stop();
        } else {
            this.start();
        }
    }

    get matrix() {
        return this.stateManager?.currentState?.matrix;
    }

    cleanup() {
        this.stop();
    }

}



export default GameOfLife;


//logic/Grid.js

import Matrix from './Matrix';

// The `GridEngine` is responsible for the lower level details of the grid,
// While the `Grid` itself only deals with `squares`.

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


//logic/Matrix.js

class Matrix {
    // An mxn "Matrix" is an array of length n where every entry is an array of length m.
    static isMatrixLike(object) {
        try {
            return object?.every( el => typeof el === 'number' ) || (Array.isArray(object) && object.length >= 0 && object.every(row => Array.isArray(row) && row.length === object[0].length));
        } catch { // Object is a non-number without an every property
            return false;
        }
    }

    // Returns all adjacent indices (at  the sides and the diagonals )
    // within the infiinite-dimension matrix
    static adjacentIndices([i, j]) {
        const indices = [];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di !== 0 || dj !== 0) indices.push([i + di, j + dj]);
            }
        }
        return indices;
    }

    static isInMatrix(matrix, [i, j]) {
        return i >= 0 && j >= 0 && j < matrix.length && i < matrix[0].length;
    }

    static forEach(matrix, callback) {
        matrix.forEach((row, j) => row.forEach((item, i) => callback(item, [i, j])));
    }

    static map(matrix, callback) {
        return matrix.map((row, j) => row.map((item, i) => callback(item, [i, j])));
    }

    static getNullMatrix(m, n) {
        return Array.from({ length: n }, () => Array(m).fill(null));
    }

    static setItem(matrix, [i, j], value) {
        matrix[j][i] = value;
    }

    static getItem(matrix, [i, j]) {
        return matrix[j]?.[i];
    }

    static transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    static getDimensions(matrix) {
        return [ matrix[0]?.length || 1, matrix.length ];
    }

    // Current implementation will fail if values contain functions
    static clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static isMatrix(object) {
        return object instanceof Matrix;
    }
    // Returns if two matrices are equal
    static areEqual(A,B) {
        return JSON.stringify(A) === JSON.stringify(B);
    }

    constructor(arr) {
        if (!Matrix.isMatrixLike(arr)) throw new Error('Invalid matrix');
        this.matrix = Matrix.clone(arr);
    }

    // Two matrices are equal when all of their entries are the same
    equals(A) {
        if (!Matrix.isMatrix(A)) throw Error("Must be of type `Matrix`");
        return Matrix.areEqual(this.matrix, A.matrix);
    }

    get transpose() {
        return new Matrix(Matrix.transpose(this.matrix));
    }

    get dimensions() {
        return Matrix.getDimensions(this.matrix);
    }

    adjacentIndices(index) {
        return Matrix.adjacentIndices(index).filter(idx => Matrix.isInMatrix(this.matrix, idx));
    }

    setItem(index, value) {
        Matrix.setItem(this.matrix, index, value);
    }

    getItem(index) {
        return Matrix.getItem(this.matrix, index);
    }

    map(callback) {
        return new Matrix(Matrix.map(this.matrix, callback));
    }

    forEach(callback) {
        Matrix.forEach(this.matrix, callback);
    }

    toString() {
        return this.matrix.map(row => row.join(' ')).join('
');
    }
}

export default Matrix;


//components/AppSelector.js

import React, { useContext } from 'react';
import { AppContext } from '../AppContext';

function AppSelector() {
    const { CONSTANTS, state: { app}, changeApp } = useContext(AppContext);
    const apps = CONSTANTS.APPS_MAP;

    return (
        <div id="appSelect">
            <select value={app} onChange={e => changeApp(e.target.value)}>
                {Array.from(apps.keys()).map(appName => (
                    <option key={appName} value={appName}>
                        {apps.get(appName)}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default AppSelector;


//components/Editor.js

import React, { useRef, useState, useEffect, useContext } from 'react';
import Grid from '../logic/Grid';
import Matrix from '../logic/Matrix';
import Colorizer from '../logic/Colorizer';
import { AppContext } from '../AppContext';
import Playback from '../components/Playback';

function getColorizedMatrix(matrix) {
    return Colorizer.monochrome(matrix);
}

function Editor() {
    const { state: { gridLines, dimensions, height, width, stateMatrix, playback } } = useContext(AppContext);
    const [dragging, setDragging] = useState(false);
    const gridRef = useRef(null);
    const activeValue = useRef(null);
    const canvasRef = useRef(null);

    const handleInputMove = (source) => {
        const square = gridRef.current?.getSquareFromPoint([source.clientX, source.clientY]);
        if (dragging && square) {
            Matrix.setItem(stateMatrix, square, activeValue.current);
            gridRef.current.render(getColorizedMatrix(stateMatrix));
        }
    };
    const handleMouseMove = (e) => handleInputMove(e);
    const handleTouchMove = (e) => {
        e.preventDefault();
        handleInputMove(e.touches[0]);
    };
    const handleInputEnd = () => setDragging(false);
    const handleMouseUp = handleInputEnd;
    const handleTouchEnd = (e) => {
        e.preventDefault();
        handleInputEnd();
    };

    const handleInputStart = (source) => {
        const square = gridRef.current?.getSquareFromPoint([source.clientX, source.clientY]);
        if (square) {
            activeValue.current = !Matrix.getItem(stateMatrix, square);
            Matrix.setItem(stateMatrix, square, activeValue.current);
            gridRef.current.render(getColorizedMatrix(stateMatrix));
            setDragging(true);
        }
    };
    const handleMouseDown = (e) => handleInputStart(e);
    const handleTouchStart = (e) => {
        e.preventDefault();
        handleInputStart(e.touches[0]);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [dragging]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const grid = new Grid({ el: canvas, dimensions, gridLines });
            gridRef.current = grid;
            grid.render(getColorizedMatrix(stateMatrix));
        }
    }, [canvasRef, dimensions, stateMatrix]);

    useEffect(() => {
        gridRef.current.gridLines = gridLines;
        gridRef.current.render(getColorizedMatrix(stateMatrix));
    }, [gridLines]);

    return (
        <div id="editor">
            <canvas ref={canvasRef} width={height} height={width} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} />
            {playback && <Playback toggleStart={playback} />}
        </div>
    );
}

export default Editor;


//components/GameOfLife.js

import React, { useRef, useState, useEffect, useContext } from 'react';
import Playback from '../components/Playback';
import StateManager from '../components/StateManager';
import GameOfLife from '../logic/GameOfLife';
import { AppContext } from '../AppContext';

function GameOfLifeComp() {
    const { state: { gridLines, dimensions, height, width, stateMatrix }, dispatch } = useContext(AppContext);
    const [speed, setSpeed] = useState(10);
    const [playing, setPlaying] = useState(false);

    const canvasRef = useRef(null);
    const gameRef = useRef(null);

    const setNewState = (initialState = GameOfLife.random(dimensions[0])) => {
        const canvas = canvasRef.current;
        if (canvas) {
            if (gameRef.current) {
                gameRef.current.cleanup();
            }
            gameRef.current = new GameOfLife({ canvas, initialState, speed, gridLines });
            gameRef.current.render();
            dispatch({ type: 'SET_STATE_MATRIX', stateMatrix: gameRef.current.currentState } );
        }
    };

    useEffect(() => {
        setNewState(stateMatrix);
    }, [canvasRef, dimensions]);

    useEffect(() => {
        if (gameRef.current) {
            gameRef.current.playing = playing;
        }
    }, [playing]);

    useEffect(() => {
        if (gameRef.current) {
            gameRef.current.speed = speed;
        }
    }, [speed]);

    useEffect(() => {
        if (gameRef.current) {
            gameRef.current.gridLines = gridLines;
        }
    }, [gridLines]);

    const forward = () => {
        setPlaying(false);
        gameRef.current.nextState();
        dispatch({ type: 'SET_STATE_MATRIX', stateMatrix: gameRef.current.currentState });
    };

    const back = () => {
        setPlaying(false);
        gameRef.current.previousState();
        dispatch({ type: 'SET_STATE_MATRIX', stateMatrix: gameRef.current.currentState });
    };

    const reset = () => {
        setPlaying(false);
        gameRef.current.reset();
        dispatch({ type: 'SET_STATE_MATRIX', stateMatrix: gameRef.current.currentState });
    };

    const toggleStart = () => {
        setPlaying(!playing);
        dispatch({ type: 'SET_STATE_MATRIX', stateMatrix: gameRef.current.currentState });
    };

    return (
        <div id="gameoflife">
            <canvas ref={canvasRef} height={height} width={width} onClick={toggleStart} />
            <Playback
                toggleStart={toggleStart}
                forward={forward}
                back={back}
                reset={reset}
                speed={speed}
                setSpeed={setSpeed}
                playing={playing}
                setPlaying={setPlaying}
            />
            <StateManager getRandomState={() => setNewState()} />
        </div>
    );
}

export default GameOfLifeComp;


//components/Playback.js

import React from 'react';

function Playback({ reset, forward, back, playing, speed, setSpeed, toggleStart }) {
    return (
        <div className="playback">
            {toggleStart && <button onClick={toggleStart}>{playing ? 'Stop' : 'Start'}</button>}
            {back && <button id="back" onClick={back}>Back</button>}
            {forward && <button id="forward" onClick={forward}>Forward</button>}
            {reset && <button id="reset" onClick={reset}>Reset</button>}
            {speed && (
                <div id="playbackSpeed">
                    <label htmlFor="speed">Speed</label>
                    <input
                        id="speed"
                        type="range"
                        min="1"
                        max="20"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                    />
                </div>
            )}
        </div>
    );
}

export default Playback;


//components/SettingsControls.js

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';

function SettingsControls() {
    const { state: { gridLines, dimensions }, dispatch } = useContext(AppContext);
    const [tempDimensions, setTempDimensions] = useState(dimensions);

    useEffect(() => {
        setTempDimensions(dimensions);
    }, [dimensions]);

    const handleGridLinesChange = (e) => {
        dispatch({ type: 'SET_GRIDLINES', gridLines: e.target.checked });
    };

    const handleDimensionsChange = (e) => {
        setTempDimensions(e.target.value);
    };

    const handleDimensionsBlur = () => {
        const [height, width] = tempDimensions.split(',').map(dim => parseInt(dim));
        if (height && width) {
            dispatch({ type: 'SET_DIMENSIONS', dimensions: [height, width] });
        }
    };

    return (
        <div id="settingsControls">
            <div id="canvasProperties">
                <div id="gridlines">
                    <label htmlFor="gridlines">Gridlines</label>
                    <input
                        type="checkbox"
                        id="gridlines"
                        checked={gridLines}
                        onChange={handleGridLinesChange}
                    />
                </div>
                <div id="dimensions">
                    <label htmlFor="dimensions">Dimensions: </label>
                    <input
                        type="text"
                        value={tempDimensions}
                        onChange={handleDimensionsChange}
                        onBlur={handleDimensionsBlur}
                    />
                </div>
            </div>
        </div>
    );
}

export default SettingsControls;


//components/StateManager.js

import React from 'react';

function StateManager({ getRandomState, customizeState }) {
    return (
        <div id="stateControl">
            {getRandomState && <button id="randomState" onClick={getRandomState}>Random State</button>}
            {customizeState && <button id="customizeState" onClick={customizeState}>Edit Current State</button>}
        </div>
    );
}

export default StateManager;


//AppContext.js

import React, { createContext, useReducer, useCallback, useRef } from 'react';
import { CONSTANTS } from './constants';
import Matrix from './logic/Matrix';

const AppContext = createContext();

const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { GRIDLINES, DIMENSIONS, CANVAS_HEIGHT, CANVAS_WIDTH } } = CONSTANTS.DEFAULTS;

const initialAppState = {
    app: GAME_OF_LIFE,
    gridLines: GRIDLINES,
    dimensions: DIMENSIONS,
    height: CANVAS_HEIGHT,
    width: CANVAS_WIDTH,
    stateMatrix: Matrix.getNullMatrix(...DIMENSIONS),
    states: [],
};

function appStateReducer(state, action) {
    switch (action.type) {
        case 'CHANGE_APP':
            return { ...state, app: action.app };
        case 'SET_GRIDLINES':
            return { ...state, gridLines: action.gridLines };
        case 'SET_DIMENSIONS':
            return { ...state, dimensions: action.dimensions };
        case 'SET_HEIGHT':
            return { ...state, height: action.height };
        case 'SET_WIDTH':
            return { ...state, width: action.width };
        case 'SET_STATE_MATRIX':
            // Save past states
            state.states.push(state.stateMatrix);
            return { ...state, stateMatrix: action.stateMatrix };
        default:
            return state;
    }
}

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, initialAppState);
    const lastApp = useRef(null);

    const changeApp = useCallback((nextApp) => {
        lastApp.current = state.app;
        dispatch({ type: 'CHANGE_APP', app: nextApp });
    }, [state.app]);

    const value = {
        state,
        dispatch,
        changeApp,
        CONSTANTS,
        EDITOR,
        GAME_OF_LIFE,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };


//App.js

import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import Editor from './components/Editor';
import GameOfLifeComp from './components/GameOfLife';
import AppSelector from './components/AppSelector';
import SettingsControls from './components/SettingsControls';

function App() {
    const {
        CONSTANTS, 
        GAME_OF_LIFE, 
        EDITOR, 
        changeApp, 
        state : { app }
    } = useContext(AppContext);

    return (
        <div className="App">
            <AppSelector app={app} apps={CONSTANTS.APPS_MAP} setApp={changeApp} />
            {app === EDITOR ? <Editor /> : <GameOfLifeComp />}
            <SettingsControls />
        </div>
    );
}

export default App;


//constants.js

export const CONSTANTS = {

    // Keys
    APPS : {
        GAME_OF_LIFE: 'gameoflife',
        EDITOR: 'editor',
    },

    // Key associate with human-readable name
    APPS_MAP : new Map([
        ['gameoflife', 'Game Of Life'],
        ['editor', 'Editor'],
    ]),

    DEFAULTS : {
        GLOBAL: {
            SPEED : 10,
            DIMENSIONS : [ 100, 100 ],
            GRIDLINES : true,
            CANVAS_HEIGHT: 600,
            CANVAS_WIDTH: 600,
        },
    }
}


//AppContext.js

import React, { createContext, useReducer, useCallback, useRef } from 'react';
import { CONSTANTS } from './constants';
import Matrix from './logic/Matrix';

const AppContext = createContext();

const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { GRIDLINES, DIMENSIONS, CANVAS_HEIGHT, CANVAS_WIDTH } } = CONSTANTS.DEFAULTS;

const initialAppState = {
    app: GAME_OF_LIFE,
    gridLines: GRIDLINES,
    dimensions: DIMENSIONS,
    height: CANVAS_HEIGHT,
    width: CANVAS_WIDTH,
    stateMatrix: Matrix.getNullMatrix(...DIMENSIONS),
    states: [],
};

function appStateReducer(state, action) {
    switch (action.type) {
        case 'CHANGE_APP':
            return { ...state, app: action.app };
        case 'SET_GRIDLINES':
            return { ...state, gridLines: action.gridLines };
        case 'SET_DIMENSIONS':
            return { ...state, dimensions: action.dimensions };
        case 'SET_HEIGHT':
            return { ...state, height: action.height };
        case 'SET_WIDTH':
            return { ...state, width: action.width };
        case 'SET_STATE_MATRIX':
            // Save past states
            state.states.push(state.stateMatrix);
            return { ...state, stateMatrix: action.stateMatrix };
        default:
            return state;
    }
}

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, initialAppState);
    const lastApp = useRef(null);

    const changeApp = useCallback((nextApp) => {
        lastApp.current = state.app;
        dispatch({ type: 'CHANGE_APP', app: nextApp });
    }, [state.app]);

    const value = {
        state,
        dispatch,
        changeApp,
        CONSTANTS,
        EDITOR,
        GAME_OF_LIFE,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };


//App.js

import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import Editor from './components/Editor';
import GameOfLifeComp from './components/GameOfLife';
import AppSelector from './components/AppSelector';
import SettingsControls from './components/SettingsControls';

function App() {
    const {
        CONSTANTS, 
        GAME_OF_LIFE, 
        EDITOR, 
        changeApp, 
        state : { app }
    } = useContext(AppContext);

    return (
        <div className="App">
            <AppSelector app={app} apps={CONSTANTS.APPS_MAP} setApp={changeApp} />
            {app === EDITOR ? <Editor /> : <GameOfLifeComp />}
            <SettingsControls />
        </div>
    );
}

export default App;


//constants.js

export const CONSTANTS = {

    // Keys
    APPS : {
        GAME_OF_LIFE: 'gameoflife',
        EDITOR: 'editor',
    },

    // Key associate with human-readable name
    APPS_MAP : new Map([
        ['gameoflife', 'Game Of Life'],
        ['editor', 'Editor'],
    ]),

    DEFAULTS : {
        GLOBAL: {
            SPEED : 10,
            DIMENSIONS : [ 100, 100 ],
            GRIDLINES : true,
            CANVAS_HEIGHT: 600,
            CANVAS_WIDTH: 600,
        },
    }
}


//AppContext.js

import React, { createContext, useReducer, useCallback, useRef } from 'react';
import { CONSTANTS } from './constants';
import Matrix from './logic/Matrix';

const AppContext = createContext();

const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { GRIDLINES, DIMENSIONS, CANVAS_HEIGHT, CANVAS_WIDTH } } = CONSTANTS.DEFAULTS;

const initialAppState = {
    app: GAME_OF_LIFE,
    gridLines: GRIDLINES,
    dimensions: DIMENSIONS,
    height: CANVAS_HEIGHT,
    width: CANVAS_WIDTH,
    stateMatrix: Matrix.getNullMatrix(...DIMENSIONS),
    states: [],
};

function appStateReducer(state, action) {
    switch (action.type) {
        case 'CHANGE_APP':
            return { ...state, app: action.app };
        case 'SET_GRIDLINES':
            return { ...state, gridLines: action.gridLines };
        case 'SET_DIMENSIONS':
            return { ...state, dimensions: action.dimensions };
        case 'SET_HEIGHT':
            return { ...state, height: action.height };
        case 'SET_WIDTH':
            return { ...state, width: action.width };
        case 'SET_STATE_MATRIX':
            // Save past states
            state.states.push(state.stateMatrix);
            return { ...state, stateMatrix: action.stateMatrix };
        default:
            return state;
    }
}

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, initialAppState);
    const lastApp = useRef(null);

    const changeApp = useCallback((nextApp) => {
        lastApp.current = state.app;
        dispatch({ type: 'CHANGE_APP', app: nextApp });
    }, [state.app]);

    const value = {
        state,
        dispatch,
        changeApp,
        CONSTANTS,
        EDITOR,
        GAME_OF_LIFE,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };


//App.js

import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import Editor from './components/Editor';
import GameOfLifeComp from './components/GameOfLife';
import AppSelector from './components/AppSelector';
import SettingsControls from './components/SettingsControls';

function App() {
    const {
        CONSTANTS, 
        GAME_OF_LIFE, 
        EDITOR, 
        changeApp, 
        state : { app }
    } = useContext(AppContext);

    return (
        <div className="App">
            <AppSelector app={app} apps={CONSTANTS.APPS_MAP} setApp={changeApp} />
            {app === EDITOR ? <Editor /> : <GameOfLifeComp />}
            <SettingsControls />
        </div>
    );
}

export default App;


//constants.js

export const CONSTANTS = {

    // Keys
    APPS : {
        GAME_OF_LIFE: 'gameoflife',
        EDITOR: 'editor',
    },

    // Key associate with human-readable name
    APPS_MAP : new Map([
        ['gameoflife', 'Game Of Life'],
        ['editor', 'Editor'],
    ]),

    DEFAULTS : {
        GLOBAL: {
            SPEED : 10,
            DIMENSIONS : [ 100, 100 ],
            GRIDLINES : true,
            CANVAS_HEIGHT: 600,
            CANVAS_WIDTH: 600,
        },
    }
}
