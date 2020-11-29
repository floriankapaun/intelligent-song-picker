<template>
    <h2 id="greeting">Hey {{ userName }}.</h2>
    <button type="button" @click="startPlayback">play</button>
    <button type="button" @click="stopPlayback">pause</button>
    <p><button type="button" @click="refreshAccessToken()">Refresh Token</button></p>
    <div class="canvas-wrapper">
        <canvas id="output"></canvas>
        <video id="video" playsinline></video>
    </div>
</template>

<script>
import { spotifyController } from '@/utils/SpotifyController.js';

import { faceLandmarksDetection } from '@/utils/FaceLandmarksDetection.js';

export default {
    created() {
        // faceLandmarksDetection.init();

        // window.addEventListener('load', router);
        // window.addEventListener('hashchange', router);
    },
    computed: {
        userName() {
            return spotifyController.user && spotifyController.user.display_name
                ? spotifyController.user.display_name
                : null;
        }
    },
    methods: {
        startPlayback() {
            spotifyController.play();
        },
        stopPlayback() {
            spotifyController.pause();
        },
        refreshAccessToken() {
            spotifyController.refreshAccessToken();
        },
    },
};
</script>