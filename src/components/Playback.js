function Playback({ app, playing, speed, setSpeed, toggleStart }) {
    return (
        <div className="playback">
            <button onClick={toggleStart}>{playing ? 'Stop' : 'Start'}</button>
            <button id="rewind">Back</button>
            <button id="forward">Forward</button>
            <button id="reset">Reset</button>
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
