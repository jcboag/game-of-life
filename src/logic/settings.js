class Settings {
    static instance;

    static defaults = [ 
        ['lastApp', 'editor'], 
        ['speed', 10],
        ['gridlines', true],
        ['dimensions', [25,25]]
    ]

    constructor() {
        if (Settings.instance) {
            return Settings.instance;
        }
        this.settings = new Map();
        this.defaults = new Map(Settings.defaults);
        this.loadSettings();
        Settings.instance = this;
    }

    static getInstance() {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    loadSettings() {
        const storedSettings = localStorage.getItem('settings');

        this.settings = new Map(JSON.parse(storedSettings) || Settings.defaults );

        if (!storedSettings) console.log('default settings loaded');
    }

    setDefaults() {
        this.settings = new Map( Settings.defaults );
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(Array.from(this.settings.entries())));
    }

    get(key) {
        return this.settings.get(key);
    }

    set(key, value) {
        this.settings.set(key, value);
        this.saveSettings();
    }

    reset() {
        this.setDefaults();
    }

    savePageState() {
        const app = window.app;

        if (app) {

            [ 'dimensions', 'speed', 'gridlines' ].forEach( prop => {
                const appProp = app[prop]
                if (appProp !== null) this.set(prop, appProp);
            });

            this.set('lastApp', app.appname);
        }
    }

    get lastApp() {
        return this.settings.get('lastApp');
    }

    get dimensions() {
        return this.settings.get('dimensions');
    }

    get speed() {
        return this.settings.get('speed');
    }

    get gridlines() {
        return this.settings.get('gridlines');
    }
}
