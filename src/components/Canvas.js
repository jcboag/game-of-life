import React, { useRef , useEffect } from 'react';

function Canvas({ app }) {

  const canvasRef = useRef(null);

  return (
    <canvas id="grid" ref={canvasRef} width="500" height="500" style={{ border: '1px solid #000000' }}></canvas>
  );
}

export default Canvas;
