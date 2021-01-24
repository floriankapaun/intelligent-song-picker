<template>
  <main class="w-limited p4">
    <h1 class="mb4">Data Privacy</h1>
    <p>Open the <router-link to="" @click.prevent="openCookieConsent">cookie-consent</router-link>.</p>
  </main>
</template>

<script>
  export default {
    methods: {
      openCookieConsent() {
        this.$emit('openCookieConsent');
      },
    },
  }
</script>