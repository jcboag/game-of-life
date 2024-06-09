var g = new GameOfLife();

intervalId = null;

const startStopButton = document.querySelector('#startStop');
const rewindButton = document.querySelector('#rewind');
const forwardButton = document.querySelector('#forward');
const resetButton = document.querySelector('#reset')

function startLoop(maxLoop=Infinity) {
    let count = 0;

    const updateState = () => {
        if (count >= maxLoop) {
            stop();
            return;
        }
        g.incrementState(g.statePosition);
        g.grid.generateGrid(g.currentState.aliveCells);
        count++;
    }
    intervalId = setInterval(updateState, 200);
}

function stopLoop() { 
    clearInterval(intervalId);
    intervalId = null;
}

function start() {
    startLoop();
    startStopButton.removeEventListener('click', start);
    startStopButton.addEventListener('click', stop);
    startStopButton.innerText = 'Stop';
}

function stop() {
    stopLoop();
    startStopButton.removeEventListener('click', stop);
    startStopButton.addEventListener('click', start);
    startStopButton.innerText = 'Start';
}

function loopInProgress() {
    return Number.isInteger(intervalId);
}

const toggleStart = _ => {
    if (loopInProgress()) {
        stop();
    } else {
        start();
    }
}

const rewind = _ => {
    if (loopInProgress()) {
        stop(); 
        return;
    }
    try {
        g.statePosition--;
    } catch {
        g.statePosition = 0;
    }
}

const forward = _ => {
    if (loopInProgress()) { 
        stop(); 
        return; 
    }
    try {
        g.statePosition++;
    } catch {
        g.statePosition = g._states.length-1;
    }
}

const keyMap = {
    ArrowLeft: rewind,
    ArrowRight: forward,
    Space: toggleStart,
}

const handleKeyDown = e => {
    let action = keyMap[e.code];
    if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
    }
}

const reset = _ => {
    stop();
    g = new GameOfLife();
}

document.addEventListener('keydown', handleKeyDown);

startStopButton.onclick = toggleStart;
rewindButton.onclick = rewind;
forwardButton.onclick = forward;
resetButton.onclick = reset;
