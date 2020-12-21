<template>
    <h2 id="greeting">Hey {{ userName }}.</h2>
    <button type="button" @click="startPlayback">play</button>
    <button type="button" @click="stopPlayback">pause</button>
    <button type="button" @click="logout">logout</button>
    <p><button type="button" @click="refreshAccessToken()">Refresh Token</button></p>
    <div class="canvas-wrapper">
        <canvas id="output" ref="canvas"></canvas>
        <video id="video" ref="video" playsinline></video>
    </div>
</template>

<script>
import { spotifyController } from '@/utils/SpotifyController.js';
import { faceLandmarksDetection } from '@/utils/FaceLandmarksDetection.js';
import { deleteCookie } from '@/utils/utility.js';

export default {
    mounted() {
        faceLandmarksDetection.init(this.$refs.video, this.$refs.canvas);
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
        logout() {
            deleteCookie('SPOTIFY_ACCESS_TOKEN');
            deleteCookie('SPOTIFY_REFRESH_TOKEN');
            deleteCookie('SPOTIFY_AUTH_ERROR');
            // Cause page reload
            this.$router.go();
        },
        refreshAccessToken() {
            spotifyController.refreshAccessToken();
        },
    },
};
</script>