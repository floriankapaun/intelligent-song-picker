export const setCookie = (cookieName, cookieValue, daysToExist = 365) => {
    // Encode cookieValue in order to escape semicolons, commas, and whitespace
    const encodedCookieValue = encodeURIComponent(cookieValue);
    const expirationDate = daysToExist * 24 * 60 * 60;
    document.cookie = `${cookieName}=${encodedCookieValue};max-age=${expirationDate};path=/;`;
};

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
};

export const deleteCookie = (cookieName) => {
    setCookie(cookieName, '', -1);
};

export const setupCamera = async (videoElement) => {
    // iOS is restricting camera access to Safari as of now
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { error: true };
    }
    // Create new stream from camera
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: 'user',
        },
    });
    // Set video elements source to created stream
    videoElement.srcObject = stream;
    // Return promise that resolves if video is loaded
    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve({
                video: videoElement,
                stream,
            });
        };
    });
}