class Playback {
    constructor(app) {
        this.app = app;
        this.startStopButton = document.getElementById('startStop');
        this.rewindButton = document.getElementById('rewind');
        this.forwardButton = document.getElementById('forward');
        this.resetButton = document.getElementById('reset');
        this.speedSlider = document.getElementById('speed');

        this.app = app;
        this.setEventListeners();
        this.enabled = true;
    }

    setEventListeners() {

        if (this.app.appname === 'gameoflife') {

            // Set the value of the button based on game state
            const setStartStopButton = () => { this.startStopButton.innerText = this.app.playing ? 'Stop' : 'Start'; }

            setStartStopButton();

            this.startStopButton.onclick = () => {
                if (!this.enabled) return;
                this.app.toggleStartStop();
                setStartStopButton();
            };

            this.rewindButton.onclick = () => this.enabled && this.app.previousState();
            this.forwardButton.onclick = () => this.enabled && this.app.nextState();
            this.resetButton.onclick = () => this.enabled && this.app.reset();

            this.speedSlider.oninput = e => this.enabled && (this.app.speed = Number(e.target.value));

        } else if ( this.app.appname ===  'editor') {

            this.startStopButton.onclick = () => {
                window.getInitialStateFromEditor({run: true});
            }
        }
    }

    getInitialStateFromEditor() {
    }

    enable() {
        this.enabled = true;
        this.updateUI();
    }

    disable() {
        this.enabled = false;
        this.app.stop(); 
        this.updateUI();
    }

    updateUI() {
        this.startStopButton.disabled = !this.enabled;
        this.rewindButton.disabled = !this.enabled;
        this.forwardButton.disabled = !this.enabled;
        this.resetButton.disabled = !this.enabled;
        this.speedSlider.disabled = !this.enabled;
    }

    cleanup() {
        [ 'startStopButton', 'rewindButton','forwardButton', 'resetButton'].forEach( buttonName => { this[buttonName].onclick  = null; });
    }
}

