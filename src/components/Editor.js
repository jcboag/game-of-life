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
