class Matrix {
    // An mxn "Matrix" is an array of length n where every entry is an array of length m.
    static isMatrixLike(object) {
        return object?.every( el => typeof el === 'number' ) || (Array.isArray(object) && object.length >= 0 && object.every(row => Array.isArray(row) && row.length === object[0].length));
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
        return this.matrix.map(row => row.join(' ')).join('\n');
    }
}
