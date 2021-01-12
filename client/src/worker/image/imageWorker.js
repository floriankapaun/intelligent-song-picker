import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs-core';
import { loadLayersModel } from '@tensorflow/tfjs-layers';
// Using CPU backend, because webgl isn't supported and wasm isn't supporting
// blazeface as of now.
import '@tensorflow/tfjs-backend-cpu';

import emotionClassificationModelUrl from '@/assets/model/model.json';

import shard1 from '@/assets/model/group1-shard1of1';
import shard2 from '@/assets/model/group2-shard1of1';
import shard3 from '@/assets/model/group3-shard1of1';
import shard4 from '@/assets/model/group4-shard1of1';
import shard5 from '@/assets/model/group5-shard1of1';
import shard6 from '@/assets/model/group6-shard1of1';
import shard7 from '@/assets/model/group7-shard1of1';
import shard8 from '@/assets/model/group8-shard1of1';
import shard9 from '@/assets/model/group9-shard1of1';
import shard10 from '@/assets/model/group10-shard1of1';
import shard11 from '@/assets/model/group11-shard1of1';
import shard12 from '@/assets/model/group12-shard1of1';
import shard13 from '@/assets/model/group13-shard1of1';
import shard14 from '@/assets/model/group14-shard1of1';
import shard15 from '@/assets/model/group15-shard1of1';
import shard16 from '@/assets/model/group16-shard1of1';
import shard17 from '@/assets/model/group17-shard1of1';
import shard18 from '@/assets/model/group18-shard1of1';
import shard19 from '@/assets/model/group19-shard1of1';

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

    const selfieMood = await getSelfieMood();
    console.log(selfieMood);

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

const rgbToGrayscale = async (imgTensor) => {
    
}

const prepareFaceImage = async (selfieTensor, face) => {
    const { topLeft, bottomRight } = face;
    // Holds [height, width] of selfie
    const denominator = selfieTensor.shape.slice(1, 3);
    // Boxes for .cropAndResize() need to be normalized
    const normalizedTopLeft = tf.div(topLeft, denominator);
    const normalizedBottomRight = tf.div(bottomRight, denominator);
    const boxes = tf.concat([normalizedTopLeft, normalizedBottomRight]).reshape([-1, 4]);
    // Crop the face out and resize image to proper dimensions (48x48)
    const faceImage = tf.image.cropAndResize(selfieTensor, boxes, [0], [48, 48]);
    // Normalize color values from [0, 255] to [-1, 1].
    const normalizedFaceImage = faceImage
        .sub(tf.scalar(127.5))
        .div(tf.scalar(127.5));
    // Convert image to grayscale. Therefore compute mean of R, G, and B values,
    // then expand dimensions to get proper shape: [1, h, w, 1]
    return normalizedFaceImage
        .mean(3, false)
        .toFloat()
        .expandDims(3);
}

/**
 * 1. Find a face
 * 2. Detect mood
 */
const getSelfieMood = async () => {
    // Setup tensorflow backend
    await tf.setBackend('cpu');
    // Load blazeface for face detection
    const blazeFaceModel = await blazeface.load();
    // Predict face position(s)
    const returnTensors = false;
    const flipHorizontal = true;
    const annotateBoxes = true;
    const predictions = await blazeFaceModel.estimateFaces(selfie, returnTensors, flipHorizontal, annotateBoxes);
    // Convert selfie to tensor
    let selfieTensor = tf.browser.fromPixels(selfie);
    selfieTensor = selfieTensor.reshape([1, ...selfieTensor.shape]);
    // Crop image to face only, normalize and resize
    const faces = await Promise.all(predictions.map((face) => prepareFaceImage(selfieTensor, face)));
    const emotionModel = await loadLayersModel(emotionClassificationModelUrl);
    const logits = emotionModel.predict(faces);
    
    const EMOTION = {
        0: { name: 'Angry', emoji: '😠' },
        1: { name: 'Disgust', emoji: '🤢' },
        2: { name: 'Fear', emoji: '😨' },
        3: { name: 'Happy', emoji: '😄' },
        4: { name: 'Sad', emoji: '🙁' },
        5: { name: 'Surprise', emoji: '😲' },
        6: { name: 'Neutral', emoji: '😐' },
    };
    const values = await logits.data();
    let predictionList = [];

    for (let i = 0; i < values.length; i++) {
        predictionList.push({ value: values[i], index: i })
    }

    predictionList = predictionList
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map(x => {
            return { label: EMOTION[x.index], value: x.value };
        });

    console.log('PRED', predictionList);
}