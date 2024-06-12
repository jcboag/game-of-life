const DEFAULT_UPDATE_RATE = 75;
const SELECTED_SQUARE_COLOR = 'red';

var g;

const Playback = {
    init: function() {
        this.intervalId = null;
        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        // TODO Implement Random
        this.randomButton = document.querySelector('#random');
        this.resetButton = document.querySelector('#reset');

        this.startStopButton.onclick = this.toggleStart.bind(this);
        this.rewindButton.onclick = this.rewind.bind(this);
        this.forwardButton.onclick = this.forward.bind(this);
        this.randomButton.onclick = this.random.bind(this);
        this.resetButton.onclick = this.reset.bind(this);
    },
    startLoop: function(maxLoop=Infinity,updateRate=DEFAULT_UPDATE_RATE) {
        let count = 0;

        const updateState = () => {
            if (count >= maxLoop) {
                this.stop();
                return;
            }
            g.statePosition++;
            count++;
        };
        this.intervalId = setInterval(updateState, updateRate);
    },
    stopLoop: function() {
        if (this.loopInProgress) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    start: function() {
        this.startLoop();
        this.startStopButton.removeEventListener('click', this.start);
        this.startStopButton.addEventListener('click', this.stop);
        this.startStopButton.innerText = 'Stop';
    },
    stop: function() {
        this.stopLoop();
        this.startStopButton.removeEventListener('click', this.stop);
        this.startStopButton.addEventListener('click', this.start);
        this.startStopButton.innerText = 'Start';
    },
    loopInProgress: function() {
        return this.intervalId !== null;
    },
    toggleStart: function() {
        if (this.loopInProgress()) this.stop();
        else this.start();
    },
    rewind: function() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            g.statePosition--;
        } catch {
            g.statePosition = 0;
        }
    },
    forward: function() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            g.statePosition++;
        } catch {
            g.statePosition--;
        }
    },
    reset: function() {
        if (this.loopInProgress()) this.stop();
        g.statePosition = 0;
    },
    random: function() {
        if (this.loopInProgress()) this.stop();
        g = new GameOfLife()
        g.statePosition = 0;
    }
};

const KeyboardShortcuts = {
    init: function() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    keyMap: {
        ArrowLeft: Playback.rewind.bind(Playback),
        ArrowRight: Playback.forward.bind(Playback),
        ArrowUp: Playback.reset.bind(Playback),
        Space: Playback.toggleStart.bind(Playback),
    },
    handleKeyDown: function(e) {
        let action = this.keyMap[e.code];
        if (action) {
            e.preventDefault();
            e.stopPropagation();
            action();
        }
    }
};

function getInitialState() {
    return new GameOfLifeMatrix();
}


function init() {
    g = new GameOfLife();
    Playback.init();
    KeyboardShortcuts.init();
}

init();
