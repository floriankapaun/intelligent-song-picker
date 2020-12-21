const tfFaceLandmarksDetection = import(/* webpackPreload: true */ '@tensorflow-models/face-landmarks-detection');
const tfjsBackendWebgl = import(/* webpackPreload: true */ '@tensorflow/tfjs-backend-webgl');
const tf = import(/* webpackPreload: true */ '@tensorflow/tfjs-core');

import config from '../config/config.js';

class FaceLandmarksDetection {
    constructor() {
        this.VIDEO_WIDTH = 200;
        this.VIDEO_HEIGHT = this.VIDEO_WIDTH;
        this.TF_BACKEND = 'webgl';
        this.sawFirstFace = false;
        this.input = undefined;
        this.output = undefined;
        this.model = undefined;
        this.ctx = undefined;
    }

    async init(input, output) {
        this.input = input;
        this.output = output;
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
        // Setup context
        this.ctx = this.output.getContext('2d');
        this.ctx.translate(this.output.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.fillStyle = '#32EEDB';
        // Setup tensorflow.js faceLandmarksDetection model
        this.model = await (await tfFaceLandmarksDetection).load(
            (await tfFaceLandmarksDetection).SupportedPackages.mediapipeFacemesh,
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
        // this.ctx.drawImage(
        //     this.input,
        //     0, 0, this.VIDEO_WIDTH, this.VIDEO_HEIGHT,
        //     0, 0, this.output.width, this.output.height,
        // );

        // Plott the prediction onto the context
        // if (predictions.length > 0) {
        //     for (const prediction of predictions) {
        //         const keypoints = prediction.scaledMesh;
        //         for (const keypoint of keypoints) {
        //             const [x, y] = keypoint;
        //             this.ctx.beginPath();
        //             this.ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
        //             this.ctx.fill();
        //         }
        //     }
        // }

        // Has there ever been a face detected?
        if (!this.sawFirstFace && predictions.length > 0) this.sawFirstFace = true;
        // Render the next prediction
        requestAnimationFrame(() => this.renderPrediction());
    }
}

export const faceLandmarksDetection = new FaceLandmarksDetection();
