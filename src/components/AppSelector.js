import React from 'react';

function AppSelector({ app, apps, setApp }) {
    return (
        <div id="appSelect">
            <select 
                value={app}
                onChange={e => setApp(e.target.value)}
            >
            {Array.from(apps.keys()).map( 
                (appName) => (
                    <option key={appName} value={appName}>
                        {apps.get(appName)}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default AppSelector;
