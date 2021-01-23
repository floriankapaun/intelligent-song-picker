<template>
    <main>
        <article v-if="selfie && selfie.img && selfie.url" class="fullscreen-background_wrapper transition-in_setup" :class="{ 'transition-in': imgLoaded }">
            <img :src="selfie.url" alt="The Selfie you took" @load="imgLoaded = true">
        </article>
        <article v-if="isAnalyzingImage" class="fullscreen-background_wrapper p4">
            <div class="loading-animation">
                <div class="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p class="text-xs color-ink_light mt2">Analyzing mood & searching song</p>
            </div>
        </article>
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
            isAnalyzingImage: false,
        };
    },
    components: {
        Player,
    },
    mounted() {
        // Setup listener for spotifyWorker
        spotifyWorker.worker.onmessage = (event) => {
            // Hide loading animation again
            this.isAnalyzingImage = false;
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
        // Show loading animation
        this.isAnalyzingImage = true;
        // Send the received selfie to the imageWorker to start the processing pipeline
        imageWorker.send(this.selfie.img);
    },
};
</script>

<style lang="css" scoped>
.transition-in_setup {
    transform: scale(0);
    transform-origin: center center;
    transition: 0.15s var(--easing);
}

.transition-in {
    transform: scale(1);
}
</style>