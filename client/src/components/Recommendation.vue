<template>
    <div>
        <div class="fullscreen-background_wrapper" :class="selfie ? 'transition-in' : 'hidden'">
            <img :src="getSelfieURL" alt="your selfie">
        </div>
        <button @click="$emit('deleteSelfie')">New selfie</button>
        <spotify-player ref="spotifyPlayer"></spotify-player>
    </div>
</template>

<script>
import SpotifyPlayer from '@/components/SpotifyPlayer.vue';
import { spotifyController } from '@/utils/SpotifyController.js';
import imageWorker from '@/worker/image/index.js';
import spotifyWorker from '@/worker/spotify/index.js';

export default {
    props: {
        selfie: undefined,
    },
    components: {
        SpotifyPlayer
    },
    computed: {
        getSelfieURL() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = this.selfie.width;
            canvas.height = this.selfie.height;
            context.putImageData(this.selfie, 0, 0);
            return canvas.toDataURL('image/png')
        },
    },
    mounted() {
        spotifyWorker.worker.onmessage = (event) => {
            const { error, result } = event.data;
            if (error) {
                const { status, message } = error;
                console.error(`${status}${status ? ': ' : null}${message}`);
            } else if (result && Object.keys(result).length > 0) {
                this.$refs.spotifyPlayer.play(result);
            } else {
                console.error('Result from Spotify Worker is empty.');
            }
        };
        imageWorker.worker.onmessage = (event) => {
            spotifyWorker.send({
                accessToken: spotifyController.accessToken,
                imageData: event.data,
            });
        };
        imageWorker.send(this.selfie);
    },
};
</script>

<style scoped>
    .transition-in {
        transform: scale(0);
        transform-origin: center center;
        animation: transition-in 0.2s ease-out forwards;
    }

    @keyframes transition-in {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
    }
</style>