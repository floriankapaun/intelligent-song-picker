<template>
    <component-header @openCookieConsent="openCookieConsent" />
    <router-view @openCookieConsent="openCookieConsent" />
    <component-cookies ref="cookieConsent" />
</template>

<script>
import ComponentHeader from '@/components/Header.vue';
import ComponentCookies from '@/components/Cookies.vue';

export default {
    components: {
        ComponentHeader,
        ComponentCookies,
    },
    methods: {
        openCookieConsent() {
            this.$refs.cookieConsent.openCookieModal();
        },
    }
}
</script>