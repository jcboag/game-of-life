import React, { useEffect, useRef } from 'react';
import GameOfLife from '../logic/GameOfLife';
import Editor from '../logic/Editor';

import {CONSTANTS} from '../constants';
const { GAME_OF_LIFE, EDITOR } = CONSTANTS.APPS;

function Canvas({ canvasRef }) {
    return <canvas ref={canvasRef} width="750" height="750" style={{ border: '1px solid #000' }}></canvas>;
}

export default Canvas;
