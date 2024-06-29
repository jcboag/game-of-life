class Playback {
    constructor(initialSpeed=10) {

        [ 'startStop', 'rewind', 'forward', 'reset' ].forEach( buttonType => {
            this[`${buttonType}Button`] = document.querySelector(`#${buttonType}`);

        });

        this.speedSlider = document.getElementById('speed');
        this.speed = initialSpeed;
    } 

    setHandlers(playback) {
        const method = playback ? 'addEventListener' : 'removeEventListener';

        this.startStopButton.onclick = playback ? _ => this.toggleStart() : null;

        ['rewind', 'forward', 'reset'].forEach(action =>
            this[`${action}Button`].onclick = playback ? _ => this[action]() : null );

        canvas[method]('click', this.toggleStart);
    }

    onStateChange(state) {
        console.log('statechanges');
        switch (state) {
            case 'playback':
                this.setHandlers(true);
                break;
            case 'edit':
                this.setHandlers(false);
                break;
        }
    }

    toggleStart = () => {
        this[ g.playing ? 'stop' : 'start' ]();
        this.startStopButton.innerText = g.playing ? 'Pause' : 'Start';
    }

    start() {
        g.start();
    }

    stop() {
        g.stop();
    }

    forward() {
        if (g.playing) g.stop();
        g.nextState();

    }

    rewind() {
        if (g.playing) g.stop();
        g.previousState();

    }

    reset() {
        g.reset();

    }

    get speed() {
        return g.speed;

    }

    set speed(value) {
        if (g) g.speed = value;
        this.speedSlider.value = value;
    }

}
