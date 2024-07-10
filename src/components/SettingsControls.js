import { useState, useEffect } from 'react';

function SettingsControls({ gridLines, setGridLines, dimensions, setDimensions }) {
    return ( 
        <div>
            <Dimensions dimensions={dimensions} setDimensions={setDimensions} />
            <GridLines gridLines={gridLines} setGridLines={setGridLines} />
        </div>
    );
}

function GridLines({ gridLines, setGridLines }) {

    return (
        <div id="canvasProperties">
            <div id="gridlines">
                <label htmlFor="gridlines">Gridlines</label>
                <input
                    type="checkbox"
                    id="gridlines"
                    checked={gridLines}
                    onChange={(e) => { console.log(1); setGridLines(e.target.checked)}}
                />
            </div>
        </div>
    );
}

function Dimensions({ dimensions, setDimensions }) {

    const [tempValue, setTempValue] = useState(dimensions);

    useEffect(() => {
        setTempValue(dimensions);
    }, [dimensions]);

    const handleChange = (e) => {
        setTempValue(e.target.value);
    };

    const handleBlur = (e) => {
        const [height, width] = e.target.value.split(',').slice(0,2).map( dim => parseInt(dim));
        if ([ height, width ]) {
            setDimensions([ height, width ]);
        }
    };

    return (
        <div id="dimensions">
            <div id="rows">
                <label htmlFor="rowsCols">Dimensions: </label>
                <input
                    type="text"
                    value={tempValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </div>
        </div>
    );
}

export default SettingsControls;
