export const CONSTANTS = {

    // Keys
    APPS : {
        GAME_OF_LIFE: 'gameoflife',
        EDITOR: 'editor',
    },

    // Key associate with human-readable name
    APPS_MAP : new Map([
        ['gameoflife', 'Game Of Life'],
        ['editor', 'Editor'],
    ]),

    DEFAULTS : {
        GLOBAL: {
            SPEED : 10,
            DIMENSIONS : [ 100, 100 ],
            GRIDLINES : true,
        },
    }
}
