class KeyboardShortcuts  {
    #enabled = false;
    static getDefaultKeyMap = _ => ({
        ArrowLeft: playback.rewind,
        ArrowRight:playback.forward,
        ArrowUp: playback.reset,
        Space:  playback.toggleStart,
    });

    get enabled() {
        return this.#enabled
    }

    constructor(keyMap) {
        this.keyMap = keyMap || KeyboardShortcuts.getDefaultKeyMap();
    }

    set enabled(enabled) {
        const method = enabled ? 'addEventListener' : 'removeEventListener';         
        document[method]('keydown', this.handleKeyDown)
        this.#enabled = enabled;
    }

    onStateChange(state) {
        this.enabled = state === 'playback' ? true : false;
    }

    handleKeyDown = e => {
        const keyMap = this.keyMap;
        let action = keyMap[e.code.replace(/Key|Digit/,'')];
        if (action) {
            e.preventDefault();
            e.stopPropagation();
            action();
        }
    }
}
