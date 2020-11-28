import c from './config.js';
import { parseLocation, findViewByPath, getCookie } from './utility.js';

// Full history of pages visited
export const pageHistory = [];

// Routing logic
export const router = () => {
    // Get the current path
    const path = parseLocation();
    // Find the corresponding view and if there is no match,
    // get the error view
    let view = findViewByPath(path) || findViewByPath(c.router.errorViewPath);
    // If view can't be accessed without authentication, check the spotify authentication
    if (!view.accessWithoutAuth) {
        if (!getCookie('SPOTIFY_ACCESS_TOKEN') || !getCookie('SPOTIFY_REFRESH_TOKEN')) {
            // TODO: Add toast to login view
            console.log('PLEASE AUTHENTICATE FIRST');
            view = findViewByPath(c.router.loginViewPath);
        } else {
            console.log('set');
        }
    }
    // Add new path to pageHistory if it's not the currently active one
    if (pageHistory[pageHistory.length - 1] !== path) pageHistory.push(path);

    console.log('Current View', view);
    
    // Render the view into the `appContainer`
    // c.appDOM.innerHTML = views[view.name].render();
};
