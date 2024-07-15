import { CONSTANTS } from '../constants';

const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;

function Playback({ reset, forward, back, playing, speed, setSpeed, toggleStart }) {

    return (
        <div className="playback">
        {toggleStart && <button onClick={toggleStart}>{playing ? 'Stop' : 'Start'}</button>}
        { back &&    <button id="back" onClick={ back }>Back</button> }
        { forward && <button id="forward" onClick={ forward }>Forward</button> }
        { reset &&    <button id="reset" onClick={ reset }>Reset</button> }
        { speed && (
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

            </div>)}
        </div>
    );
}

export default Playback;
