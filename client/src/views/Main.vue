<template>
    <take-selfie v-if="!selfie && !selfieURL" @tookSelfie="onTookSelfie" />
    <recommendation v-else :selfie="selfie" :selfieURL="selfieURL" @deleteSelfie="onDeleteSelfie" />
</template>

<script>
import TakeSelfie from '@/components/TakeSelfie.vue';
import Recommendation from '@/components/Recommendation.vue';

export default {
    data() {
        return {
            selfie: undefined,
            selfieURL: undefined,
        };
    },
    components: {
        TakeSelfie,
        Recommendation,
    },
    methods: {
        onTookSelfie(img, url) {
            this.selfie = img;
            this.selfieURL = url;
        },
        onDeleteSelfie() {
            this.selfie = null;
            this.selfieURL = null;
        },
    },
};
</script>