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
