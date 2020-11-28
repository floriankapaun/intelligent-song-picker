<template>
    <router-link to="/">Home</router-link> | <router-link to="/about">About</router-link>
    <router-view />
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
};
</script>