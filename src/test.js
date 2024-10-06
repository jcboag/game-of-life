import  { CONSTANTS } from './constants.js';

// Constants.js
function assert() {
    Object.values( CONSTANTS.APPS ).forEach( app => {
        if (CONSTANTS.APPS_PRETTY.get(app) === 'undefined') throw Error( `{app} is undefined at APPS_PRETTY` );
    });
    console.log('Success')
}

assert();
