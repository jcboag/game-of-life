import GameOfLife from '../logic/GameOfLife';
import Editor from '../logic/Editor';

import {CONSTANTS} from '../constants.js';

const { EDITOR, GAME_OF_LIFE } = CONSTANTS.APPS;

function StateManager( { app, setApp, setCustomState, appInstanceRef, createState, modifyState , dimensions} ) {

    const createRandomState = () => {
        const game = GameOfLife.random(dimensions[0]);
        createState(game);
    }

    const newState = () => {

        if ( app === EDITOR ) {

            appInstanceRef.current.clear();
        }

        else {

            setCustomState(0);

        }


    }

    return (
        <div id="stateControl">
            <button id="randomState" onClick={ () => createRandomState() }>Random State</button>
            <button id="customState" onClick={ () => newState() }>New Custom State</button>
            <button id="modifyState" onClick={ () => modifyState() }>Edit Current State</button>
        </div>
    );
}

export default StateManager;
