import React, { useState, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Playback from './components/Playback';
import StateManager from './components/StateManager';
import SettingsControls from './components/SettingsControls';
import AppSelector from './components/AppSelector';

import Matrix from './logic/Matrix';
import GameOfLife from './logic/GameOfLife';
import Editor from './logic/Editor';

import { CONSTANTS } from './constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { SPEED, GRIDLINES, DIMENSIONS } } = CONSTANTS.DEFAULTS;

function App() {
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(SPEED);
    const [gridLines, setGridLines] = useState(GRIDLINES);
    const [dimensions, setDimensions] = useState(DIMENSIONS);
    const [app, setApp] = useState(EDITOR);

    const [ customInitialState, setCustomInitialState ] = useState(null);

    const canvasRef = useRef(null);
    const appInstanceRef = useRef(null);

    const createAppInstance = (initialState = null) => {
        const canvas = canvasRef.current;
        const prevInstance = appInstanceRef.current;

        if (prevInstance?.cleanup) prevInstance.cleanup();

        initialState ??= prevInstance?.matrix;

        if (app === GAME_OF_LIFE) {
            initialState = initialState || dimensions[0];
            appInstanceRef.current = new GameOfLife({ canvas, initialState, speed, gridLines });

        } else if (app === EDITOR) {
            appInstanceRef.current = new Editor({ canvas, dimensions, gridLines, initialState });
        }

        setCustomInitialState( null );
    };

    useEffect( () => {

        if ( appInstanceRef?.current?.playing ) {
            setPlaying(false);
        }

        createAppInstance();

    }, [app, dimensions] );

    useEffect(() => {
        const [ width, _ ] = dimensions;
        createAppInstance( GameOfLife.random(width) );

    }, [dimensions]);

    useEffect( () => {
        appInstanceRef.current.playing = playing; 
    },  [ playing ] )

    useEffect(() => {
        appInstanceRef.current.gridLines = gridLines;
    });

    useEffect( () => {
        if ( customInitialState ) {
            createAppInstance( ( customInitialState === 0 ) ? Matrix.getNullMatrix( ...dimensions ) : customInitialState );
            setCustomInitialState(null);
        }
    }, [ customInitialState ])



    const toggleStart = app === EDITOR
        ? () => { setPlaying(true); setApp(GAME_OF_LIFE); }
        : () => setPlaying( !playing );

    const updateSpeed = (value) => {
        setSpeed(value);
    };

    const modifyState = () => {
        setApp(EDITOR);
    }


    const nextState = ( 
        app === EDITOR 
        ? () => { 
            setApp( GAME_OF_LIFE ); 
        } 
        : (appInstanceRef?.current.nextState ? () => appInstanceRef?.current.nextState() : () => {})

    );

    const previousState = ( appInstanceRef?.current?.previousState ) ? () => appInstanceRef?.current?.previousState() : () => {};

    const reset = ( appInstanceRef?.current?.reset ) ? () => appInstanceRef?.current?.reset() : () => {};

    return (
        <div className="App">
            <AppSelector
                apps={CONSTANTS.APPS_MAP}
                app={app}
                setApp={setApp}
                dimensions={dimensions}
                gridLines={gridLines}
                speed={speed}
            />
            <Canvas
                canvasRef={canvasRef}
                dimensions={dimensions}
            />
            <Playback
                app={app}
                appInstance={ appInstanceRef.current } 
                playing={playing}
                speed={speed}
                setSpeed={updateSpeed}
                setApp={ setApp }
                toggleStart={toggleStart}
                nextState= { nextState }
                previousState = { previousState }
                reset = { reset }
            />
            <StateManager 
                app={ app }
                appInstanceRef={ appInstanceRef }
                setApp={ setApp }
                setCustomState={ setCustomInitialState }
                playing={ playing }
                createState= { createAppInstance }
                modifyState={ modifyState }
                dimensions={ dimensions }

            />
            <SettingsControls
                gridLines={gridLines}
                setGridLines={setGridLines}
                dimensions={dimensions}
                setDimensions={setDimensions}
            />
        </div>
    );
}

export default App;
