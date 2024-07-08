import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Playback from './components/Playback';
import StateManager from './components/StateManager';
import SettingsControls from './components/SettingsControls';
import AppSelector from './components/AppSelector'

function App() {

    const APPS = new Map([
        [ 'gameoflife', 'Game Of Life' ],
        [ 'editor', 'Editor' ]
    ]);

    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(10);
    const [gridLines, setGridlines] = useState(true);
    const [dimensions, setDimensions] = useState([100, 100]);

    const [app, setApp] = useState('editor');

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
                apps = { APPS } 
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
