import React, { useState, useRef, useEffect } from 'react';
import Editor from './components/Editor';
import GameOfLifeComp from './components/GameOfLife';
import AppSelector from './components/AppSelector';
import SettingsControls from './components/SettingsControls';

import { CONSTANTS } from './constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { SPEED, GRIDLINES, DIMENSIONS } } = CONSTANTS.DEFAULTS;

function App() {
    const [gridLines, setGridLines] = useState( GRIDLINES );
    const [dimensions, setDimensions] = useState( DIMENSIONS );

    const [customState, setCustomState ] = useState( null );
    const [customizableState, setCustomizableState] = useState( null );
    const [height, setHeight] = useState( 700 );
    const [width, setWidth] = useState( 700 );

    const [app, _setApp] = useState(GAME_OF_LIFE);
    const lastApp = useRef(null);

    const appStateRef = useRef(null);
    const previousAppState = useRef(null);

    const playOnStartRef = useRef(false);

    const setApp = (nextApp) => {
        previousAppState.current = appStateRef.current;
        lastApp.current = app;
        _setApp(nextApp);
    }

    useEffect( () => {
        if ( customizableState ) {
            previousAppState.current = customizableState;
            setApp( EDITOR );
        }
        setCustomizableState(null);
    }, [ customizableState ]);

    function customizeState( state ) {
        setCustomizableState( state );
    }

    return (
        <div className="App">

            <AppSelector app={app} 
                apps={CONSTANTS.APPS_MAP} 
                setApp={setApp}/>

            {app === EDITOR && <Editor 
                appStateRef={appStateRef} 
                previousState={previousAppState.current} 
                height={height} 
                width={width}  
                state={customState} 
                gridLines={gridLines} 
                setGridLines={setGridLines}
                dimensions={dimensions}
                setDimensions={setDimensions}

                playback={() => {

                    if ( lastApp.current === GAME_OF_LIFE)  {
                        playOnStartRef.current = true;
                        setApp( GAME_OF_LIFE );
                        
                    }

                } }
                />
            }

            {app === GAME_OF_LIFE && <GameOfLifeComp 
                editState={customizeState}
                previousState={previousAppState.current} 
                appStateRef={appStateRef} 
                playOnStartRef={playOnStartRef}
                height={height} 
                width={width}  
                state={customState} 
                gridLines={gridLines} 
                setGridLines={setGridLines}
                dimensions={dimensions}
                setDimensions={setDimensions}
                    />
            }

            <SettingsControls gridLines={gridLines} setGridLines={setGridLines} dimensions={dimensions} setDimensions={setDimensions} />

        </div>
    )
}

export default App;
