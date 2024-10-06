import Grid from './Grid.js';
import Matrix from './Matrix.js'

const DIMENSIONS = [10,10];

const PI = Math.PI

function range(n) {

    return Array.from( {length:n} ).map( (_,i) => i );
}

function sin(x) {

    return Math.sin(x) + 1 - 1;
}

function cos(x) {

    return Math.cos(x) + 1 - 1;
}

function getBounceHeights(initialHeight) {

    const down = Array.from( {length:initialHeight} ).map( (_,i) => i );
    const up = down.toReversed();

    return [ ...down, ...up ];
}

function getBounceFrames({ matrix = Matrix.map(Matrix.getNullMatrix(10,10), e => 0), dropPos = [0,0] }) {

    const [ x, y  ] = dropPos;

    const heights = getBounceHeights(Matrix.getDimensions(matrix)?.at(1) - dropPos.at(1));

    Matrix.setItem( matrix, dropPos, Matrix.getItem( matrix, dropPos ) ?? 1 );

    return heights.map( height => {
        const nextMatrix = new Matrix( matrix );

        nextMatrix.setItem( [x,y], 0 );
        nextMatrix.setItem( [x, y + height] , 1);

        return nextMatrix.matrix;
    });
}

const g = new Grid({ canvas: document.querySelector('canvas'), dimensions: DIMENSIONS, gridLines: true});
