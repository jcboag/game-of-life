import React, { useContext, useEffect} from 'react';
import Editor from './components/Editor';
import GameOfLifeComp from './components/GameOfLife';
import AppSelector from './components/AppSelector';
import SettingsControls from './components/SettingsControls';
import { AppContext } from './AppContext';


function App() {
    const {
        app,
        setApp,
        setDimensions,
        CONSTANTS,
        GAME_OF_LIFE,
        EDITOR,
    } = useContext(AppContext);

    return (
        <div className="App">
            <AppSelector app={app} apps={CONSTANTS.APPS_MAP} setApp={setApp} />
            { 
                (app === EDITOR && <Editor/>) ||
                (app === GAME_OF_LIFE && <GameOfLifeComp setDimensions={setDimensions}/>)
            }
            <SettingsControls />
        </div>
    );
}

export default App;
