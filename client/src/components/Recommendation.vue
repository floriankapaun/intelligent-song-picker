<template>
    <main>
        <div v-if="selfie && selfieURL" class="fullscreen-background_wrapper" :class="{ 'transition-in': imgLoaded }">
            <img :src="selfieURL" alt="The Selfie you took" @load="imgLoaded = true">
        </div>
        <spotify-player v-if="recommendedTrack" ref="spotifyPlayer" :recommendedTrack="recommendedTrack" @deleteSelfie="$emit('deleteSelfie')"></spotify-player>
    </main>
</template>

<script>
import SpotifyPlayer from '@/components/SpotifyPlayer.vue';
import { spotifyController } from '@/utils/SpotifyController.js';
import spotifyWorker from '@/worker/spotify/index.js';
import imageWorker from '@/worker/image/index.js';

export default {
    props: {
        selfie: undefined,
        selfieURL: undefined,
    },
    data() {
        return {
            imgLoaded: false,
            recommendedTrack: undefined,
        };
    },
    components: {
        SpotifyPlayer
    },
    mounted() {
        // Setup listener for spotifyWorker
        spotifyWorker.worker.onmessage = (event) => {
            const { error, result } = event.data;
            if (error) {
                const { status, message } = error;
                console.error(`${status}${status ? ': ' : null}${message}`);
            } else if (result && Object.keys(result).length > 0) {
                this.recommendedTrack = result;
            } else {
                console.error('Result from Spotify Worker is empty.');
            }
        };
        // Setup listener for imageWorker
        imageWorker.worker.onmessage = (event) => {
            spotifyWorker.send({
                accessToken: spotifyController.accessToken,
                imageData: event.data,
            });
        };
        // Send the received selfie to the imageWorker to start the processing pipeline
        imageWorker.send(this.selfie);
    },
};
</script>

<style lang="css" scoped>
.transition-in {
    transform: scale(0);
    transform-origin: center center;
    animation: transition-in 0.15s var(--easing) 0s 1 forwards;
}

@keyframes transition-in {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
}
</style>