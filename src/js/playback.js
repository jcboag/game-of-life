const Playback = {
    init(speed=DEFAULT_SPEED) {
        this.intervalId = null;

        this.submitStateButton = document.getElementById('startSubmit');

        this.startStopButton = document.querySelector('#startStop');
        this.rewindButton = document.querySelector('#rewind');
        this.forwardButton = document.querySelector('#forward');
        this.resetButton = document.querySelector('#reset');

        this.startStopButton.onclick = this.toggleStart.bind(this);
        this.rewindButton.onclick = this.rewind.bind(this);
        this.forwardButton.onclick = this.forward.bind(this);
        this.resetButton.onclick = this.reset.bind(this);
        
        this.buttons = ['startStopButton', 'rewindButton', 'forwardButton', 'resetButton', ];

        this.setSpeed(speed);
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
    },
    enable(except=[]) {
        const buttonsToEnable = this.buttons.filter( button => !except.includes(button));
        console.log(`enabling playback on ${buttonsToEnable}`);
        buttonsToEnable.forEach( button => { this[button].disabled = false });
    },
    startLoop() {
        if (!this.loopInProgress()) {
            const updateState = _ => nextState(g);
            const timeBetweenUpdates = 1000 / this.speed
            this.intervalId = setInterval(updateState, timeBetweenUpdates);
        }
    },
    stopLoop() {
        if (this.loopInProgress()) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    start() {
        if (!g) {
            InitialStateEditor.random();
        } 
        this.startLoop();
        this.startStopButton.removeEventListener('click', this.start);
        this.startStopButton.addEventListener('click', this.stop);
        this.startStopButton.innerText = 'Stop';
        
    },
    stop() {
        this.stopLoop();
        this.startStopButton.removeEventListener('click', this.stop);
        this.startStopButton.addEventListener('click', this.start);
        this.startStopButton.innerText = 'Start';
    },
    loopInProgress() {
        return this.intervalId !== null;
    },
    toggleStart() {
        if (this.loopInProgress()) this.stop();
        else this.start();
    },
    rewind() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            previousState(g);
        } catch {
            setStatePosition(0);
        }
    },
    forward() {
        if (this.loopInProgress()) {
            this.stop();
            return;
        }
        try {
            nextState(g);
        } catch {
            previousState(g);
        }
    },
    reset() {
        if (this.loopInProgress()) this.stop();
        setStatePosition(g,0);
    },
    // relative to default
    setSpeed(speed) {
        this.speed = speed;
        if (this.loopInProgress()) {
            this.stopLoop();
            this.startLoop();
        }
    },
};
