import React, { createContext, useReducer, useCallback, useRef } from 'react';
import { CONSTANTS } from './constants';
import Matrix from './logic/Matrix';

const AppContext = createContext();

const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;
const { GLOBAL: { GRIDLINES, DIMENSIONS, CANVAS_HEIGHT, CANVAS_WIDTH } } = CONSTANTS.DEFAULTS;

const initialAppState = {
    app: GAME_OF_LIFE,
    gridLines: GRIDLINES,
    dimensions: DIMENSIONS,
    height: CANVAS_HEIGHT,
    width: CANVAS_WIDTH,
    stateMatrix: Matrix.getNullMatrix(...DIMENSIONS),
    states: [],
};

function appStateReducer(state, action) {
    switch (action.type) {
        case 'CHANGE_APP':
            return { ...state, app: action.app };
        case 'SET_GRIDLINES':
            return { ...state, gridLines: action.gridLines };
        case 'SET_DIMENSIONS':
            return { ...state, dimensions: action.dimensions };
        case 'SET_HEIGHT':
            return { ...state, height: action.height };
        case 'SET_WIDTH':
            return { ...state, width: action.width };
        case 'SET_STATE_MATRIX':
            // Save past states
            state.states.push(state.stateMatrix);
            return { ...state, stateMatrix: action.stateMatrix };
        default:
            return state;
    }
}

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, initialAppState);
    const lastApp = useRef(null);

    const changeApp = useCallback((nextApp) => {
        lastApp.current = state.app;
        dispatch({ type: 'CHANGE_APP', app: nextApp });
    }, [state.app]);

    const value = {
        state,
        dispatch,
        changeApp,
        CONSTANTS,
        EDITOR,
        GAME_OF_LIFE,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
