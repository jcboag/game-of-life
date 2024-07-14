import React, { useRef, useState, useEffect } from 'react';

import Grid from '../logic/Grid';
import Matrix from '../logic/Matrix';
import Colorizer from '../logic/Colorizer';
import GameOfLife from '../logic/GameOfLife';

function GameOfLife( { state } ) {

    const [ playing, setPlaying ] = useState(null);

    return <canvas ref={canvasRef}/>

}
