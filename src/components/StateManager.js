import React from 'react';

function StateManager({ getRandomState, customizeState }) {
    return (
        <div id="stateControl">
            {getRandomState && <button id="randomState" onClick={getRandomState}>Random State</button>}
            {customizeState && <button id="customizeState" onClick={customizeState}>Edit Current State</button>}
        </div>
    );
}

export default StateManager;
