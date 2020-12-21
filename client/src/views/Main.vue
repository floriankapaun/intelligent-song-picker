<template>
    <take-selfie v-if="!selfie" @tookSelfie="onTookSelfie" />
    <player v-else :selfie="selfie" @deleteSelfie="onDeleteSelfie" />
</template>

<script>
import TakeSelfie from '@/components/TakeSelfie.vue';
import Player from '@/components/Player.vue';
import { spotifyController } from '@/utils/SpotifyController.js';

export default {
    data() {
        return {
            selfie: undefined,
        };
    },
    components: {
        TakeSelfie,
        Player,
    },
    methods: {
        onTookSelfie(selfie) {
            this.selfie = selfie;
        },
        onDeleteSelfie() {
            this.selfie = null;
        },
        startPlayback() {
            spotifyController.play();
        },
        stopPlayback() {
            spotifyController.pause();
        },
        refreshAccessToken() {
            spotifyController.refreshAccessToken();
        },
    },
};
</script>