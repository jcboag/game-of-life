import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Playback from './components/Playback';
import StateManager from './components/StateManager';
import SettingsControls from './components/SettingsControls';
import AppSelector from './components/AppSelector'

import {CONSTANTS} from './constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;

function App() {

    const [playing, setPlaying] = useState(false);

    const [speed, setSpeed] = useState(CONSTANTS.DEFAULTS.GLOBAL.SPEED);
    const [gridLines, setGridlines] = useState(CONSTANTS.DEFAULTS.GLOBAL.GRIDLINES);
    const [dimensions, setDimensions] = useState(CONSTANTS.DEFAULTS.GLOBAL.DIMENSIONS );

    const [app, setApp] = useState(EDITOR);

    const toggleStart = () => {
        setPlaying(!playing);
    };

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
                app={app} 
                dimensions= { dimensions }
                gridLines= { gridLines }
                speed = { speed }
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
