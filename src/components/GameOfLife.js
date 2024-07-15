import React, { useRef, useState, useEffect } from 'react';
import Playback from '../components/Playback';
import StateManager from '../components/StateManager';
import GameOfLife from '../logic/GameOfLife';

function GameOfLifeComp({
    previousState, 
    appStateRef, 
    state, 
    gridLines, 
    dimensions, 
    height, 
    width, 
    editState, 
    playOnStartRef}) {

    const canvasRef = useRef( null );
    const gameRef = useRef(null);
    const [speed, setSpeed ] = useState( 10 );
    const [playing, setPlaying ] = useState(null);

    function setNewState( { initialState }) {

        const canvas = canvasRef.current;
        if (canvas) {

            if ( gameRef.current ) {
                gameRef.current.cleanup();
            }

            gameRef.current = new GameOfLife({ canvas, initialState, speed ,gridLines});

            appStateRef.current = gameRef.current?.currentState;

            gameRef.current.render();

            setPlaying( () => {
                const play = playOnStartRef.current === true ? true : false;
                playOnStartRef.current = false;
                return play;
            });
        }


    }

    useEffect(() => {
        const initialState = previousState ?? GameOfLife.random( dimensions[0]);
        setNewState( { initialState } );

    }, [gameRef, canvasRef, dimensions, state]);

    useEffect( () => {
        gameRef.current.playing = playing;
    }, [playing] );

    useEffect( () => {
        gameRef.current.speed = speed;
    }, [speed] )


    useEffect( () => {
        gameRef.current.gridLines = gridLines;

    });

    function forward() {
        setPlaying(false);
        gameRef.current.nextState();
    }

    function back() {
        setPlaying(false);
        gameRef.current.previousState();
    }

    function reset() {
        setPlaying(false);
        gameRef.current.reset();
    }

    function toggleStart() {
        setPlaying(!playing);

    }

    function getRandomState() {
        const initialState = GameOfLife.random( dimensions[0] );
        setNewState( { initialState } )
    }

    function customizeState() {

        editState( gameRef.current.currentState );
    }

    return (
        <div id="gameoflife">
            <canvas 
                ref={canvasRef} 
                height={`${height}`} 
                width={`${width}`}
                onClick={toggleStart}
            />

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

            <StateManager 
                customizeState={ customizeState }
                getRandomState={ getRandomState }
            />

        </div>
    )
}

export default GameOfLifeComp;
