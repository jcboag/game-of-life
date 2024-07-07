import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Playback from './components/Playback';
import StateManager from './components/StateManager';
import SettingsControls from './components/SettingsControls';

const APP_NAMES = new Map([
    [ 'gameoflife', 'Game Of Life' ],
    [ 'editor', 'Editor' ]
]);

function App() {

    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(10);
    const [gridlines, setGridlines] = useState(true);
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
            <header>{ APP_NAMES.get(app) }</header>
            <Canvas app={app} />
            <Playback
                app={app}
                playing={playing}
                speed={speed}
                setSpeed={updateSpeed}
                toggleStart={toggleStart}
            />
            <StateManager playing={playing} />
            <SettingsControls
                gridLines={gridlines}
                setGridLines={setGridlines}
                dimensions={dimensions}
                setDimensions={updateDimensions}
            />
        </div>
    );
}

export default App;
