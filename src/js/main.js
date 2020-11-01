// import '../css/main.css';

const faceLandmarksDetection = import(/* webpackPreload: true */ '@tensorflow-models/face-landmarks-detection');
const tfjsBackendWebgl = import(/* webpackPreload: true */ '@tensorflow/tfjs-backend-webgl');
const tf = import(/* webpackPreload: true */ '@tensorflow/tfjs-core');

const VIDEO_SIZE = 500;

const video = document.getElementById('video');
const canvas = document.getElementById('output');
const canvasContainer = document.querySelector('.canvas-wrapper');

let model, ctx, videoWidth, videoHeight;

async function setupCamera() {

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: 'user',
            // width: VIDEO_SIZE,
            // height: VIDEO_SIZE
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function renderPrediction() {
    // the first prediction is taking very long.
    const predictions = await model.estimateFaces({
        input: video,
    });

    ctx.drawImage(
        video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height,
    );

    if (predictions.length > 0) {
        for (let i = 0; i < predictions.length; i++) {
            const keypoints = predictions[i].scaledMesh;
            for (let j = 0; j < keypoints.length; j++) {
                const [x, y] = keypoints[j];
                ctx.beginPath();
                ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    requestAnimationFrame(renderPrediction);
};

async function main() {
    await tfjsBackendWebgl;
    await (await tf).setBackend('webgl');
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

    ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = '#32EEDB';

    model = await (await faceLandmarksDetection).load(
        (await faceLandmarksDetection).SupportedPackages.mediapipeFacemesh,
    );
    renderPrediction();
};

main();