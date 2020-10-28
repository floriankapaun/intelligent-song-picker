// const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');
const faceLandmarksDetection = import(/* webpackPreload: true */ '@tensorflow-models/face-landmarks-detection');

// If you are using the WebGL backend:
// require('@tensorflow/tfjs-backend-webgl');
const tfjsBackendWebgl = import(/* webpackPreload: true */ '@tensorflow/tfjs-backend-webgl');

async function getComponent() {
    const element = document.createElement('div');
    return element;
}
 
getComponent().then(component => {
    document.body.appendChild(component);
});