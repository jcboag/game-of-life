import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';

function SettingsControls() {
    const { state: { gridLines, dimensions }, dispatch } = useContext(AppContext);
    const [tempDimensions, setTempDimensions] = useState(dimensions);

    useEffect(() => {
        setTempDimensions(dimensions);
    }, [dimensions]);

    const handleGridLinesChange = (e) => {
        dispatch({ type: 'SET_GRIDLINES', gridLines: e.target.checked });
    };

    const handleDimensionsChange = (e) => {
        setTempDimensions(e.target.value);
    };

    const handleDimensionsBlur = () => {
        const [height, width] = tempDimensions.split(',').map(dim => parseInt(dim));
        if (height && width) {
            dispatch({ type: 'SET_DIMENSIONS', dimensions: [height, width] });
        }
    };

    return (
        <div id="settingsControls">
            <div id="canvasProperties">
                <div id="gridlines">
                    <label htmlFor="gridlines">Gridlines</label>
                    <input
                        type="checkbox"
                        id="gridlines"
                        checked={gridLines}
                        onChange={handleGridLinesChange}
                    />
                </div>
                <div id="dimensions">
                    <label htmlFor="dimensions">Dimensions: </label>
                    <input
                        type="text"
                        value={tempDimensions}
                        onChange={handleDimensionsChange}
                        onBlur={handleDimensionsBlur}
                    />
                </div>
            </div>
        </div>
    );
}

export default SettingsControls;
