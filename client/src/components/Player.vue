<template>
    <div>
        <div class="fullscreen-background_wrapper">
            <img :src="getSelfieURL" :class="selfie ? 'transition-in' : 'hidden'" alt="your selfie">
        </div>
        <button @click="$emit('deleteSelfie')">New selfie</button>
    </div>
</template>

<script>
export default {
    props: {
        selfie: undefined,
    },
    methods: {
        getPixelIndex(x, y) {
            // Given the x, y index, return what position it should be in a 1d array
            return (x + y * this.selfie.width) * 4;
        },
        clamp(value) {
            // Ensure value remain in RGB, 0 - 255
            return Math.max(0, Math.min(Math.floor(value), 255));
        },
        getValue(x, y, offset) {
            const index = this.getPixelIndex(x, y) + offset;
            return this.selfie.data[index];
        },
        setValue(x, y, offset, value) {
            const index = this.getPixelIndex(x, y) + offset;
            const currentValue = this.selfie.data[index];
            this.selfie.data[index] = this.clamp(currentValue + value);
        },
        byteToPercentage(byteValue) {
            return byteValue / 256 * 100;
        },
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
        // The image is stored as a 1d array with red first, then green, and blue 
        const R_OFFSET = 0;
        const G_OFFSET = 1;
        const B_OFFSET = 2;

        const pixelSum = this.selfie.width * this.selfie.height;
        let sum = {
            R: 0,
            G: 0,
            B: 0,
        };

        for (let x = 0; x < this.selfie.width; x++) {
            for (let y = 0; y < this.selfie.height; y++) {
                sum.R += this.getValue(x, y, R_OFFSET);
                sum.G += this.getValue(x, y, G_OFFSET);
                sum.B += this.getValue(x, y, B_OFFSET);
            }
        }

        const brightness = (sum.R + sum.G + sum.B) / (pixelSum * 3);
        console.log(brightness);

        console.log(this.byteToPercentage(brightness), '%');

        console.log(sum, sum.R / pixelSum, sum.G / pixelSum, sum.B / pixelSum);
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