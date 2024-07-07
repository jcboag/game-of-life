function SettingsControls({ gridLines, setGridLines, dimensions, setDimensions }) {

    const [rows, cols] = dimensions;

    return (
        <div id="canvasProperties">
            <div id="gridlines">
                <label htmlFor="gridlines">Gridlines</label>
                <input
                    type="checkbox"
                    id="gridlines"
                    checked={gridLines}
                    onChange={(e) => setGridLines(e.target.checked)}
                />
            </div>
            <div id="dimensions">
                <div id="rows">
                    <label htmlFor="mRows"># Rows</label>
                    <input
                        id="mRows"
                        size="3"
                        value={rows}
                        onChange={(e) => setDimensions(Number(e.target.value), cols)}
                    />
                </div>
                <div id="cols">
                    <label htmlFor="nCols"># Cols</label>
                    <input
                        id="nCols"
                        size="3"
                        value={cols}
                        onChange={(e) => setDimensions(rows, Number(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}

export default SettingsControls;
