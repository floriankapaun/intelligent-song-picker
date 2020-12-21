// The image is stored as a 1d array with red first, then green, and blue 
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;
const A_OFFSET = 3;

let selfie = undefined;

addEventListener('message', async (event) => {
    selfie = event.data;

    const numberOfPixels = selfie.width * selfie.height;

    let r = 0;
    let g = 0;
    let b = 0;

    for (let x = 0; x < selfie.width; x++) {
        for (let y = 0; y < selfie.height; y++) {
            r += getPixelValue(x, y, R_OFFSET);
            g += getPixelValue(x, y, G_OFFSET);
            b += getPixelValue(x, y, B_OFFSET);
        }
    }

    const brightness = byteToPercentage((r + g + b) / (numberOfPixels * 3));

    postMessage({
        brightness,
    });
});


/**
 * Utility Functions
 */

// Given the x, y index, return what position it should be in a 1d array
const getPixelIndex = (x, y) => (x + y * selfie.width) * 4;

// Ensure value remain in RGB, 0 - 255
const clamp = (value) => Math.max(0, Math.min(Math.floor(value), 255));

const byteToPercentage = (byteValue) => byteValue / 256 * 100;

const getPixelValue = (x, y, offset) => {
    const index = getPixelIndex(x, y) + offset;
    return selfie.data[index];
};

const setPixelValue = (x, y, offset, value) => {
    const index = getPixelIndex(x, y) + offset;
    const currentValue = selfie.data[index];
    selfie.data[index] = clamp(currentValue + value);
};
