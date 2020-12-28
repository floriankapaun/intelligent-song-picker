<template>
    <main class="p4">
        <h1 class="mb4">Sad to see you go...</h1>
        <p class="mb3">Wait while getting logged out.</p>
        <p>You'll be redirected automatically.</p>
    </main>
</template>

<script>
import { deleteCookie } from '@/utils/utility.js';

export default {
    methods: {
        logout() {
            deleteCookie('SPOTIFY_ACCESS_TOKEN');
            deleteCookie('SPOTIFY_REFRESH_TOKEN');
            deleteCookie('SPOTIFY_AUTH_ERROR');
            // Cause page reload
            this.$router.go();
            // TODO: Trigger player.disconnect() on logout to remove the spotify player instance from account
        },
    },
    created() {
        this.logout();
    },
}
</script>