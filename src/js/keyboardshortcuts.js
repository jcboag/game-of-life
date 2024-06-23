const KeyboardShortcuts = {
    init() {
        this.enabled = true;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    keyMap: {
        ArrowLeft: Playback.rewind.bind(Playback),
        ArrowRight: Playback.forward.bind(Playback),
        ArrowUp: Playback.reset.bind(Playback),
        Space: Playback.toggleStart.bind(Playback),
    },
    handleKeyDown(e) {
        if (this.enabled) {
            let action = this.keyMap[e.code.replace(/Key|Digit/,'')];
            if (action) {
                e.preventDefault();
                e.stopPropagation();
                action();
            }
        }
    },
    disable() {
        console.log('disabled keybinds')
        if (this.enabled) this.enabled = false;
    },
    enable() {
        console.log('enabled keybinds');
        if (!this.enabled) this.enabled = true;
    }
};
