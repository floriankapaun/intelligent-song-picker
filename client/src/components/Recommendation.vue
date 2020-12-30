<template>
    <main>
        <div v-if="selfie && selfie.img && selfie.url" class="fullscreen-background_wrapper" :class="{ 'transition-in': imgLoaded }">
            <img :src="selfie.url" alt="The Selfie you took" @load="imgLoaded = true">
        </div>
        <player :recommendedTrack="recommendedTrack" :spotify="spotify" @deleteSelfie="$emit('deleteSelfie')"></player>
    </main>
</template>

<script>
import Player from '@/components/Player.vue';
import spotifyWorker from '@/worker/spotify/index.js';
import imageWorker from '@/worker/image/index.js';

export default {
    props: {
        selfie: Object,
        spotify: Object,
    },
    data() {
        return {
            imgLoaded: false,
            recommendedTrack: undefined,
        };
    },
    components: {
        Player,
    },
    mounted() {
        // Setup listener for spotifyWorker
        spotifyWorker.worker.onmessage = (event) => {
            const { error, result } = event.data;
            if (result && Object.keys(result).length > 0) {
                this.recommendedTrack = result;
            } else if (error) {
                const { status, message } = error;
                if (status && message) {
                    console.error(`${status}: ${message}`);
                } else if (message) {
                    console.error(message);
                } else {
                    conso.error('SpotifyWorker returned undefined Error.')
                }
            } else {
                console.error('Result from SpotifyWorker is empty.');
            }
        };
        // Setup listener for imageWorker
        imageWorker.worker.onmessage = (event) => {
            spotifyWorker.send({
                accessToken: this.spotify.auth.accessToken,
                parameters: event.data,
            });
        };
        // Send the received selfie to the imageWorker to start the processing pipeline
        imageWorker.send(this.selfie.img);
    },
};
</script>

<style lang="css" scoped>
.fullscreen-background_wrapper {
    transform: scale(0);
    transform-origin: center center;
    transition: 0.15s var(--easing);
}

.transition-in {
    transform: scale(1);
}
</style>