const faceLandmarksDetection = import(/* webpackPreload: true */ '@tensorflow-models/face-landmarks-detection');
const tfjsBackendWebgl = import(/* webpackPreload: true */ '@tensorflow/tfjs-backend-webgl');
const tf = import(/* webpackPreload: true */ '@tensorflow/tfjs-core');

class FaceLandmarksDetection {
    constructor(input, output) {
        this.VIDEO_WIDTH = 500;
        this.VIDEO_HEIGHT = this.VIDEO_WIDTH;
        this.TF_BACKEND = 'webgl';
        this.input = input;
        this.output = output;
        this.model = undefined;
        this.ctx = undefined;
    }

    async init() {
        await tfjsBackendWebgl;
        await (await tf).setBackend(this.TF_BACKEND);
        // Start webcam
        await this.setupCamera();
        // Play video
        this.input.play();
        this.input.width = this.VIDEO_WIDTH;
        this.input.height = this.VIDEO_HEIGHT;
        // Style canvas
        this.output.width = this.VIDEO_WIDTH;
        this.output.height = this.VIDEO_HEIGHT;
        // NECESSARY?
        // const canvasContainer = document.querySelector('.canvas-wrapper');
        // canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;
        // Setup context
        this.ctx = this.output.getContext('2d');
        this.ctx.translate(this.output.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.fillStyle = '#32EEDB';
        // Setup tensorflow.js faceLandmarksDetection model
        this.model = await (await faceLandmarksDetection).load(
            (await faceLandmarksDetection).SupportedPackages.mediapipeFacemesh,
        );
        // Start making predictions
        this.renderPrediction();
    }

    async setupCamera() {
        // Create new stream from camera
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user',
                width: this.VIDEO_WIDTH,
                height: this.VIDEO_HEIGHT,
            },
        });
        // Set input source to created stream
        this.input.srcObject = stream;
        // Return promise that resolves if video is loaded
        return new Promise((resolve) => {
            this.input.onloadedmetadata = () => {
                resolve(this.input);
            };
        });
    }

    async renderPrediction() {
        // Make a prediction about the face landmarks
        // the first prediction is taking very long.
        const predictions = await this.model.estimateFaces({
            input: this.input,
        });
        // Plott the input video as canvas background
        // Clip the image and position the clipped part on the canvas
        // ctx.drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
        this.ctx.drawImage(
            this.input,
            0, 0, this.VIDEO_WIDTH, this.VIDEO_HEIGHT,
            0, 0, this.output.width, this.output.height,
        );
        // Plott the prediction onto the context
        if (predictions.length > 0) {
            for (const prediction of predictions) {
                const keypoints = prediction.scaledMesh;
                for (const keypoint of keypoints) {
                    const [x, y] = keypoint;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
        // Render the next prediction
        requestAnimationFrame(() => this.renderPrediction());
    }
}

const video = document.getElementById('video');
const canvas = document.getElementById('output');

const fld = new FaceLandmarksDetection(video, canvas);

fld.init();