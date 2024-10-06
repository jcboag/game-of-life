import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import Editor from './components/Editor';
import GameOfLifeComp from './components/GameOfLife';
import AppSelector from './components/AppSelector';
import SettingsControls from './components/SettingsControls';

function App() {
    const {
        CONSTANTS, 
        GAME_OF_LIFE, 
        EDITOR, 
        changeApp, 
        state : { app }
    } = useContext(AppContext);

    return (
        <div className="App">
            <AppSelector app={app} apps={CONSTANTS.APPS_MAP} setApp={changeApp} />
            {app === EDITOR ? <Editor /> : <GameOfLifeComp />}
            <SettingsControls />
        </div>
    );
}

export default App;
