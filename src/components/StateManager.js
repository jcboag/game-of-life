function StateManager( {getRandomState, customizeState} ) {

    return (
        <div id="stateControl">
            <button id="randomState" onClick={ () =>  getRandomState()  }>Random State</button>
            <button id="customizeState" onClick={ () => customizeState()  }>Edit Current State</button>
        </div>
    );
}

export default StateManager;
