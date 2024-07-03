class KeyboardShortcuts  {

    static defaultShortcuts = new Map([

        [ 
            GameOfLife.appname,
            [
                ['ArrowLeft', () => window.app.previousState() ],
                ['ArrowRight', () => window.app.nextState() ],
                ['ArrowUp', () => window.app.reset() ],
                ['Space', () => window.app.toggleStartStop() ],
                ['ArrowDown', () => Page.editCurrentState()  ]

            ]
        ],

        [
            Editor.appname,
            [
                ['ArrowRight', () => window.getInitialStateFromEditor()]

            ]
        ]
    ]);

    constructor(keyMap) {

        if ( KeyboardShortcuts.instance ) return KeyboardShortcuts.instance;
        this.keyMap = keyMap 
        this.enabled = true;

        document.addEventListener( 'keydown', this.handleKeyDown )
    }

    handleKeyDown = e => {
        if (this.keyMap && this.enabled) {
            let action = this.keyMap.get(e.code.replace(/Key|Digit/,''));
            if (action) {
                e.preventDefault();
                e.stopPropagation();
                action();
            }
                
        }
    }
}

