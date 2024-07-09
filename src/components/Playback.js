import { CONSTANTS } from '../constants';

const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;

function Playback({ app, reset, nextState, previousState , playing, speed, setSpeed, toggleStart }) {


    const back = app === GAME_OF_LIFE ? () => previousState() : null;
    const forward = app === GAME_OF_LIFE 
        ? () => nextState()
        : () => {
            nextState();
    }

    return (
        <div className="playback">
            <button onClick={ toggleStart }>{playing ? 'Stop' : 'Start'}</button>
            <button id="rewind" onClick={ back }>Back</button>
            <button id="forward" onClick={ forward }>Forward</button>
            <button id="reset" onClick={ reset }>Reset</button>
            <div id="playbackSpeed">
                <label htmlFor="speed">Speed</label>
                <input
                    id="speed"
                    type="range"
                    min="1"
                    max="20"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                />
            </div>
        </div>
    );
}

export default Playback;
