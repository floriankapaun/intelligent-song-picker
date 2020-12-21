<template>
    <div>
        <div class="fullscreen-background_wrapper">
            <img :src="getSelfieURL" :class="selfie ? 'transition-in' : 'hidden'" alt="your selfie">
        </div>
        <button @click="$emit('deleteSelfie')">New selfie</button>
    </div>
</template>

<script>
import imageWorker from '@/worker/image/index.js';

export default {
    props: {
        selfie: undefined,
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
        imageWorker.worker.onmessage = event => {
            console.log(event.data);
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