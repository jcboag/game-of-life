import React, { useRef, useState, useEffect, useContext } from 'react';
import Playback from '../components/Playback';
import StateManager from '../components/StateManager';
import GameOfLife from '../logic/GameOfLife';
import { AppContext } from '../AppContext';

function GameOfLifeComp() {
    const { gridLines, dimensions, height, width } = useContext(AppContext);
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const [speed, setSpeed] = useState(10);
    const [playing, setPlaying] = useState(null);

    const setNewState = (initialState) => {

        initialState ??=  GameOfLife.random(dimensions[0]);

        const canvas = canvasRef.current;
        if (canvas) {
            if (gameRef.current) {
                gameRef.current.cleanup();
            }
            gameRef.current = new GameOfLife({ canvas, initialState, speed, gridLines });
            gameRef.current.render();
        }
    };

    useEffect(() => {
        setNewState();
    }, [gameRef, canvasRef, dimensions ]);

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
    };

    const back = () => {
        setPlaying(false);
        gameRef.current.previousState();
    };

    const reset = () => {
        setPlaying(false);
        gameRef.current.reset();
    };

    const toggleStart = () => {
        setPlaying(!playing);
    };

    return (
        <div id="gameoflife">
            <canvas ref={canvasRef} height={`${height}`} width={`${width}`} onClick={toggleStart} />
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
            <StateManager getRandomState={ () => setNewState() } />
        </div>
    );
}

export default GameOfLifeComp;
