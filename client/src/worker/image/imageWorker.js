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

    const selfieBrightness = increaseValueDynamics(getMean(pixelLuminance));

    // Remains pretty small (for most selfies below 0.3)
    const selfieStandardDeviation = getStandardDeviation(pixelLuminance);

	// Compute the mean and standard deviation of both 'rg' and 'yb'
    const rgMean = getMean(rg);
    const ybMean = getMean(yb);
    const rgStandardDeviation = getStandardDeviation(rg);
    const ybStandardDeviation = getStandardDeviation(yb);
    // Combine the mean and standard deviations
    const rootStandardDeviation = Math.sqrt(Math.pow(rgStandardDeviation, 2) + Math.pow(ybStandardDeviation, 2));
    const rootMean = Math.sqrt(Math.pow(rgMean, 2) + Math.pow(ybMean, 2));
	// Calculate the "colorfulness"
    const selfieColorfulness = rootStandardDeviation + (0.3 * rootMean);

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
        brightness: selfieBrightness,
        colorfulness: selfieColorfulness,
        contrast: selfieStandardDeviation,
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

// Scales a UnitInterval value by logistic function (non-linear) to increase the
// value dynamics in the middle range.
// Reference: https://en.wikipedia.org/wiki/Logistic_function
const increaseValueDynamics = (x) => {
    const max = 1;
    const mid = 0.47; // Photos tend to be darker hence the slight shift below 0.5
    const k = 8;

    const power = -k * (x - mid);
    return max / (1 + Math.pow(Math.E, power));
}
