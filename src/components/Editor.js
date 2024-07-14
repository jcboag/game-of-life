import React, { useRef, useState, useEffect } from 'react';
import Grid from '../logic/Grid';
import Matrix from '../logic/Matrix';
import Colorizer from '../logic/Colorizer';
import GameOfLife from '../logic/GameOfLife';

// class EditorMatrix extends Matrix {

// }

function Editor({ state, gridLines, dimensions }) {

    const [dragging, setDragging] = useState(false);
    const gridRef = useRef(null);

    const editorMatrix = useRef(null);
    const activeValue = useRef(null);
    const canvasRef = useRef(null);

//    const [color, setColor] = useState('black');

    const handleInputMove = (source) => {
        const square = gridRef.current?.getSquareFromPoint([source.clientX, source.clientY]);
        if (dragging && square) {
            editorMatrix.current.setItem(square, activeValue.current);
            gridRef.current.render(Colorizer.monochrome(editorMatrix.current.matrix));
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
            activeValue.current = !editorMatrix.current.getItem(square);
            editorMatrix.current.setItem(square, activeValue.current);
            gridRef.current.render(Colorizer.monochrome(editorMatrix.current.matrix));
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
            const initialState = state ?? GameOfLife.random(dimensions[0]);
            editorMatrix.current = new Matrix(initialState);
            grid.render(Colorizer.monochrome(editorMatrix.current.matrix));
        }
    }, [canvasRef, dimensions, state]);

    return <canvas ref={canvasRef} width="700" height="700" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} />;
}

export default Editor;
