// const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');
const faceLandmarksDetection = import(/* webpackPreload: true */ '@tensorflow-models/face-landmarks-detection');

// If you are using the WebGL backend:
// require('@tensorflow/tfjs-backend-webgl');
const tfjsBackendWebgl = import(/* webpackPreload: true */ '@tensorflow/tfjs-backend-webgl');

const main = async () => {
    // Load the MediaPipe FaceMesh package.
    const model = await (await faceLandmarksDetection).load(
        (await faceLandmarksDetection).SupportedPackages.mediapipeFacemesh,
    );
    
    const predictions = await model.estimateFaces({
        input: document.querySelector('video'),
    });
}

main();