<template>
    <component-header @openCookieConsent="openCookieConsent" />
    <router-view @openCookieConsent="openCookieConsent" />
    <component-cookies ref="cookieConsent" />
</template>

<script>
import ComponentHeader from "@/components/Header.vue";
import ComponentCookies from "@/components/Cookies.vue";

export default {
    mounted() {
        const script = document.createElement("script");
        script.setAttribute("src", "https://eco-website.com/ping.min.js");
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    },
    components: {
        ComponentHeader,
        ComponentCookies,
    },
    methods: {
        openCookieConsent() {
            this.$refs.cookieConsent.openCookieModal();
        },
    },
};
</script>