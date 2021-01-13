import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs-core';
import { loadLayersModel } from '@tensorflow/tfjs-layers';
// Using CPU backend, because webgl isn't supported and wasm isn't supporting
// blazeface as of now.
import '@tensorflow/tfjs-backend-cpu';

import emotionClassificationModelUrl from '@/assets/model/model.json';
// Imports for webpack to compile the shards to dist
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

import c from '@/config/index.js';

export const getFaces = async (img) => {
    // Load blazeface for face detection
    const model = await blazeface.load();
    // Predict and return face position(s)
    const returnTensors = false;
    const flipHorizontal = true;
    const annotateBoxes = true;
    return model.estimateFaces(img, returnTensors, flipHorizontal, annotateBoxes);
};

export const getFaceImage = async (img, position) => {
    // Get image dimensions [height, width]
    const imgDimensions = img.shape.slice(1, 3);
    // Normalize topLeft and bottomRight position
    const normalizedTopLeft = tf.div(position.topLeft, imgDimensions);
    const normalizedBottomRight = tf.div(position.bottomRight, imgDimensions);
    // Configure box to crop by
    const box = tf.concat([normalizedTopLeft, normalizedBottomRight]).expandDims(0);
    // Crop image to face only (box) and resize to correct dimensions for classifier
    const faceImage = tf.image.cropAndResize(img, box, [0], c.CLASSIFIER_IMG_DIMENSIONS);
    // Normalize color values from [0, 255] to [-1, 1].
    const normalizedFaceImage = faceImage
        .sub(tf.scalar(127.5))
        .div(tf.scalar(127.5));
    // Convert normalizedFaceImage to grayscale. Therefore compute
    // mean of R, G, and B values, then expand dimensions to get
    // propper shape: [1, height, width, 1]
    return normalizedFaceImage
        .mean(3, false)
        .toFloat()
        .expandDims(3);
};

export const getEmotion = async (img) => {
    const model = await loadLayersModel(emotionClassificationModelUrl);
    const predictions = await model.predict(img).data();
    const indexOfMaxValue = predictions.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    return c.EMOTION[indexOfMaxValue];
};

export const getMostRepresentedEmotion = async (img) => {
    // Convert img to tensor and reshape to [1, height, width, 3]
    let imgTensor = tf.browser.fromPixels(img).expandDims(0);
    // Setup tensorflow backend
    await tf.setBackend(c.TF_BACKEND);
    // Find faces and their positions in img
    const facePositions = await getFaces(img);
    if (facePositions.length === 0) return false;
    // Get face images ready for classification
    const faceImages = await Promise.all(
        facePositions.map((position) => getFaceImage(imgTensor, position))
    );
    if (faceImages.length === 0) return false;
    // Classify each face image
    const emotions = await Promise.all(
        faceImages.map((img) => getEmotion(img))
    );
    if (emotions.length === 0) return false;
    // Return the only emotion
    if (emotions.length === 1) return emotions[0];
    // or the most represented one
    return emotions.reduce((max, x, i, arr) => {
        const maxOccurences = arr.filter(v => v === max).length;
        const thisOccurences = arr.filter(v => v === x).length;
        return maxOccurences >= thisOccurences ? max : x;
    });
};