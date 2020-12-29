<template>
    <take-selfie v-if="!selfie.img && !selfie.url" @tookSelfie="onTookSelfie" />
    <recommendation v-else :selfie="selfie" :spotify="spotify" @deleteSelfie="onDeleteSelfie" />
</template>

<script>
import TakeSelfie from '@/components/TakeSelfie.vue';
import Recommendation from '@/components/Recommendation.vue';
import spotify from '@/modules/spotify/index.js';

export default {
    data() {
        return {
            selfie: {
                img: undefined,
                url: undefined,
            },
            spotify,
        };
    },
    components: {
        TakeSelfie,
        Recommendation,
    },
    methods: {
        onTookSelfie(img, url) {
            this.selfie.img = img;
            this.selfie.url = url;
        },
        onDeleteSelfie() {
            this.selfie.img = null;
            this.selfie.url = null;
        },
    },
};
</script>