Playback = {
    init() {
        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        this.resetButton = document.querySelector('#reset');
        this.speedSlider = document.getElementById('speed');


        this.toggleStart = this.toggleStart.bind(this);
        this.rewind = this.rewind.bind(this);
        this.forward = this.forward.bind(this);
        this.reset = this.reset.bind(this);

        this.startStopButton.onclick = this.toggleStart;
        this.rewindButton.onclick = this.rewind;
        this.forwardButton.onclick = this.forward;
        this.resetButton.onclick = this.reset;

        this.speedSlider.onchange = _ => this.setSpeed.bind(this)((this.speedSlider.value));
        this.setSpeed(g.speed);



        g.canvas.addEventListener('click',this.toggleStart);

        this.buttons = ['startStopButton', 'rewindButton', 'forwardButton', 'resetButton', ];
    },
    disable(except=[]) {
        const buttonsToDisable = this.buttons.filter( button => !except.includes(button));
        console.log(`disabling playback on ${buttonsToDisable}`)
        buttonsToDisable.forEach( button => { this[button].disabled = true });
        g.canvas.removeEventListener('click', this.toggleStart);

    },
    enable(except=[]) {
        const buttonsToEnable = this.buttons.filter( button => !except.includes(button));
        console.log(`enabling playback on ${buttonsToEnable}`);
        buttonsToEnable.forEach( button => { this[button].disabled = false });
        g.canvas.removeEventListener('click', this.toggleStart);
        g.canvas.addEventListener('click', this.toggleStart);
    },
    toggleStart() {
        if (PageState.currentState === 'playback') {
            if (g.playing) {
                g.stop();
                this.startStopButton.innerText = 'Start';
            } else {
                g.start();
                this.startStopButton.innerText = 'Pause';
            }
        }
    },
    stop() {
        g.stop();
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
