

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
