import c from '../config/config.js';

export const getHashParams = () => {
    const hashParams = {};
    const query = window.location.hash.substring(1);
    const r = /([^&;=]+)=?([^&;]*)/g;
    let e = r;
    while (e = r.exec(query)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
};

export const setCookie = (cookieName, cookieValue, daysToExist = 365) => {
    // Encode cookieValue in order to escape semicolons, commas, and whitespace
    const encodedCookieValue = encodeURIComponent(cookieValue);
    const expirationDate = daysToExist * 24 * 60 * 60;
    document.cookie = `${cookieName}=${encodedCookieValue};max-age=${expirationDate};path=/;`;
}

export const getCookie = (cookieName) => {
    // Decode the cookie string, to handle cookies with special characters, e.g. '$'
    const decodedCookieString = decodeURIComponent(document.cookie);
    // Split cookie string and get all individual name=value pairs in an array
    const cookieArray = decodedCookieString.split(';');
    for (const cookieString of cookieArray) {
        const cookie = cookieString.split('=');
        // Remove whitespace at the beginning of the cookie name
        // and compare it with the given string
        if (cookieName === cookie[0].trim()) return cookie[1];
    }
    return null;
}

export const parseLocation = () => location.hash.slice(1).toLowerCase() || '/';

export const findViewByPath = (path) => c.routes.find((r) => r.path.match(new RegExp(`^\\${path}$`, 'gm'))) || undefined;