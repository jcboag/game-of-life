Playback = {
    init(speed=DEFAULT_SPEED) {
        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        this.resetButton = document.querySelector('#reset');
        this.speedSlider = document.getElementById('speed');

        this.startStopButton.onclick = this.toggleStart.bind(this);
        this.rewindButton.onclick = this.rewind.bind(this);
        this.forwardButton.onclick = this.forward.bind(this);
        this.resetButton.onclick = this.reset.bind(this);

        this.speedSlider.onchange = _ => this.setSpeed.bind(this)((this.speedSlider.value));
        this.setSpeed(speed);

        this.buttons = ['startStopButton', 'rewindButton', 'forwardButton', 'resetButton', ];


        g.canvas.addEventListener('click', this.toggleStart.bind(this));
    },
    stateChangeHandler(e) {
        console.log('Playback, handling state change')
        if (e.detail.state === 'edit') {
            this.disable();
        } else if (e.detail.state === 'playback') {
            this.enable();
        }
    },
    disable(except=[]) {
        const buttonsToDisable = this.buttons.filter( button => !except.includes(button));
        console.log(`disabling playback on ${buttonsToDisable}`)
        buttonsToDisable.forEach( button => { this[button].disabled = true });
        g.canvas.removeEventListener('click', this.toggleStart.bind(this));
    },
    enable(except=[]) {
        const buttonsToEnable = this.buttons.filter( button => !except.includes(button));
        console.log(`enabling playback on ${buttonsToEnable}`);
        buttonsToEnable.forEach( button => { this[button].disabled = false });
        g.canvas.addEventListener('click', this.toggleStart.bind(this));
    },
    toggleStart() {
        if (pageState === 'playback') {
            if (g.playing) {
                g.stop();
                this.startStopButton.innerText = 'Start';
            } else {
                g.start();
                this.startStopButton.innerText = 'Pause';
            }
        }
    },
    rewind() {
        if (g.playing) g.stop();
        g.previousState();
    },
    forward() {
        if (g.playing) g.stop();
        g.nextState();
    },
    reset() {
        g.reset();
    },
    setSpeed(speed) {
        g.speed = speed;
        this.speedSlider.value = speed;
    }
};
