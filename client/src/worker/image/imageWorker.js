import { getMostRepresentedEmotion } from './emotionDetection.js';

// The image is stored as a 1d array with red first, then green, and blue 
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;
const A_OFFSET = 3;

let selfie = undefined;

addEventListener('message', async (event) => {
    selfie = event.data;

    const pixelLuminance = [];
    const rg = [];
    const yb = [];
    
    for (let y = 0; y < selfie.height; y++) {
        for (let x = 0; x < selfie.width; x++) {
            const r = getPixelValue(x, y, R_OFFSET);
            const g = getPixelValue(x, y, G_OFFSET);
            const b = getPixelValue(x, y, B_OFFSET);            
            const luminance = getLuminance([r, g, b]);
            pixelLuminance.push(byteToUnitInterval(luminance));

            rg.push(byteToUnitInterval(Math.abs(r - g)));
            yb.push(byteToUnitInterval(Math.abs(0.5 * (r + g) - b)));
        }
    }

    // Brightness
    const selfieBrightness = increaseValueDynamics(getMean(pixelLuminance), 8, 0.47, 1);
    // StandardDeviation aka "Contrast"
    const selfieStandardDeviation = increaseValueDynamics(getStandardDeviation(pixelLuminance), 15, 0.2, 1);
    // "Colorfulness"
    const selfieColorfulness = increaseValueDynamics(getColorfulness(rg, yb), 30, 0.1, 1);

    const selfieMood = await getMostRepresentedEmotion(selfie);

    /**
     * Has to return values that get mapped to the following audio parameters:
     * 
     * danceability: headphonesDetected
     * energy: dynamic
     * mode: brightness
     * speechiness: percentageOfType
     * acousticness: percentageOfWood? saturation (hsl)?
     * instumentalness: colorfulness?
     * liveness: multipleFacesDetected
     * valence: detectedEmotion
     */
    postMessage({
        brightness: selfieBrightness.toFixed(2),
        colorfulness: selfieColorfulness.toFixed(2),
        contrast: selfieStandardDeviation.toFixed(2),
        mood: selfieMood,
    });
});


/**
 * Utility Functions
 */

// Given the x, y index, return what position it should be in a 1d array
const getPixelIndex = (x, y) => (x + y * selfie.width) * 4;

// Ensure value remain in RGB, 0 - 255
const clamp = (value) => Math.max(0, Math.min(Math.floor(value), 255));

// Converts Byte (0 - 255) to UnitInterval (0 - 1)
const byteToUnitInterval = (byteValue) => byteValue / 256;

const getPixelValue = (x, y, offset) => {
    const index = getPixelIndex(x, y) + offset;
    return selfie.data[index];
};

const setPixelValue = (x, y, offset, value) => {
    const index = getPixelIndex(x, y) + offset;
    const currentValue = selfie.data[index];
    selfie.data[index] = clamp(currentValue + value);
};

const getMean = (array) => (array.reduce((a, b) => a + b)) / array.length;

const getStandardDeviation = (array) => {
    const mean = getMean(array);
    return Math.sqrt(getMean(array.map((x) => Math.pow(x - mean, 2))));
};

const getLuminance = (array) => (array[0] + array[0] + array[1] + array[2] + array[2] + array[2]) / 6;

const getColorfulness = (rg, yb) => {
    // Compute the mean and standard deviation of both 'rg' and 'yb'
    const rgMean = getMean(rg);
    const ybMean = getMean(yb);
    const rgStandardDeviation = getStandardDeviation(rg);
    const ybStandardDeviation = getStandardDeviation(yb);
    // Combine the mean and standard deviations
    const rootStandardDeviation = Math.sqrt(Math.pow(rgStandardDeviation, 2) + Math.pow(ybStandardDeviation, 2));
    const rootMean = Math.sqrt(Math.pow(rgMean, 2) + Math.pow(ybMean, 2));
	// Calculate the "colorfulness"
    return rootStandardDeviation + (0.3 * rootMean);
};

// Scales a UnitInterval value by logistic function (non-linear) to increase the
// value dynamics in the middle range.
// Reference: https://en.wikipedia.org/wiki/Logistic_function
const increaseValueDynamics = (x, k = 8, mid = 0.5, max = 1) => {
    const power = -k * (x - mid);
    return max / (1 + Math.pow(Math.E, power));
};