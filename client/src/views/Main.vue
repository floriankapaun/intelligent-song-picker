<template>
    <take-selfie v-if="!selfie" @tookSelfie="onTookSelfie" />
    <player v-else :selfie="selfie" @deleteSelfie="onDeleteSelfie" />
</template>

<script>
import TakeSelfie from '@/components/TakeSelfie.vue';
import Player from '@/components/Player.vue';

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
            console.log(selfie);
        },
        onDeleteSelfie() {
            this.selfie = null;
        },
    },
};

// import { spotifyController } from '@/utils/SpotifyController.js';
// import { faceLandmarksDetection } from '@/utils/FaceLandmarksDetection.js';
// import { deleteCookie } from '@/utils/utility.js';

// export default {
//     mounted() {
//         faceLandmarksDetection.init(this.$refs.video, this.$refs.canvas);
//     },
//     computed: {
//         userName() {
//             return spotifyController.user && spotifyController.user.display_name
//                 ? spotifyController.user.display_name
//                 : null;
//         }
//     },
//     methods: {
//         startPlayback() {
//             spotifyController.play();
//         },
//         stopPlayback() {
//             spotifyController.pause();
//         },
//         logout() {
//             deleteCookie('SPOTIFY_ACCESS_TOKEN');
//             deleteCookie('SPOTIFY_REFRESH_TOKEN');
//             deleteCookie('SPOTIFY_AUTH_ERROR');
//             // Cause page reload
//             this.$router.go();
//         },
//         refreshAccessToken() {
//             spotifyController.refreshAccessToken();
//         },
//     },
// };
</script>