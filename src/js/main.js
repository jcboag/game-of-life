var g = new GameOfLife();

const startStopButton = document.querySelector('#startStop');
const rewindButton = document.querySelector('#rewind');
const forwardButton = document.querySelector('#forward');
const resetButton = document.querySelector('#reset')

const start = e => {
    e.stopPropagation();
    g.start();
    startStopButton.removeEventListener('click', start);
    startStopButton.addEventListener('click', stop);
    startStopButton.innerText = 'Stop';
}

const stop = e => {
    e.stopPropagation();
    g.stop();
    startStopButton.removeEventListener('click', stop);
    startStopButton.addEventListener('click', start);
    console.log(startStopButton);
    startStopButton.innerText = 'Start';
}

const handleKeyDown = e => {
    switch(e.code) {
        case 'ArrowLeft': rewindButton.click(); break;
        case 'ArrowRight': forwardButton.click(); break;
        case 'Space': startStopButton.click(); break;
        default: break;
    }
}

const rewind = e => {
    e.preventDefault();
    e.stopPropagation();
    try {
        g.statePosition--;
    } catch {
        g.statePosition = 0;
    }
}

const forward = e => {
    e.preventDefault();
    e.stopPropagation();
    try {
        g.statePosition++;
    } catch {
        g.statePosition = g._states.length-1;
    }
}

const reset = _ => {
    g = new GameOfLife();
}


document.addEventListener('keydown', handleKeyDown);

startStopButton.addEventListener('click', start);

rewindButton.onclick = rewind;
forwardButton.onclick = forward;
resetButton.onclick = reset;

