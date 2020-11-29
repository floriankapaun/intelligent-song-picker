<template>
    <h2 id="greeting">Hey {{ userName }}.</h2>
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
            console.log(spotifyController);
            return spotifyController.user && spotifyController.user.name ? spotifyController.user.name : null;
        }
    },
    methods: {
        refreshAccessToken() {
            spotifyController.refreshAccessToken();
        },
    },
};
</script>