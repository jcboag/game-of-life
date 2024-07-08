import React, { useEffect, useRef } from 'react';
import GameOfLife from '../logic/GameOfLife';
import Editor from '../logic/Editor';

import {CONSTANTS} from '../constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;

function Canvas({ app, gridLines, speed, dimensions }) {

    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        let appInstance;

        if (app === GAME_OF_LIFE ) {
            appInstance = new GameOfLife({canvas , gridlines: gridLines, speed, initialState:dimensions[0]});
        } else if (app === EDITOR ) {
            appInstance = new Editor({ canvas, dimensions, gridlines: gridLines});
        }
        return () => {
            if (appInstance.cleanup) {
                appInstance.cleanup();
            }
        };
    }, [app]);

    return <canvas ref={canvasRef} width="750" height="750" style={{ border: '1px solid #000' }}></canvas>;
}

export default Canvas;
