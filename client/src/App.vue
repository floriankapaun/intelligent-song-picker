<template>
    <component-header />
    <router-view />
</template>

<script>
import ComponentHeader from '@/components/Header.vue';

export default {
    components: {
        ComponentHeader,
    },
}
</script>