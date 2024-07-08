import React, { useState , useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Playback from './components/Playback';
import StateManager from './components/StateManager';
import SettingsControls from './components/SettingsControls';
import AppSelector from './components/AppSelector'

import GameOfLife from './logic/GameOfLife';
import Editor from './logic/Editor';

import {CONSTANTS} from './constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { SPEED, GRIDLINES, DIMENSIONS } } = CONSTANTS.DEFAULTS;

function App() {
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(SPEED);
    const [gridLines, setGridlines] = useState(GRIDLINES);
    const [dimensions, setDimensions] = useState(DIMENSIONS);
    const [app, setApp] = useState(EDITOR);

    const canvasRef = useRef(null);
    const appInstanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const prevInstance = appInstanceRef?.current;

        if (prevInstance?.cleanup)  prevInstance.cleanup();

        let initialState = prevInstance?.matrix;

        if (app === GAME_OF_LIFE) {
            initialState = initialState || dimensions[0];
            appInstanceRef.current = new GameOfLife({ canvas, initialState, speed, gridLines });

            // Begin playback immediately
            if ( playing ) { 
                appInstanceRef.current.toggleStartStop();
                setPlaying(false);
            }

        } else if (app === EDITOR) {
            appInstanceRef.current = new Editor({ canvas, dimensions, gridLines, initialState });
        }

        return () => {
            if (appInstanceRef.current?.cleanup) {
                appInstanceRef.current.cleanup();
            }
        };
    }, [app]);

    const toggleGameStart = () => {
        setPlaying(true);
        const currentInstance = appInstanceRef.current;
        currentInstance.toggleStartStop();
        setPlaying(currentInstance.playing);
    }

    const toggleStart = (
        app === EDITOR  ?  () => { setPlaying(true); setApp(GAME_OF_LIFE); }  : () => toggleGameStart()
    );

    const updateSpeed = (value) => {
        setSpeed(value);
    };

    const updateDimensions = (rows, cols) => {
        setDimensions([rows, cols]);
    };

    return (
        <div className="App">
            <AppSelector 
                apps = { CONSTANTS.APPS_MAP } 
                app = { app }
                setApp = { setApp }
                dimensions= { dimensions }
                gridLines= { gridLines }
                speed = { speed }
            />
            <Canvas 
                canvasRef = { canvasRef }
            />

            <Playback
                app={app}
                playing={playing}
                speed={speed}
                setSpeed={updateSpeed}
                toggleStart={toggleStart}
            />
            <StateManager playing={playing} />
            <SettingsControls
                gridLines={gridLines}
                setGridLines={setGridlines}
                dimensions={dimensions}
                setDimensions={updateDimensions}
            />
        </div>
    );
}

export default App;
