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