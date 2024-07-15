import React, { createContext, useState, useRef, useCallback } from 'react';

import { CONSTANTS } from './constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { GRIDLINES, DIMENSIONS , CANVAS_HEIGHT, CANVAS_WIDTH} } = CONSTANTS.DEFAULTS;

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [app, setApp] = useState(GAME_OF_LIFE);
    const lastApp = useRef(null);

    const [gridLines, setGridLines] = useState(GRIDLINES);
    const [dimensions, setDimensions] = useState(DIMENSIONS);
    const [height, setHeight] = useState(CANVAS_HEIGHT);
    const [width, setWidth] = useState(CANVAS_WIDTH);

    const changeApp = useCallback((nextApp) => {
        lastApp.current = app;
        setApp(nextApp);
    }, [app]);

    const value = {
        app,
        setApp: changeApp,
        lastApp,
        gridLines,
        setGridLines,
        dimensions,
        setDimensions,
        height,
        setHeight,
        width,
        setWidth,
        CONSTANTS,
        EDITOR,
        GAME_OF_LIFE,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};

export { AppContext, AppProvider };
