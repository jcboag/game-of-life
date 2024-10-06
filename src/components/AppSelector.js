import React, { useContext } from 'react';
import { AppContext } from '../AppContext';

function AppSelector() {
    const { CONSTANTS, state: { app}, changeApp } = useContext(AppContext);
    const apps = CONSTANTS.APPS_MAP;

    return (
        <div id="appSelect">
            <select value={app} onChange={e => changeApp(e.target.value)}>
                {Array.from(apps.keys()).map(appName => (
                    <option key={appName} value={appName}>
                        {apps.get(appName)}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default AppSelector;
