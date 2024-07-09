import React, { useState, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Playback from './components/Playback';
import StateManager from './components/StateManager';
import SettingsControls from './components/SettingsControls';
import AppSelector from './components/AppSelector';

import GameOfLife from './logic/GameOfLife';

import Editor from './logic/Editor';

import { CONSTANTS } from './constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { SPEED, GRIDLINES, DIMENSIONS } } = CONSTANTS.DEFAULTS;

function App() {
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(SPEED);
    const [gridLines, setGridlines] = useState(GRIDLINES);
    const [dimensions, setDimensions] = useState(DIMENSIONS);
    const [app, setApp] = useState(EDITOR);
    const [instanceTrigger, setInstanceTrigger] = useState(0);
    const [customInitialState, setCustomInitialState] = useState(null);

    const canvasRef = useRef(null);
    const appInstanceRef = useRef(null);

    const createAppInstance = (initialState = null) => {
        const canvas = canvasRef.current;
        const prevInstance = appInstanceRef.current;

        if (prevInstance?.cleanup) prevInstance.cleanup();

        initialState = initialState ?? prevInstance?.matrix;

        if (app === GAME_OF_LIFE) {
            initialState = initialState || dimensions[0];
            appInstanceRef.current = new GameOfLife({ canvas, initialState, speed, gridLines });

        } else if (app === EDITOR) {
            appInstanceRef.current = new Editor({ canvas, dimensions, gridLines, initialState });
        }

        setCustomInitialState(null);
    };

    useEffect(() => {
        createAppInstance(customInitialState);
    }, [app, instanceTrigger]);

    useEffect( () => {
        appInstanceRef.current.playing = playing; 
    },  [ playing ] )

    useEffect( () => {

    }, [ customInitialState ] )


    const toggleStart = app === EDITOR
        ? () => { setPlaying(true); setApp(GAME_OF_LIFE); }
        : () => setPlaying( !playing );

    const updateSpeed = (value) => {
        setSpeed(value);
    };

    const updateDimensions = (rows, cols) => {
        setDimensions([rows, cols]);
    };

    const createNewInstance = (initialState = null) => {
        setCustomInitialState(initialState);
        setInstanceTrigger((prev) => prev + 1);
    };

    const modifyState = () => {
        setApp('editor');
    }


    const nextState = ( 
        app === EDITOR 
        ? () => { 
            console.log( appInstanceRef.current)
            setApp( GAME_OF_LIFE ); 
            console.log( appInstanceRef.current );
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
                playing={ playing }
                createState= { createNewInstance }
                modifyState={ modifyState }
                dimensions={ dimensions }
            />
            <SettingsControls
                gridLines={gridLines}
                setGridLines={setGridlines}
                dimensions={dimensions}
                setDimensions={updateDimensions}
                createNewInstance={createNewInstance}
            />
        </div>
    );
}

export default App;
