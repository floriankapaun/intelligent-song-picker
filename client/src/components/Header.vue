<template>
    <header>
        <router-link to="/player">ARBEITSTITEL</router-link>
        <button type="button">NAV</button>
        <button type="button" @click="logout">Logout</button>
    </header>
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
};
</script>

<style lang="scss" scoped>
header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>