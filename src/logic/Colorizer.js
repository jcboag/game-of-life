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
