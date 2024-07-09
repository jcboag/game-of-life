import GameOfLife from '../logic/GameOfLife';

function StateManager( { createState, modifyState , dimensions} ) {

    const createRandomState = () => {
        createState(GameOfLife.random(dimensions[0]));
    }

    return (
        <div id="stateControl">
            <button id="randomState" onClick={ () => createRandomState() }>Random State</button>
            <button id="customState" onClick={ () => createState() }>New Custom State</button>
            <button id="modifyState" onClick={ () => modifyState() }>Edit Current State</button>
        </div>
    );
}

export default StateManager;
